/* ==========================================================================
   SATARK AI - CITIZEN-ADMIN BRIDGE MODULE
   Connects the Citizen Portal to the Admin Portal via:
   1. Shared localStorage keys (civic_complaints, civic_notifications, etc.)
   2. BroadcastChannel API ("satark_bridge") for real-time cross-tab messaging
   ========================================================================== */

const CHANNEL_NAME = 'satark_bridge';
const SHARED_COMPLAINTS_KEY = 'civic_complaints';
const SHARED_NOTIFICATIONS_KEY = 'civic_notifications';
const SHARED_AUDIT_KEY = 'civic_audit_logs';

// ── Category → DepartmentId mapping (aligns with Admin Portal seed data) ──
const DEPT_ID_MAP = {
    'Road / Pothole':               'dept-roads',
    'Streetlight / Electrical':     'dept-electricity',
    'Garbage / Waste':              'dept-sanitation',
    'Water Leakage / Water Supply': 'dept-water',
    'Drainage / Sewerage':          'dept-drainage',
    'Park / Tree':                  'dept-parks',
    'Other Civic Issue':            'dept-general'
};

// ── Priority mapping ──
const PRIORITY_MAP = {
    'Critical': 'URGENT',
    'High':     'HIGH',
    'Medium':   'MEDIUM',
    'Low':      'LOW'
};

// ── Severity mapping based on priority ──
const SEVERITY_MAP = {
    'Critical': 'CRITICAL',
    'High':     'HIGH',
    'Medium':   'MEDIUM',
    'Low':      'LOW'
};

/**
 * Transforms a citizen-portal complaint object into one compatible with the
 * Admin Portal schema so both portals share the same localStorage record.
 * All citizen-specific fields are preserved unchanged.
 */
export function enrichComplaintForAdmin(citizenComplaint) {
    const cat = citizenComplaint.category || 'Other Civic Issue';
    const pri = citizenComplaint.priority || 'Medium';
    const aiConf = citizenComplaint.aiPrediction?.confidence || 85;

    // SLA: 24h for critical/high, 48h for medium, 72h for low
    const slaHours = (pri === 'Critical' || pri === 'High') ? 24 : (pri === 'Medium' ? 48 : 72);
    const slaDeadline = new Date(Date.now() + slaHours * 60 * 60 * 1000).toISOString();

    return {
        // ── Admin-required fields ──
        citizenDescription: citizenComplaint.originalDescription || citizenComplaint.normalizedDescription || '',
        imageUrl: citizenComplaint.image || '',
        latitude: citizenComplaint.location?.lat || 0,
        longitude: citizenComplaint.location?.lng || 0,
        address: citizenComplaint.location?.address || '',
        departmentId: DEPT_ID_MAP[cat] || 'dept-general',
        severity: SEVERITY_MAP[pri] || 'MEDIUM',
        priority: PRIORITY_MAP[pri] || 'MEDIUM',
        aiConfidence: aiConf,
        aiReason: `Citizen submitted complaint. AI categorized as "${cat}" with ${aiConf}% confidence.`,
        aiReasoningPoints: [
            `Category matched: ${cat}`,
            `Department auto-routed to: ${citizenComplaint.recommendedDepartment || 'General Grievance Cell'}`,
            citizenComplaint.aiPrediction?.categoryModified ? 'Citizen overrode AI category suggestion.' : 'AI category accepted by citizen.',
            citizenComplaint.aiPrediction?.priorityModified ? 'Citizen overrode AI priority suggestion.' : 'AI priority accepted by citizen.'
        ],
        slaDeadline,
        overrideLogs: [],
        comments: [
            {
                id: `comm-citizen-submit-${Date.now()}`,
                userId: citizenComplaint.citizenId || 'unknown',
                userName: 'Citizen Portal',
                userRole: 'OFFICER',
                text: `Complaint submitted by citizen (ID: ${citizenComplaint.citizenId}). Original language: ${citizenComplaint.originalLanguage || 'English'}.`,
                createdAt: new Date().toISOString()
            }
        ],
        // ── Keep all citizen-specific fields intact ──
        ...citizenComplaint,
        // ── Override status so both portals see the same initial state ──
        status: 'REPORTED'
    };
}

/**
 * Writes a new admin-side notification to shared localStorage so the
 * Admin Portal's NotificationContext picks it up on its next poll cycle.
 */
function writeAdminNotification(title, message, type, complaintId) {
    const data = localStorage.getItem(SHARED_NOTIFICATIONS_KEY);
    const notifications = data ? JSON.parse(data) : [];

    const newNotif = {
        id: `notif-bridge-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        title,
        message,
        type,
        complaintId,
        read: false,
        createdAt: new Date().toISOString()
    };

    notifications.unshift(newNotif);
    localStorage.setItem(SHARED_NOTIFICATIONS_KEY, JSON.stringify(notifications));
    return newNotif;
}

/**
 * Writes an audit log entry to shared localStorage.
 */
function writeAuditLog(action, complaintId, details) {
    const data = localStorage.getItem(SHARED_AUDIT_KEY);
    const logs = data ? JSON.parse(data) : [];

    logs.unshift({
        id: `log-bridge-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        userId: 'citizen-portal',
        userName: 'Citizen Portal Bridge',
        userRole: 'OFFICER',
        action,
        complaintId,
        newValue: details
    });

    localStorage.setItem(SHARED_AUDIT_KEY, JSON.stringify(logs));
}

/* ══════════════════════════════════════════════════════════════════════════
   CITIZEN BRIDGE — Publisher & Listener
   ══════════════════════════════════════════════════════════════════════════ */
export const CitizenBridge = {
    _channel: null,

    /**
     * Initialise the BroadcastChannel and start listening for Admin updates.
     * Call once on app load.
     */
    init(onAdminUpdate) {
        if (!('BroadcastChannel' in window)) {
            console.warn('[CitizenBridge] BroadcastChannel not supported in this browser.');
            return;
        }

        this._channel = new BroadcastChannel(CHANNEL_NAME);

        this._channel.addEventListener('message', (event) => {
            const { type, payload } = event.data || {};

            if (type === 'ADMIN_STATUS_UPDATE') {
                // Admin changed a complaint status — update the citizen's complaint in localStorage
                this._applyAdminStatusUpdate(payload);
                if (typeof onAdminUpdate === 'function') {
                    onAdminUpdate(payload);
                }
            }

            if (type === 'ADMIN_OFFICER_ASSIGNED') {
                this._applyAdminStatusUpdate(payload);
                if (typeof onAdminUpdate === 'function') {
                    onAdminUpdate(payload);
                }
            }
        });

        console.log('[CitizenBridge] Listening for admin updates on channel "satark_bridge".');
    },

    /**
     * Called when a citizen submits a new complaint.
     * 1. Enriches the complaint with admin-compatible fields
     * 2. Overwrites the localStorage record with the enriched version
     * 3. Publishes a NEW_COMPLAINT event so the Admin portal gets a live notification
     * 4. Writes an admin notification directly to localStorage as a fallback
     */
    publishNewComplaint(citizenComplaint) {
        // Step 1: Enrich and overwrite the complaint in localStorage
        const enriched = enrichComplaintForAdmin(citizenComplaint);
        const allComplaints = JSON.parse(localStorage.getItem(SHARED_COMPLAINTS_KEY) || '[]');
        const idx = allComplaints.findIndex(c => c.id === enriched.id);
        if (idx > -1) {
            allComplaints[idx] = enriched;
        } else {
            allComplaints.unshift(enriched);
        }
        localStorage.setItem(SHARED_COMPLAINTS_KEY, JSON.stringify(allComplaints));

        // Step 2: Write admin notification to shared localStorage
        const notification = writeAdminNotification(
            '🆕 New Complaint Submitted',
            `Complaint ${citizenComplaint.id} (${citizenComplaint.category}) filed at ${citizenComplaint.location?.address || 'unknown location'}. Priority: ${citizenComplaint.priority}.`,
            'NEW_COMPLAINT',
            citizenComplaint.id
        );

        // Step 3: Write audit log
        writeAuditLog(
            'CITIZEN_SUBMITTED_COMPLAINT',
            citizenComplaint.id,
            `Category: ${citizenComplaint.category}, Priority: ${citizenComplaint.priority}`
        );

        // Step 4: Build the cross-portal payload (full data needed because
        // each port has its own isolated localStorage bucket)
        const crossPortalPayload = {
            type: 'SATARK_NEW_COMPLAINT',
            complaint: enriched,
            notification: {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                complaintId: notification.complaintId,
                read: false,
                createdAt: notification.createdAt
            }
        };

        // Step 5: PRIMARY — POST to the bridge relay server (port 3001).
        // The admin portal listens via SSE and gets this instantly.
        // This works regardless of window.opener browser security policy.
        fetch('http://localhost:3001/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(crossPortalPayload)
        }).then(r => {
            console.log(`[CitizenBridge] Relay POST success → ${r.status}`);
        }).catch(e => {
            console.warn('[CitizenBridge] Relay POST failed (is relay server running?):', e.message);
        });

        // Step 6: FALLBACK — postMessage to window.opener (if admin opened this tab)
        if (window.opener && !window.opener.closed) {
            try {
                window.opener.postMessage(crossPortalPayload, '*');
                console.log('[CitizenBridge] postMessage → window.opener (admin portal).');
            } catch (e) {
                console.warn('[CitizenBridge] postMessage to opener failed:', e);
            }
        }

        // Step 7: FALLBACK — BroadcastChannel (same-origin only)
        if (this._channel) {
            this._channel.postMessage({
                type: 'NEW_COMPLAINT',
                payload: {
                    complaintId: citizenComplaint.id,
                    category: citizenComplaint.category,
                    priority: citizenComplaint.priority,
                    address: citizenComplaint.location?.address,
                    citizenId: citizenComplaint.citizenId,
                    timestamp: new Date().toISOString()
                }
            });
        }

        console.log(`[CitizenBridge] Published new complaint ${citizenComplaint.id} to admin portal.`);
    },



    /**
     * Applies an admin-initiated status update to the citizen-side localStorage.
     * Also fires a citizen notification and dispatches DOM events.
     */
    _applyAdminStatusUpdate(payload) {
        const { complaintId, newStatus, officerName, message, citizenId } = payload;

        // Update the complaint in localStorage
        const allComplaints = JSON.parse(localStorage.getItem(SHARED_COMPLAINTS_KEY) || '[]');
        const idx = allComplaints.findIndex(c => c.id === complaintId);

        if (idx > -1) {
            const comp = allComplaints[idx];
            const oldStatus = comp.status;

            // Map admin statuses to citizen statuses
            const adminToCitizenStatus = {
                'REPORTED':             'SUBMITTED',
                'AI_ANALYZED':          'RECEIVED',
                'ROUTED':               'DEPARTMENT_ASSIGNED',
                'ASSIGNED':             'OFFICER_ASSIGNED',
                'ACKNOWLEDGED':         'OFFICER_ASSIGNED',
                'IN_PROGRESS':          'WORK_IN_PROGRESS',
                'RESOLUTION_SUBMITTED': 'WORK_COMPLETED',
                'VERIFICATION_FAILED':  'WORK_IN_PROGRESS',
                'RESOLVED':             'RESOLVED'
            };

            const citizenStatus = adminToCitizenStatus[newStatus] || newStatus;
            comp.status = citizenStatus;
            comp.lastUpdated = new Date().toISOString();

            // Append to statusHistory
            if (!comp.statusHistory) comp.statusHistory = [];
            comp.statusHistory.push({
                status: citizenStatus,
                timestamp: new Date().toISOString(),
                description: message || `Status updated by admin to ${newStatus}.`,
                role: officerName ? 'OFFICER' : 'ADMIN',
                officerName: officerName || null
            });

            allComplaints[idx] = comp;
            localStorage.setItem(SHARED_COMPLAINTS_KEY, JSON.stringify(allComplaints));

            // Write citizen notification
            const notifKey = `notifications_${citizenId || comp.citizenId}`;
            const existingNotifs = JSON.parse(localStorage.getItem(notifKey) || '[]');
            const notif = {
                id: 'NOTIF-BRIDGE-' + Math.floor(100000 + Math.random() * 900000),
                title: `Complaint Update: ${citizenStatus.replace(/_/g, ' ')}`,
                message: message || `Your complaint ${complaintId} status has been updated.`,
                complaintId,
                timestamp: new Date().toISOString(),
                read: false
            };
            existingNotifs.unshift(notif);
            localStorage.setItem(notifKey, JSON.stringify(existingNotifs));

            // Dispatch citizen-side DOM events for live UI refresh
            window.dispatchEvent(new CustomEvent('civic_notification_received', { detail: notif }));
            window.dispatchEvent(new CustomEvent('civic_status_updated', { detail: { complaintId, status: citizenStatus } }));

            console.log(`[CitizenBridge] Applied admin update: ${complaintId} ${oldStatus} → ${citizenStatus}`);
        }
    },

    destroy() {
        if (this._channel) {
            this._channel.close();
            this._channel = null;
        }
    }
};

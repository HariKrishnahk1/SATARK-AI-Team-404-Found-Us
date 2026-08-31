import {
    AuthService,
    ComplaintService,
    LocationService,
    ImageValidationService,
    AIService,
    DuplicateService,
    TranslationService,
    NotificationService,
    TrackingService,
    DemoService
} from './services.js';
import { CitizenBridge } from './bridge.js';

// Global App State
const AppState = {
    currentUser: null,
    activeScreen: 'login',
    activeComplaintId: null,
    
    // Grievance Reporting State
    reporting: {
        lat: null,
        lng: null,
        address: '',
        image: null, // base64 representation
        originalText: '',
        normalizedText: '',
        detectedLanguage: 'English',
        aiPrediction: null,
        reviewedCategory: '',
        reviewedPriority: '',
        reviewedDepartment: '',
        reviewedByCitizen: false,
        duplicateReviewed: false
    },
    
    // Maps instances
    reportMap: null,
    reportMarker: null,
    detailsMap: null,
    detailsMarker: null,
    
    // Simulation Tick interval
    simulationInterval: null
};

// Default Sample Images for Demo Usability
const SAMPLE_IMAGE_CIVIC = "https://images.unsplash.com/photo-1599740831119-ac0a55099302?q=80&w=600"; // pothole
const SAMPLE_IMAGE_FOOD = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600"; // food plate

/* ==========================================================================
   DOM ELEMENTS & INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    // Refresh Icon definitions
    lucide.createIcons();
    
    // Load existing user session
    AppState.currentUser = AuthService.getCurrentUser();
    if (AppState.currentUser) {
        // Initialize dashboard environment
        DemoService.loadSamples(AppState.currentUser.id);
        setupDashboard();
        showScreen('dashboard');
    } else {
        showScreen('login');
    }

    initEventHandlers();
    initDemoConsole();
    
    // Start background status simulation ticker (runs every 30 seconds)
    startBackgroundSimulation();

    // ── BRIDGE: Initialize cross-portal communication ──
    CitizenBridge.init((adminPayload) => {
        // Called when admin updates a complaint status
        const { complaintId, newStatus, message } = adminPayload;
        console.log(`[CitizenBridge] Admin updated complaint ${complaintId} → ${newStatus}`);

        // If citizen is on dashboard or complaint details, refresh the UI
        if (AppState.activeScreen === 'dashboard') {
            setupDashboard();
        }
        if (AppState.activeScreen === 'complaint-details' && AppState.activeComplaintId === complaintId) {
            setupComplaintDetailsScreen(complaintId);
        }
        updateNotificationIconBadge();

        // Show an in-app toast notification for the status update
        showToast(`🔔 Your complaint ${complaintId} was updated: ${(newStatus || '').replace(/_/g, ' ')}`);
    });
});

/* ==========================================================================
   NAVIGATION & ROUTING
   ========================================================================== */
function showScreen(screenId) {
    AppState.activeScreen = screenId;
    
    // Toggle screens visibility
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    const targetScreen = document.getElementById(`screen-${screenId}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    // Toggle Header and bottom nav bar visibility based on auth status
    const header = document.getElementById('app-header');
    const mobileNav = document.getElementById('mobile-navigation-bar');
    
    if (screenId === 'login' || screenId === 'register') {
        header.style.display = 'none';
        mobileNav.style.display = 'none';
    } else {
        header.style.display = 'block';
        
        // Show bottom navigation bar on smaller viewports
        if (window.innerWidth <= 768) {
            mobileNav.style.display = 'block';
        } else {
            mobileNav.style.display = 'none';
        }
        
        // Update notification badges
        updateNotificationIconBadge();
    }

    // Highlight Active Nav Bar Item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    let activeNavItem = null;
    if (screenId === 'dashboard') activeNavItem = document.getElementById('mob-nav-dash');
    if (screenId === 'report-problem') activeNavItem = document.getElementById('mob-nav-report');
    if (screenId === 'notifications') activeNavItem = document.getElementById('mob-nav-notif');
    if (screenId === 'profile') activeNavItem = document.getElementById('mob-nav-profile');
    
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }

    // Window scroll reset
    window.scrollTo(0, 0);
    
    // Trigger map invalidations
    if (screenId === 'report-problem' && AppState.reportMap) {
        setTimeout(() => AppState.reportMap.invalidateSize(), 200);
    }
}

/* ==========================================================================
   EVENT HANDLERS & BINDINGS
   ========================================================================== */
function initEventHandlers() {
    // Navigation Action Bindings
    document.getElementById('header-logo-trigger').addEventListener('click', () => {
        if (AppState.currentUser) showScreen('dashboard');
    });
    
    document.getElementById('header-profile-btn').addEventListener('click', () => {
        setupProfileScreen();
        showScreen('profile');
    });
    
    document.getElementById('header-notif-btn').addEventListener('click', () => {
        setupNotificationsScreen();
        showScreen('notifications');
    });
    
    document.getElementById('logout-btn').addEventListener('click', () => {
        AuthService.logout();
        AppState.currentUser = null;
        showScreen('login');
    });

    // Mobile Navigation Bar Bindings
    document.getElementById('mob-nav-dash').addEventListener('click', () => showScreen('dashboard'));
    document.getElementById('mob-nav-report').addEventListener('click', () => startReportingWizard());
    document.getElementById('mob-nav-notif').addEventListener('click', () => {
        setupNotificationsScreen();
        showScreen('notifications');
    });
    document.getElementById('mob-nav-profile').addEventListener('click', () => {
        setupProfileScreen();
        showScreen('profile');
    });

    // Dashboard Actions
    document.getElementById('dash-report-btn').addEventListener('click', () => startReportingWizard());
    document.getElementById('dash-view-all-notifs').addEventListener('click', () => {
        setupNotificationsScreen();
        showScreen('notifications');
    });

    // 1. AUTH SCREEN EVENT LISTENERS
    document.getElementById('login-send-otp-btn').addEventListener('click', handleLoginSendOTP);
    document.getElementById('login-verify-otp-btn').addEventListener('click', handleLoginVerifyOTP);
    document.getElementById('login-quick-demo-btn').addEventListener('click', handleQuickDemoLogin);
    document.getElementById('login-otp-back-btn').addEventListener('click', () => {
        document.getElementById('auth-phone-state').style.display = 'block';
        document.getElementById('auth-otp-state').style.display = 'none';
    });
    document.getElementById('login-resend-btn').addEventListener('click', () => {
        const phone = document.getElementById('login-phone').value.trim();
        AuthService.sendOTP(phone);
        showToast("OTP sent successfully via SMS mock.");
        startOTPCountdown('login-resend-btn', 'otp-timer-box', 'otp-timer');
    });
    document.getElementById('go-to-register-link').addEventListener('click', (e) => {
        e.preventDefault();
        showScreen('register');
        startRegistrationFlow();
    });

    // Sample Chips Click Handler for 1-Click Problem Fill
    const chipsContainer = document.getElementById('sample-chips-container');
    if (chipsContainer) {
        chipsContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('.chip-btn');
            if (!btn) return;
            const sampleType = btn.getAttribute('data-sample');
            let sampleText = '';

            if (sampleType === 'subsidence') {
                sampleText = 'Frequent land subsidence and methane gas leaks detected near underground mining zones causing severe safety hazards to nearby residential settlements.';
            } else if (sampleType === 'lightning') {
                sampleText = 'High lightning flash density in rural agricultural blocks causing casualties during monsoon season. Need localized atmospheric early warning sirens.';
            } else if (sampleType === 'arsenic') {
                sampleText = 'Severe groundwater arsenic contamination detected in river basin villages causing public health crisis. Need decentralized low-cost filtration.';
            } else if (sampleType === 'coldstorage') {
                sampleText = 'Lack of off-grid cold storage infrastructure for organic farmers leading to 40% post-harvest crop spoilage. Need solar PCM micro-cold storage.';
            }

            const descArea = document.getElementById('desc-textarea');
            if (descArea && sampleText) {
                descArea.value = sampleText;
                descArea.dispatchEvent(new Event('input'));
                showToast("⚡ Quick Sample Challenge loaded into description!");
            }
        });
    }

    // OTP Input Autotab bindings
    const bindOtpAutotab = (prefix) => {
        for (let i = 1; i <= 4; i++) {
            const el = document.getElementById(`${prefix}-${i}`);
            if (el) {
                el.addEventListener('input', (event) => {
                    if (event.target.value.length === 1 && i < 4) {
                        document.getElementById(`${prefix}-${i+1}`).focus();
                    }
                });
                el.addEventListener('keydown', (event) => {
                    if (event.key === 'Backspace' && event.target.value.length === 0 && i > 1) {
                        document.getElementById(`${prefix}-${i-1}`).focus();
                    }
                });
            }
        }
    };
    bindOtpAutotab('otp');
    bindOtpAutotab('reg-otp');

    // 2. REGISTRATION EVENT LISTENERS
    document.getElementById('reg-cancel-btn').addEventListener('click', () => showScreen('login'));
    document.getElementById('reg-submit-details-btn').addEventListener('click', handleRegistrationSubmitDetails);
    document.getElementById('reg-verify-phone-btn').addEventListener('click', handleRegistrationVerifyPhone);
    document.getElementById('reg-complete-identity-btn').addEventListener('click', handleRegistrationCompleteIdentity);

    // 3. PROFILE SCREEN EVENT LISTENERS
    document.getElementById('profile-form').addEventListener('submit', handleProfileSave);

    // 4. REPORT GRIEVANCE WIZARD EVENT LISTENERS
    document.getElementById('wizard-cancel-header-btn').addEventListener('click', () => {
        if (confirm("Are you sure you want to cancel? Any unsaved edits will be discarded.")) {
            showScreen('dashboard');
        }
    });

    // Step 1: Location picker controls
    document.getElementById('loc-search-btn').addEventListener('click', handleLocationSearch);
    document.getElementById('loc-search-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLocationSearch();
    });
    document.getElementById('loc-current-btn').addEventListener('click', handleDetectGPSLocation);

    // Quick Location Chips Click Listener
    const locChipsContainer = document.getElementById('quick-loc-chips');
    if (locChipsContainer) {
        locChipsContainer.addEventListener('click', async (e) => {
            const btn = e.target.closest('.chip-btn');
            if (!btn) return;
            const lat = parseFloat(btn.getAttribute('data-lat'));
            const lng = parseFloat(btn.getAttribute('data-lng'));
            const name = btn.getAttribute('data-name');

            if (AppState.reportMap && AppState.reportMarker) {
                AppState.reportMap.setView([lat, lng], 16);
                AppState.reportMarker.setLatLng([lat, lng]);
                await handleLocationPinned(lat, lng);
                showToast(`📍 Pinned to ${name}`);
            }
        });
    }

    document.getElementById('w1-back').addEventListener('click', () => showScreen('dashboard'));
    document.getElementById('w1-next').addEventListener('click', () => navigateWizardStep(2));

    // Step 2: Photo verification controls
    const dropzone = document.getElementById('image-dropzone');
    dropzone.addEventListener('click', () => document.getElementById('image-file-input').click());
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--color-primary)';
    });
    dropzone.addEventListener('dragleave', () => {
        dropzone.style.borderColor = 'var(--color-border)';
    });
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--color-border)';
        if (e.dataTransfer.files.length > 0) {
            handleImageSelected(e.dataTransfer.files[0]);
        }
    });
    
    document.getElementById('image-file-input').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageSelected(e.target.files[0]);
        }
    });
    
    document.getElementById('btn-remove-image').addEventListener('click', handleRemoveImage);
    document.getElementById('btn-quality-retry').addEventListener('click', handleRemoveImage);
    document.getElementById('w2-back').addEventListener('click', () => navigateWizardStep(1));
    document.getElementById('w2-next').addEventListener('click', () => navigateWizardStep(3));

    // Step 3: Description & Voice controls
    const descArea = document.getElementById('desc-textarea');
    descArea.addEventListener('input', handleDescriptionInput);
    document.getElementById('mic-trigger-btn').addEventListener('click', handleVoiceRecordingToggle);
    document.getElementById('w3-back').addEventListener('click', () => navigateWizardStep(2));
    document.getElementById('w3-next').addEventListener('click', runAIChecksAndAnalysis);

    // Step 4: AI Results outputs controls
    document.getElementById('ai-recheck-back-btn').addEventListener('click', () => navigateWizardStep(3));
    document.getElementById('w4-back').addEventListener('click', () => navigateWizardStep(3));
    document.getElementById('w4-next').addEventListener('click', () => navigateWizardStep(5));

    // Step 5: Review & Submit controls
    document.getElementById('w5-back').addEventListener('click', () => navigateWizardStep(3)); // allow description edits
    document.getElementById('w5-submit').addEventListener('click', handleSubmitGrievance);
    
    // Category select dynamically changes assigned department automatically
    document.getElementById('rev-category-select').addEventListener('change', (e) => {
        const cat = e.target.value;
        const deptMap = {
            "Road / Pothole": "PWD / Roads Department",
            "Streetlight / Electrical": "Electrical Department",
            "Garbage / Waste": "Sanitation / Waste Management",
            "Water Leakage / Water Supply": "Water Supply Department",
            "Drainage / Sewerage": "Drainage & Sewerage Board",
            "Park / Tree": "Parks & Horticulture Department",
            "Other Civic Issue": "General Grievance Cell"
        };
        document.getElementById('rev-dept').innerText = deptMap[cat] || "General Grievance Cell";
    });

    // Step 6: Confirmation Screen controls
    document.getElementById('confirm-dash-btn').addEventListener('click', () => {
        setupDashboard();
        showScreen('dashboard');
    });
    document.getElementById('confirm-track-btn').addEventListener('click', () => {
        setupComplaintDetailsScreen(AppState.activeComplaintId);
        showScreen('complaint-details');
    });

    // 5. COMPLAINT DETAILS SCREEN EVENT LISTENERS
    document.getElementById('det-back-btn').addEventListener('click', () => {
        setupDashboard();
        showScreen('dashboard');
    });
    
    // Rating star clicks
    document.querySelectorAll('#feedback-stars span').forEach(span => {
        span.addEventListener('click', (e) => {
            const starVal = parseInt(e.target.getAttribute('data-star'), 10);
            updateStarsRatingUI(starVal);
        });
    });

    // Feedback solved toggle warning
    document.querySelectorAll('input[name="feedback-solved"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const reopenBox = document.getElementById('reopen-warning-box');
            if (e.target.value === 'No') {
                reopenBox.style.display = 'block';
            } else {
                reopenBox.style.display = 'none';
            }
        });
    });

    // Feedback Form Submission
    document.getElementById('feedback-form').addEventListener('submit', handleFeedbackSubmit);

    // 6. NOTIFICATION SCREEN EVENT LISTENERS
    document.getElementById('notif-mark-all-btn').addEventListener('click', () => {
        NotificationService.markAllAsRead(AppState.currentUser.id);
        setupNotificationsScreen();
        showToast("All notifications marked as read.");
    });

    // Listen to custom notification updates
    window.addEventListener('civic_notification_received', (e) => {
        const notif = e.detail;
        showToast(notif.message, notif);
        
        // Refresh views dynamically if currently looking at notifications/dashboard
        if (AppState.activeScreen === 'notifications') {
            setupNotificationsScreen();
        }
        if (AppState.activeScreen === 'dashboard') {
            setupDashboard();
        }
        updateNotificationIconBadge();
    });

    // Listen to custom ticket status shifts
    window.addEventListener('civic_status_updated', (e) => {
        const { complaintId } = e.detail;
        
        // If currently viewing details map, refresh
        if (AppState.activeScreen === 'complaint-details' && AppState.activeComplaintId === complaintId) {
            setupComplaintDetailsScreen(complaintId);
        }
        if (AppState.activeScreen === 'dashboard') {
            setupDashboard();
        }
        updateDemoTicketDropdown();
    });
}

/* ==========================================================================
   OTP RESEND COUNTDOWN TIMERS
   ========================================================================== */
function startOTPCountdown(btnId, boxId, timerId) {
    const btn = document.getElementById(btnId);
    const box = document.getElementById(boxId);
    const timer = document.getElementById(timerId);
    
    btn.style.display = 'none';
    box.style.display = 'block';
    
    let count = 30;
    timer.innerText = count;
    
    const interval = setInterval(() => {
        count--;
        timer.innerText = count;
        if (count <= 0) {
            clearInterval(interval);
            box.style.display = 'none';
            btn.style.display = 'inline-block';
        }
    }, 1000);
}

/* ==========================================================================
   1. AUTHENTICATION & LOGIN FLOW
   ========================================================================== */
function handleLoginSendOTP() {
    const phone = document.getElementById('login-phone').value.trim();
    if (!phone || phone.length < 10) {
        alert("Please enter a valid 10-digit phone number.");
        return;
    }
    
    const otp = AuthService.sendOTP(phone);
    
    // Transition to OTP verification panel
    document.getElementById('auth-phone-state').style.display = 'none';
    document.getElementById('auth-otp-state').style.display = 'block';
    
    startOTPCountdown('login-resend-btn', 'otp-timer-box', 'otp-timer');
    
    // Auto populate demo notice alert
    alert(`[DEMO SYSTEM] SMS OTP Sent to ${phone}. Enter code: ${otp} to verify.`);
    document.getElementById('otp-1').focus();
}

function handleLoginVerifyOTP() {
    const phone = document.getElementById('login-phone').value.trim();
    const digits = [
        document.getElementById('otp-1').value,
        document.getElementById('otp-2').value,
        document.getElementById('otp-3').value,
        document.getElementById('otp-4').value
    ].join('');

    if (digits.length < 4) {
        alert("Please enter the complete 4-digit code.");
        return;
    }

    try {
        const user = AuthService.verifyOTP(phone, digits);
        AppState.currentUser = user;
        
        // Setup initial samples for duplicate demonstrations
        DemoService.loadSamples(user.id);
        
        setupDashboard();
        showScreen('dashboard');
        showToast(`Welcome back, ${user.name}!`);
    } catch (e) {
        alert(e.message);
    }
}

function handleQuickDemoLogin() {
    const demoUser = {
        id: 'CIT-9872',
        name: 'Aniket Sharma',
        phone: '9876543210',
        email: 'aniket.citizen@domain.com',
        address: 'Ward 12, Kanke Road',
        city: 'Ranchi',
        district: 'Ranchi',
        state: 'Jharkhand',
        pinCode: '834001',
        verified: true
    };
    AuthService.setCurrentUser(demoUser);
    AppState.currentUser = demoUser;
    DemoService.loadSamples(demoUser.id);
    setupDashboard();
    showScreen('dashboard');
    showToast(`⚡ Quick Demo Login: Welcome, ${demoUser.name}!`);
}

/* ==========================================================================
   2. CITIZEN REGISTRATION FLOW
   ========================================================================== */
let tempRegisterUser = null;

function startRegistrationFlow() {
    tempRegisterUser = null;
    
    // Clear forms
    document.getElementById('reg-name').value = '';
    document.getElementById('reg-phone').value = '';
    document.getElementById('reg-email').value = '';
    document.getElementById('reg-address').value = '';
    document.getElementById('reg-pin').value = '';
    
    // Reset steps UI
    document.getElementById('reg-v1').className = 'v-step active';
    document.getElementById('reg-v2').className = 'v-step';
    document.getElementById('reg-v3').className = 'v-step';
    
    document.getElementById('reg-step-form').style.display = 'block';
    document.getElementById('reg-step-otp').style.display = 'none';
    document.getElementById('reg-step-identity').style.display = 'none';
}

function handleRegistrationSubmitDetails() {
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const address = document.getElementById('reg-address').value.trim();
    const city = document.getElementById('reg-city').value.trim();
    const district = document.getElementById('reg-district').value.trim();
    const state = document.getElementById('reg-state').value.trim();
    const pinCode = document.getElementById('reg-pin').value.trim();

    if (!name || !phone || !address || !city || !district || !state || !pinCode) {
        alert("Please fill all required registration details.");
        return;
    }

    tempRegisterUser = AuthService.register({
        name, phone, email, address, city, district, state, pinCode
    });

    // Advance verification UI
    document.getElementById('reg-v1').className = 'v-step completed';
    document.getElementById('reg-v2').className = 'v-step active';
    
    document.getElementById('reg-step-form').style.display = 'none';
    document.getElementById('reg-step-otp').style.display = 'block';
    
    // Send simulated SMS verification OTP
    const otp = AuthService.sendOTP(phone);
    alert(`[DEMO SYSTEM] SMS Verification OTP Sent to ${phone}. Enter code: ${otp}`);
    document.getElementById('reg-otp-1').focus();
}

function handleRegistrationVerifyPhone() {
    const digits = [
        document.getElementById('reg-otp-1').value,
        document.getElementById('reg-otp-2').value,
        document.getElementById('reg-otp-3').value,
        document.getElementById('reg-otp-4').value
    ].join('');

    if (digits.length < 4) {
        alert("Please enter the complete 4-digit code.");
        return;
    }

    const correctOtp = sessionStorage.getItem(`otp_${tempRegisterUser.phone}`);
    if (digits === correctOtp) {
        sessionStorage.removeItem(`otp_${tempRegisterUser.phone}`);
        
        // Proceed to Identity verification step
        document.getElementById('reg-v2').className = 'v-step completed';
        document.getElementById('reg-v3').className = 'v-step active';
        
        document.getElementById('reg-step-otp').style.display = 'none';
        document.getElementById('reg-step-identity').style.display = 'block';
        
        runIdentityVerificationChecks();
    } else {
        alert("Invalid OTP code. Please check and try again.");
    }
}

function runIdentityVerificationChecks() {
    const statusLabel = document.getElementById('id-verification-status-label');
    const statusText = document.getElementById('id-verification-status-text');
    const actionBtn = document.getElementById('reg-complete-identity-btn');
    
    statusLabel.innerHTML = `<span class="progress-spinner"></span> Verification in progress...`;
    statusText.className = "validation-status v-loading";
    statusText.innerText = "RUNNING";
    actionBtn.disabled = true;

    // Simulate identity registry response
    setTimeout(() => {
        statusLabel.innerHTML = `<i data-lucide="check-circle-2" class="v-pass"></i> Identity check complete. Address match confirmed.`;
        statusText.className = "validation-status v-pass";
        statusText.innerText = "PASSED";
        actionBtn.disabled = false;
        
        lucide.createIcons();
    }, 2000);
}

function handleRegistrationCompleteIdentity() {
    const verifiedCitizen = AuthService.verifyIdentity(tempRegisterUser);
    AppState.currentUser = verifiedCitizen;
    
    // Load default grievances
    DemoService.loadSamples(verifiedCitizen.id);
    
    setupDashboard();
    showScreen('dashboard');
    showToast(`Identity verified successfully. Welcome, ${verifiedCitizen.name}!`);
}

/* ==========================================================================
   3. DASHBOARD RENDER & ACTIONS
   ========================================================================== */
function setupDashboard() {
    if (!AppState.currentUser) return;
    
    // Set Profile UI elements
    document.getElementById('dash-user-id').innerText = AppState.currentUser.id;
    document.getElementById('dash-user-district').innerText = AppState.currentUser.district;

    // Load statistics
    const stats = ComplaintService.getStats(AppState.currentUser.id);
    document.getElementById('stat-total-val').innerText = stats.total;
    document.getElementById('stat-pending-val').innerText = stats.pending;
    document.getElementById('stat-active-val').innerText = stats.active;
    document.getElementById('stat-resolved-val').innerText = stats.resolved;

    // Render Mini Notification Side Bar
    renderMiniNotifications();

    // Render User Complaints list
    const activeFilter = document.querySelector('.filter-bar .filter-chip.active').getAttribute('data-filter');
    renderComplaintsList(activeFilter);

    // Setup Category filters chips click bindings
    document.querySelectorAll('.filter-bar .filter-chip').forEach(chip => {
        chip.replaceWith(chip.cloneNode(true)); // remove old listeners
    });
    
    document.querySelectorAll('.filter-bar .filter-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-bar .filter-chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            
            const filter = e.target.getAttribute('data-filter');
            renderComplaintsList(filter);
        });
    });
}

function renderMiniNotifications() {
    const list = NotificationService.getAll(AppState.currentUser.id).slice(0, 3);
    const container = document.getElementById('dash-notifications-mini');
    
    if (list.length === 0) {
        container.innerHTML = `<p style="font-size: 0.85rem; color: var(--text-muted);">No new notifications.</p>`;
        return;
    }

    container.innerHTML = list.map(n => `
        <div style="background-color: var(--color-bg-base); padding: 0.5rem; border-radius: var(--border-radius-sm); border-left: 3px solid ${n.read ? 'var(--color-border)' : 'var(--color-primary)'};">
            <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); display: flex; justify-content: space-between;">
                <span>${new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                ${!n.read ? `<span style="color: var(--color-info);">NEW</span>` : ''}
            </div>
            <div style="font-size: 0.85rem; font-weight: 600; margin-top: 0.15rem; color: var(--text-primary); cursor: pointer;" onclick="window.appNavigateToComplaint('${n.complaintId}')">
                ${n.title}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 0.15rem;">
                ${n.message}
            </div>
        </div>
    `).join('');
}

function renderComplaintsList(filter) {
    const list = ComplaintService.getAll();
    const container = document.getElementById('dashboard-complaints-list');
    
    // Filters based on User ownership or Supporter linkage
    const userList = list.filter(c => c.citizenId === AppState.currentUser.id || c.supporters.includes(AppState.currentUser.id));
    
    let filteredList = userList;
    if (filter === 'SUBMITTED') {
        filteredList = userList.filter(c => c.status === 'SUBMITTED' || c.status === 'RECEIVED');
    } else if (filter === 'ACTIVE') {
        filteredList = userList.filter(c => ['DEPARTMENT_ASSIGNED', 'OFFICER_ASSIGNED', 'WORK_SCHEDULED', 'WORK_IN_PROGRESS'].includes(c.status));
    } else if (filter === 'COMPLETED') {
        filteredList = userList.filter(c => c.status === 'WORK_COMPLETED' || c.status === 'VERIFICATION');
    } else if (filter === 'RESOLVED') {
        filteredList = userList.filter(c => c.status === 'RESOLVED');
    } else if (filter === 'REOPENED') {
        filteredList = userList.filter(c => c.status === 'REOPENED');
    }

    if (filteredList.length === 0) {
        container.innerHTML = `
            <div class="card" style="text-align: center; color: var(--text-muted); padding: 3rem 1.5rem;">
                <i data-lucide="clipboard-list" style="width: 48px; height: 48px; margin: 0 auto 1rem; opacity: 0.5;"></i>
                <p>No complaints matching the selected filter.</p>
            </div>
        `;
        lucide.createIcons();
        return;
    }

    container.innerHTML = filteredList.map(c => {
        const timeStr = formatTimeDifference(new Date(c.lastUpdated));
        const badgeClass = `status-${c.status.toLowerCase().replace(/_/g, '')}`;
        const priorityClass = `priority-${c.priority.toLowerCase()}`;
        const supporterBadge = c.supporters.includes(AppState.currentUser.id) ? 
            `<span style="margin-left: 0.5rem; background-color: rgba(99, 102, 241, 0.2); color: var(--color-primary); font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight:600;">Supported</span>` : '';
        
        return `
            <div class="card complaint-card" onclick="window.appNavigateToComplaint('${c.id}')">
                <div class="complaint-card-header">
                    <div>
                        <span class="complaint-id">${c.id}</span>
                        ${supporterBadge}
                    </div>
                    <span class="status-badge ${badgeClass}">${c.status.replace(/_/g, ' ')}</span>
                </div>
                <div class="complaint-card-body">
                    <h3>${c.originalDescription.slice(0, 75)}${c.originalDescription.length > 75 ? '...' : ''}</h3>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                        <strong>Location:</strong> ${c.location.address.slice(0, 100)}${c.location.address.length > 100 ? '...' : ''}
                    </div>
                </div>
                <div class="complaint-card-footer">
                    <div class="complaint-meta-item">
                        <span class="priority-indicator ${priorityClass}"></span>
                        <span>${c.priority} Priority</span>
                    </div>
                    <div class="complaint-meta-item">
                        <i data-lucide="clock" style="width: 12px; height: 12px;"></i>
                        <span>Last updated: ${timeStr}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

// Attach navigation helper globally
window.appNavigateToComplaint = (id) => {
    setupComplaintDetailsScreen(id);
    showScreen('complaint-details');
};

/* ==========================================================================
   4. GRIEVANCE REPORTING WIZARD
   ========================================================================== */
function startReportingWizard() {
    // Reset report state
    AppState.reporting = {
        lat: null,
        lng: null,
        address: '',
        image: null,
        originalText: '',
        normalizedText: '',
        detectedLanguage: 'English',
        aiPrediction: null,
        reviewedCategory: '',
        reviewedPriority: '',
        reviewedDepartment: '',
        reviewedByCitizen: false,
        duplicateReviewed: false
    };

    // Step UI forms
    document.getElementById('loc-address-display').innerText = "Click 'Detect My GPS Coordinates' or place pin on the map.";
    document.getElementById('loc-lat').innerText = '-';
    document.getElementById('loc-lng').innerText = '-';
    document.getElementById('loc-search-input').value = '';
    document.getElementById('w1-next').disabled = true;

    // Remove file inputs
    handleRemoveImage();

    // Reset details inputs
    document.getElementById('desc-textarea').value = '';
    document.getElementById('desc-char-count').innerText = '0 / 500 characters';
    document.getElementById('detected-lang-badge').style.display = 'none';
    document.getElementById('translation-preview-panel').style.display = 'none';
    document.getElementById('w3-next').disabled = true;

    // Reset AI screens
    document.getElementById('ai-checks-progress-panel').style.display = 'block';
    document.getElementById('ai-check-failure-alert').style.display = 'none';
    document.getElementById('ai-predicted-results-container').style.display = 'none';
    document.getElementById('w4-next').disabled = true;

    showScreen('report-problem');
    navigateWizardStep(1);
    
    // Initialize map frame
    setTimeout(() => {
        initReportingMap();
    }, 300);
}

function navigateWizardStep(stepNum) {
    // Show correct section wrapper
    for (let i = 1; i <= 6; i++) {
        const section = document.getElementById(`w-content-${i}`);
        if (section) {
            section.style.display = (i === stepNum) ? 'block' : 'none';
        }
        
        const indicator = document.getElementById(`wizard-step-${i}`);
        if (indicator) {
            indicator.className = 'wizard-step';
            if (i < stepNum) indicator.classList.add('completed');
            if (i === stepNum) indicator.classList.add('active');
        }
    }

    // Set step progress line width
    const progressPercent = ((stepNum - 1) / 4) * 100;
    document.getElementById('wizard-bar').style.width = `${progressPercent}%`;

    // Map refresh inside active screen panels
    if (stepNum === 1 && AppState.reportMap) {
        setTimeout(() => AppState.reportMap.invalidateSize(), 200);
    }
}

// STEP 1: Leaflet Interactive Map bindings
function initReportingMap() {
    const center = LocationService.getDemoCenter();
    
    if (!AppState.reportMap) {
        // Load clean dark mode layer & Esri Satellite layer
        const streetTiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        });

        const satelliteTiles = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri World Imagery'
        });

        // Init Map with layer controls
        AppState.reportMap = L.map('report-map', {
            center: [center.lat, center.lng],
            zoom: 16,
            layers: [streetTiles]
        });

        const darkCanvasTiles = L.layerGroup([
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16 }),
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', { maxZoom: 16 })
        ]);

        const baseMaps = {
            "🌙 Dark Street Map": streetTiles,
            "🏙️ Dark GIS Canvas": darkCanvasTiles,
            "🛰️ High-Res Satellite View": satelliteTiles
        };
        L.control.layers(baseMaps, null, { position: 'topright' }).addTo(AppState.reportMap);

        // Add Draggable marker
        AppState.reportMarker = L.marker([center.lat, center.lng], { draggable: true }).addTo(AppState.reportMap);
        
        // Listen to marker drag events
        AppState.reportMarker.on('dragend', () => {
            const pos = AppState.reportMarker.getLatLng();
            handleLocationPinned(pos.lat, pos.lng);
        });

        // Click map to change marker pin position
        AppState.reportMap.on('click', (e) => {
            AppState.reportMarker.setLatLng(e.latlng);
            handleLocationPinned(e.latlng.lat, e.latlng.lng);
        });
    } else {
        AppState.reportMap.setView([center.lat, center.lng], 16);
        AppState.reportMarker.setLatLng([center.lat, center.lng]);
    }
    
    handleLocationPinned(center.lat, center.lng);
}

async function handleLocationPinned(lat, lng, accuracyMeters = null, sourceName = null) {
    AppState.reporting.lat = lat;
    AppState.reporting.lng = lng;
    AppState.reporting.accuracy = accuracyMeters;
    
    document.getElementById('loc-lat').innerText = lat.toFixed(6);
    document.getElementById('loc-lng').innerText = lng.toFixed(6);
    document.getElementById('loc-address-display').innerText = "🔍 Resolving high-precision address details...";
    
    // Display Accuracy Badge
    const accuracyInfo = LocationService.getAccuracyLevel(accuracyMeters);
    const badgeEl = document.getElementById('loc-accuracy-badge');
    if (badgeEl) {
        badgeEl.className = `accuracy-badge ${accuracyInfo.badgeClass}`;
        badgeEl.innerHTML = `<span>${accuracyInfo.label}</span> <span class="accuracy-text">(${sourceName || accuracyInfo.text})</span>`;
        badgeEl.style.display = 'inline-flex';
    }

    // Query multi-provider address reverse code
    const address = await LocationService.reverseGeocode(lat, lng);
    AppState.reporting.address = address;
    document.getElementById('loc-address-display').innerText = address;
    
    // Enable confirm button
    document.getElementById('w1-next').disabled = false;
}

// Multi-Sample High-Precision Geolocation Triangulation Engine (Pinpoint < 2m accuracy)
function handleDetectGPSLocation() {
    const displayEl = document.getElementById('loc-address-display');
    const detectBtn = document.getElementById('loc-current-btn');
    
    if (!navigator.geolocation) {
        showToast("⚠️ Geolocation API not supported by browser. Trying IP network location...");
        fallbackToNetworkLocation();
        return;
    }
    
    if (detectBtn) detectBtn.disabled = true;
    if (displayEl) {
        displayEl.innerHTML = `<span class="loc-spin-icon">📡</span> <b>Triangulating GPS Satellites...</b> Sampling coordinates for maximum precision...`;
    }
    showToast(`📡 Activating High-Precision GPS Engine... Sampling satellites for pinpoint fix.`);

    const samples = [];
    let watchId = null;
    let sampleTimeout = null;

    const updateAccuracyCircle = (lat, lng, radius) => {
        if (!AppState.reportMap) return;
        if (AppState.reportAccuracyCircle) {
            AppState.reportAccuracyCircle.setLatLng([lat, lng]);
            AppState.reportAccuracyCircle.setRadius(radius);
        } else {
            AppState.reportAccuracyCircle = L.circle([lat, lng], {
                radius: radius,
                color: '#2563eb',
                fillColor: '#3b82f6',
                fillOpacity: 0.18,
                weight: 2,
                dashArray: '4, 4'
            }).addTo(AppState.reportMap);
        }
    };

    const finalizeBestFix = async () => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        if (sampleTimeout !== null) clearTimeout(sampleTimeout);
        if (detectBtn) detectBtn.disabled = false;

        if (samples.length === 0) {
            console.warn("No GPS samples captured, trying network fallback...");
            await fallbackToNetworkLocation();
            return;
        }

        // Filter sample with smallest accuracy radius in meters
        samples.sort((a, b) => a.accuracy - b.accuracy);
        const best = samples[0];
        
        const lat = best.lat;
        const lng = best.lng;
        const acc = best.accuracy;

        showToast(`🎯 Ultra-Precision Fix Locked! Precision: ±${acc.toFixed(1)}m (${samples.length} satellite samples evaluated)`);
        
        AppState.reportMap.setView([lat, lng], 19); // Max Zoom 19 for rooftop street precision
        AppState.reportMarker.setLatLng([lat, lng]);
        updateAccuracyCircle(lat, lng, acc);

        await handleLocationPinned(lat, lng, acc, `GPS Pinpoint Fix: ±${acc.toFixed(1)}m`);
    };

    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
    };

    // Continuous watchPosition over 4 seconds window to pick the highest accuracy sample
    watchId = navigator.geolocation.watchPosition(
        (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const acc = pos.coords.accuracy || 10;

            samples.push({ lat, lng, accuracy: acc, timestamp: pos.timestamp });
            
            // Live updates to marker & map
            AppState.reportMap.setView([lat, lng], 18);
            AppState.reportMarker.setLatLng([lat, lng]);
            updateAccuracyCircle(lat, lng, acc);

            if (displayEl) {
                displayEl.innerHTML = `<span class="loc-spin-icon">📡</span> <b>Satellite Lock Acquired:</b> Precision ±${acc.toFixed(1)}m (${samples.length} samples collected)`;
            }

            // Early exit if lock is under 3 meters
            if (acc <= 3 && samples.length >= 2) {
                finalizeBestFix();
            }
        },
        async (err) => {
            console.warn("Hardware GPS error or denied:", err.message);
            if (samples.length > 0) {
                await finalizeBestFix();
            } else {
                await fallbackToNetworkLocation();
            }
        },
        geoOptions
    );

    // Hard cutoff after 4.5 seconds to finalize best sample collected
    sampleTimeout = setTimeout(() => {
        if (samples.length > 0) {
            finalizeBestFix();
        }
    }, 4500);
}

// Fallback to Multi-Service IP Geolocation
async function fallbackToNetworkLocation() {
    const displayEl = document.getElementById('loc-address-display');
    const detectBtn = document.getElementById('loc-current-btn');
    if (detectBtn) detectBtn.disabled = false;

    if (displayEl) displayEl.innerText = "🌐 Locating area via Network IP Triangulation...";

    const ipLoc = await LocationService.fetchIpLocation();
    if (ipLoc) {
        const lat = ipLoc.lat;
        const lng = ipLoc.lng;
        showToast(`📍 Network Location Detected: ${ipLoc.city} (${ipLoc.provider})`);
        
        AppState.reportMap.setView([lat, lng], 17);
        AppState.reportMarker.setLatLng([lat, lng]);
        
        if (AppState.reportAccuracyCircle) {
            AppState.reportAccuracyCircle.setLatLng([lat, lng]);
            AppState.reportAccuracyCircle.setRadius(500);
        }
        
        await handleLocationPinned(lat, lng, 500, `Network IP Area: ${ipLoc.city}`);
        return;
    }

    // Town center safety fallback
    const fallback = LocationService.getDemoCenter();
    showToast("⚠️ GPS & Network lookup unavailable. Fallback to Ranchi center. Please click or drag marker on map.");
    AppState.reportMap.setView([fallback.lat, fallback.lng], 16);
    AppState.reportMarker.setLatLng([fallback.lat, fallback.lng]);
    await handleLocationPinned(fallback.lat, fallback.lng, 1000, 'Town Center Fallback');
}

// High-Precision Multi-Engine Location Address Search (Nominatim + Photon GIS Engine)
async function handleLocationSearch() {
    const rawInput = document.getElementById('loc-search-input').value.trim();
    if (!rawInput) return;

    // Normalize spelling variant: 'kageyam' -> 'Kangayam'
    let normalizedInput = rawInput.replace(/kageyam/gi, 'Kangayam').replace(/kangeyam/gi, 'Kangayam');
    
    document.getElementById('loc-address-display').innerText = `🔍 High-Precision GIS Search for "${normalizedInput}"...`;

    // Clear accuracy circle on manual text search
    if (AppState.reportAccuracyCircle) {
        AppState.reportMap.removeLayer(AppState.reportAccuracyCircle);
        AppState.reportAccuracyCircle = null;
    }

    // 1. Try Nominatim Geocoder API
    try {
        const query1 = encodeURIComponent(normalizedInput.includes('India') ? normalizedInput : `${normalizedInput}, Tamil Nadu, India`);
        const response1 = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query1}&limit=3`);
        if (response1.ok) {
            const results1 = await response1.json();
            if (results1.length > 0) {
                const lat = parseFloat(results1[0].lat);
                const lng = parseFloat(results1[0].lon);
                
                AppState.reportMap.setView([lat, lng], 18); // Zoom 18 for high precision street view
                AppState.reportMarker.setLatLng([lat, lng]);
                await handleLocationPinned(lat, lng, 5, 'GIS Search Engine');
                showToast(`🎯 Pinned to: ${results1[0].display_name.split(',')[0]}`);
                return;
            }
        }
    } catch (e) {
        console.warn("Nominatim lookup failed, falling back to Photon GIS", e);
    }

    // 2. Try Photon Komoot GIS Search Engine (Secondary High-Precision Engine)
    try {
        const query2 = encodeURIComponent(normalizedInput);
        const response2 = await fetch(`https://photon.komoot.io/api/?q=${query2}&limit=3`);
        if (response2.ok) {
            const data2 = await response2.json();
            if (data2.features && data2.features.length > 0) {
                const coords = data2.features[0].geometry.coordinates; // [lng, lat]
                const lng = coords[0];
                const lat = coords[1];
                const prop = data2.features[0].properties;
                const nameStr = prop.name || prop.street || prop.city || normalizedInput;

                AppState.reportMap.setView([lat, lng], 18);
                AppState.reportMarker.setLatLng([lat, lng]);
                await handleLocationPinned(lat, lng, 5, 'Photon GIS Engine');
                showToast(`🎯 Photon GIS Pinned to: ${nameStr}`);
                return;
            }
        }
    } catch (e) {
        console.warn("Photon lookup failed", e);
    }

    // 3. Fallback to Kangayam town center if user typed Kangayam/Kageyam
    if (normalizedInput.toLowerCase().includes('kangayam')) {
        const lat = 11.0051;
        const lng = 77.5645;
        AppState.reportMap.setView([lat, lng], 18);
        AppState.reportMarker.setLatLng([lat, lng]);
        await handleLocationPinned(lat, lng, 10, 'Kangayam Center');
        showToast("📍 Pinned directly to Kangayam, Tiruppur!");
        return;
    }

    alert(`Could not locate "${rawInput}". Try tapping the 'Kangayam / Kangeyam' chip or switch map to 'Satellite View' to click your house rooftop.`);
}

// STEP 2: Media uploads & Image Quality Validation + EXIF GPS Metadata Extraction
function handleImageSelected(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const base64 = e.target.result;
        AppState.reporting.image = base64;
        
        // Show preview panel
        document.getElementById('image-input-container').style.display = 'none';
        document.getElementById('image-preview-wrapper').style.display = 'block';
        document.getElementById('image-preview-img').src = base64;
        
        // Check for embedded EXIF photo location metadata
        try {
            const exifLoc = await LocationService.extractExifGps(file);
            if (exifLoc && exifLoc.lat && exifLoc.lng) {
                showToast(`📸 Photo EXIF GPS Detected: (${exifLoc.lat.toFixed(5)}, ${exifLoc.lng.toFixed(5)})`);
                
                // Show EXIF banner indicator on UI
                const exifBadge = document.getElementById('exif-location-notice');
                if (exifBadge) {
                    exifBadge.style.display = 'flex';
                    exifBadge.innerHTML = `
                        <span>📸 <b>EXIF Photo GPS Found:</b> Lat ${exifLoc.lat.toFixed(5)}, Lng ${exifLoc.lng.toFixed(5)}</span>
                        <button class="btn btn-sm btn-primary" id="btn-use-exif-loc" style="margin-left:auto; padding: 0.25rem 0.6rem; font-size: 0.75rem;">
                            Use Photo Location
                        </button>
                    `;
                    document.getElementById('btn-use-exif-loc')?.addEventListener('click', async () => {
                        AppState.reportMap.setView([exifLoc.lat, exifLoc.lng], 19);
                        AppState.reportMarker.setLatLng([exifLoc.lat, exifLoc.lng]);
                        await handleLocationPinned(exifLoc.lat, exifLoc.lng, 1.5, 'EXIF Photo Metadata');
                        showToast('🎯 Location updated from Photo EXIF GPS!');
                        navigateWizardStep(1); // Jump to location step to confirm
                    });
                }
            }
        } catch (exifErr) {
            console.warn("EXIF extraction notice:", exifErr);
        }

        // Trigger verification animation checklist
        runImageQualityChecks(file);
    };
    reader.readAsDataURL(file);
}

function handleRemoveImage() {
    AppState.reporting.image = null;
    document.getElementById('image-file-input').value = '';
    
    document.getElementById('image-input-container').style.display = 'block';
    document.getElementById('image-preview-wrapper').style.display = 'none';
    document.getElementById('image-preview-img').src = '';
    
    document.getElementById('image-quality-panel').style.display = 'none';
    document.getElementById('image-failure-alert').style.display = 'none';
    document.getElementById('w2-next').disabled = true;
}

// Runs validation checkpoints sequential steps
async function runImageQualityChecks(file) {
    const panel = document.getElementById('image-quality-panel');
    const failureAlert = document.getElementById('image-failure-alert');
    const nextBtn = document.getElementById('w2-next');
    
    panel.style.display = 'block';
    failureAlert.style.display = 'none';
    nextBtn.disabled = true;
    
    // Checklist DOM elements
    const formatLabel = document.getElementById('check-format-label');
    const formatStatus = document.getElementById('check-format-status');
    const resLabel = document.getElementById('check-res-label');
    const resStatus = document.getElementById('check-res-status');
    const brightLabel = document.getElementById('check-bright-label');
    const brightStatus = document.getElementById('check-bright-status');
    const blurLabel = document.getElementById('check-blur-label');
    const blurStatus = document.getElementById('check-blur-status');

    // Reset classes
    const setPending = (lbl, stat, labelText) => {
        lbl.innerHTML = `<span class="progress-spinner"></span> ${labelText}`;
        stat.className = "validation-status v-loading";
        stat.innerText = "PENDING";
    };
    
    setPending(formatLabel, formatStatus, "Checking image format");
    setPending(resLabel, resStatus, "Checking resolution details");
    setPending(brightLabel, brightStatus, "Checking brightness levels");
    setPending(blurLabel, blurStatus, "Checking blur clarity");

    // Start verification triggers
    const results = await ImageValidationService.validateImage(file);
    
    // Step 1: Format check (instant)
    await delay(600);
    if (results.format) {
        formatLabel.innerHTML = `<i data-lucide="check-circle-2" class="v-pass"></i> Image format valid`;
        formatStatus.className = "validation-status v-pass";
        formatStatus.innerText = "✓ PASS";
    } else {
        formatLabel.innerHTML = `<i data-lucide="x-circle" class="v-fail"></i> Format invalid`;
        formatStatus.className = "validation-status v-fail";
        formatStatus.innerText = "✕ FAIL";
    }
    lucide.createIcons();

    // Step 2: Resolution check
    await delay(600);
    if (results.resolution) {
        resLabel.innerHTML = `<i data-lucide="check-circle-2" class="v-pass"></i> Resolution acceptable`;
        resStatus.className = "validation-status v-pass";
        resStatus.innerText = "✓ PASS";
    } else {
        resLabel.innerHTML = `<i data-lucide="x-circle" class="v-fail"></i> Image too small`;
        resStatus.className = "validation-status v-fail";
        resStatus.innerText = "✕ FAIL";
    }
    lucide.createIcons();

    // Step 3: Brightness check
    await delay(600);
    if (results.brightness) {
        brightLabel.innerHTML = `<i data-lucide="check-circle-2" class="v-pass"></i> Brightness acceptable`;
        brightStatus.className = "validation-status v-pass";
        brightStatus.innerText = "✓ PASS";
    } else {
        brightLabel.innerHTML = `<i data-lucide="x-circle" class="v-fail"></i> Under/over exposed`;
        brightStatus.className = "validation-status v-fail";
        brightStatus.innerText = "✕ FAIL";
    }
    lucide.createIcons();

    // Step 4: Blur check
    await delay(600);
    if (results.blur) {
        blurLabel.innerHTML = `<i data-lucide="check-circle-2" class="v-pass"></i> Image sufficiently clear`;
        blurStatus.className = "validation-status v-pass";
        blurStatus.innerText = "✓ PASS";
    } else {
        blurLabel.innerHTML = `<i data-lucide="x-circle" class="v-fail"></i> Image too blurry`;
        blurStatus.className = "validation-status v-fail";
        blurStatus.innerText = "✕ FAIL";
    }
    lucide.createIcons();

    // Complete checklist evaluation
    document.getElementById('quality-spinner').style.display = 'none';
    
    if (results.valid) {
        document.getElementById('quality-header-title').innerText = "✓ Image Validation Passed";
        nextBtn.disabled = false;
    } else {
        document.getElementById('quality-header-title').innerText = "✕ Validation Failed";
        
        let reason = "The uploaded image does not meet our system quality guidelines.";
        if (!results.blur) reason = "The image is too blurry. Please capture another photo under stable conditions.";
        else if (!results.brightness) reason = "The photo is too dark or bright. Ensure good lighting conditions.";
        
        document.getElementById('image-failure-reason').innerText = reason;
        failureAlert.style.display = 'block';
        nextBtn.disabled = true;
    }
}

// STEP 3: Description & Multilingual Voice Synthesis
function handleDescriptionInput() {
    const text = document.getElementById('desc-textarea').value;
    const charCount = text.length;
    document.getElementById('desc-char-count').innerText = `${charCount} / 500 characters`;
    
    const nextBtn = document.getElementById('w3-next');
    nextBtn.disabled = (charCount < 5);
}

// Web Speech Synthesis Recording
let mediaRecorder = null;
let speechRecognizer = null;

function handleVoiceRecordingToggle() {
    const micBtn = document.getElementById('mic-trigger-btn');
    const title = document.getElementById('mic-status-title');
    const desc = document.getElementById('mic-status-desc');
    const descArea = document.getElementById('desc-textarea');

    // Check if voice dictation is already running
    if (micBtn.classList.contains('recording')) {
        // Stop dictation
        micBtn.classList.remove('recording');
        title.innerText = "Voice Input Completed";
        desc.innerText = "Recording stopped. Speech transcription added above.";
        
        if (speechRecognizer) {
            speechRecognizer.stop();
        }
        return;
    }

    // Check if browser SpeechRecognition is available
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        speechRecognizer = new SpeechRecognition();
        speechRecognizer.continuous = false;
        speechRecognizer.interimResults = false;
        
        // Detect native Tamil/Hindi based on user profile settings
        speechRecognizer.lang = (AppState.currentUser && AppState.currentUser.state === 'Tamil Nadu') ? 'ta-IN' : 'en-US';

        speechRecognizer.onstart = () => {
            micBtn.classList.add('recording');
            title.innerText = "Listening now...";
            desc.innerText = `Record in progress... Dictate description naturally.`;
        };

        speechRecognizer.onerror = (e) => {
            console.error(e);
            title.innerText = "Microphone Error";
            desc.innerText = "We couldn't understand the recording. Please try typing your description.";
            micBtn.classList.remove('recording');
        };

        speechRecognizer.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            descArea.value = (descArea.value + " " + transcript).trim();
            handleDescriptionInput();
            
            title.innerText = "Speech Transcribed";
            desc.innerText = `Successfully transcribed: "${transcript}"`;
            micBtn.classList.remove('recording');
            
            // Run translation checks
            runDescriptionLanguageChecks(descArea.value);
        };

        speechRecognizer.start();
    } else {
        // Simulated voice dictation fallback
        micBtn.classList.add('recording');
        title.innerText = "Dictation Simulation Running...";
        desc.innerText = "Talk clearly. Generating transcription...";

        setTimeout(() => {
            let mockDictation = "சாலை குழி பெரியதாக உள்ளது"; // "Road pothole is huge" in Tamil
            if (AppState.currentUser && AppState.currentUser.state !== 'Tamil Nadu') {
                mockDictation = "There is a big pothole near Usman road";
            }
            
            descArea.value = (descArea.value + " " + mockDictation).trim();
            handleDescriptionInput();
            
            title.innerText = "Dictated Speech Added";
            desc.innerText = `Simulated dictation complete.`;
            micBtn.classList.remove('recording');
            
            runDescriptionLanguageChecks(descArea.value);
        }, 3000);
    }
}

async function runDescriptionLanguageChecks(text) {
    const transService = await TranslationService.translateAndNormalize(text);
    
    AppState.reporting.originalText = text;
    AppState.reporting.normalizedText = transService.normalizedText;
    AppState.reporting.detectedLanguage = transService.detectedLanguage;

    // Display language badges
    const badge = document.getElementById('detected-lang-badge');
    const textLabel = document.getElementById('detected-lang-text');
    badge.style.display = 'flex';
    textLabel.innerText = transService.detectedLanguage;

    // Show Translation normalization panel
    const transPanel = document.getElementById('translation-preview-panel');
    const transPreview = document.getElementById('translation-preview-text');
    
    if (transService.detectedLanguageCode !== 'en') {
        transPanel.style.display = 'block';
        transPreview.innerText = `"${transService.normalizedText}"`;
    } else {
        transPanel.style.display = 'none';
    }
}

// STEP 4: AI Analysis checks & Consistency
async function runAIChecksAndAnalysis() {
    const text = document.getElementById('desc-textarea').value.trim();
    
    // Ensure translation is run if textarea was manually typed
    if (!AppState.reporting.originalText || AppState.reporting.originalText !== text) {
        await runDescriptionLanguageChecks(text);
    }

    navigateWizardStep(4);

    // DOM Elements
    const relevanceLabel = document.getElementById('ai-check-relevance-lbl');
    const relevanceVal = document.getElementById('ai-check-relevance-val');
    
    const consistencyLabel = document.getElementById('ai-check-consistency-lbl');
    const consistencyVal = document.getElementById('ai-check-consistency-val');
    
    const duplicateLabel = document.getElementById('ai-check-duplicate-lbl');
    const duplicateVal = document.getElementById('ai-check-duplicate-val');

    const progressPanel = document.getElementById('ai-checks-progress-panel');
    const failurePanel = document.getElementById('ai-check-failure-alert');
    const aiOutputs = document.getElementById('ai-predicted-results-container');
    const nextBtn = document.getElementById('w4-next');

    // Reset views
    progressPanel.style.display = 'block';
    failurePanel.style.display = 'none';
    aiOutputs.style.display = 'none';
    nextBtn.disabled = true;

    const setPending = (lbl, val, msg) => {
        lbl.innerHTML = `<span class="progress-spinner"></span> ${msg}`;
        val.className = "validation-status v-loading";
        val.innerText = "WAITING";
    };
    
    setPending(relevanceLabel, relevanceVal, "Checking image relevance");
    setPending(consistencyLabel, consistencyVal, "Comparing text-image consistency");
    setPending(duplicateLabel, duplicateVal, "Scanning for duplicate nearby complaints");

    // Perform AI analysis API query
    const analysis = await AIService.analyzeComplaint(AppState.reporting.normalizedText, AppState.reporting.image);
    AppState.reporting.aiPrediction = analysis;

    // 1. Relevance check
    await delay(800);
    if (analysis.imageRelevance.relevant) {
        relevanceLabel.innerHTML = `<i data-lucide="check-circle-2" class="v-pass"></i> Image represents public infrastructure`;
        relevanceVal.className = "validation-status v-pass";
        relevanceVal.innerText = "✓ OK";
    } else {
        relevanceLabel.innerHTML = `<i data-lucide="alert-triangle" class="v-fail"></i> Image does not represent civic issue`;
        relevanceVal.className = "validation-status v-fail";
        relevanceVal.innerText = "✕ WARNING";
    }
    lucide.createIcons();

    // 2. Consistency check
    await delay(800);
    if (analysis.consistency.valid) {
        consistencyLabel.innerHTML = `<i data-lucide="check-circle-2" class="v-pass"></i> Text and image context matches`;
        consistencyVal.className = "validation-status v-pass";
        consistencyVal.innerText = "✓ OK";
    } else {
        consistencyLabel.innerHTML = `<i data-lucide="alert-triangle" class="v-fail"></i> Text-image mismatch detected`;
        consistencyVal.className = "validation-status v-fail";
        consistencyVal.innerText = "✕ MISMATCH";
    }
    lucide.createIcons();

    // If Image Relevance or Consistency failed, stop and warn user
    if (analysis.verificationRequired) {
        progressPanel.style.display = 'none';
        
        let warnMsg = analysis.consistency.message;
        if (!analysis.imageRelevance.relevant) {
            warnMsg = "We couldn't verify that this image clearly represents a civic issue. Please upload a clearer or more relevant image.";
        }
        
        document.getElementById('ai-check-failure-desc').innerText = warnMsg;
        failurePanel.style.display = 'block';
        return;
    }

    // 3. Duplicate checks
    await delay(800);
    const dupCheck = DuplicateService.checkDuplicates(
        AppState.reporting.lat,
        AppState.reporting.lng,
        analysis.category,
        AppState.reporting.normalizedText
    );

    if (dupCheck.isDuplicate && !AppState.reporting.duplicateReviewed) {
        duplicateLabel.innerHTML = `<i data-lucide="alert-triangle" class="v-fail"></i> Duplicate complaint found nearby`;
        duplicateVal.className = "validation-status v-fail";
        duplicateVal.innerText = "✕ MATCHED";
        lucide.createIcons();
        
        // Show Duplicate Alert Warning Modal
        showDuplicateModal(dupCheck);
        return;
    } else {
        duplicateLabel.innerHTML = `<i data-lucide="check-circle-2" class="v-pass"></i> No similar local issues found`;
        duplicateVal.className = "validation-status v-pass";
        duplicateVal.innerText = "✓ UNIQUE";
        lucide.createIcons();
    }

    // All checks pass, display predictions
    progressPanel.style.display = 'none';
    aiOutputs.style.display = 'block';
    
    // Bind results
    document.getElementById('ai-pred-category').innerText = analysis.category;
    document.getElementById('ai-pred-priority').innerText = analysis.priority;
    document.getElementById('ai-pred-dept').innerText = analysis.department;
    document.getElementById('ai-pred-confidence').innerText = `${analysis.confidence}%`;
    
    // Assign fields
    AppState.reporting.reviewedCategory = analysis.category;
    AppState.reporting.reviewedPriority = analysis.priority;
    AppState.reporting.reviewedDepartment = analysis.department;

    nextBtn.disabled = false;
}

// Shows duplicate overlay box
function showDuplicateModal(dupCheck) {
    const modal = document.getElementById('duplicate-alert-modal');
    modal.classList.add('active');
    
    const matched = dupCheck.matchedComplaint;
    document.getElementById('dup-modal-ticket-id').innerText = matched.id;
    document.getElementById('dup-modal-category').innerText = matched.category;
    
    const statusBadge = document.getElementById('dup-modal-status');
    statusBadge.className = `status-badge status-${matched.status.toLowerCase().replace(/_/g, '')}`;
    statusBadge.innerText = matched.status.replace(/_/g, ' ');

    document.getElementById('dup-modal-distance').innerText = `${dupCheck.distance} meters away`;
    document.getElementById('dup-modal-score').innerText = `${dupCheck.score}% match`;
    
    // Support Existing Ticket binding
    const supportBtn = document.getElementById('dup-btn-support');
    supportBtn.replaceWith(supportBtn.cloneNode(true));
    document.getElementById('dup-btn-support').addEventListener('click', () => {
        modal.classList.remove('active');
        ComplaintService.supportComplaint(matched.id, AppState.currentUser.id);
        
        // Setup notification alerts
        NotificationService.add(
            AppState.currentUser.id,
            "Joined Ticket Support",
            `You are now a co-reporter for ticket ${matched.id}. You will receive status notifications.`,
            matched.id
        );
        
        showScreen('dashboard');
        setupDashboard();
        showToast(`Successfully linked as a supporter to ticket ${matched.id}!`);
    });
    
    // Continue filing complaint anyway
    const continueBtn = document.getElementById('dup-btn-continue');
    continueBtn.replaceWith(continueBtn.cloneNode(true));
    document.getElementById('dup-btn-continue').addEventListener('click', () => {
        modal.classList.remove('active');
        AppState.reporting.duplicateReviewed = true;
        
        // Re-run checking to skip duplicate matching
        runAIChecksAndAnalysis();
    });
}

// STEP 5: Review Grievance details
function setupReviewScreen() {
    document.getElementById('rev-address').innerText = AppState.reporting.address;
    document.getElementById('rev-desc-original').innerText = AppState.reporting.originalText;
    
    const transRow = document.getElementById('rev-translation-row');
    if (AppState.reporting.detectedLanguage !== 'English') {
        transRow.style.display = 'block';
        document.getElementById('rev-desc-normalized').innerText = AppState.reporting.normalizedText;
    } else {
        transRow.style.display = 'none';
    }

    // Pre-select AI category choices
    document.getElementById('rev-category-select').value = AppState.reporting.reviewedCategory;
    document.getElementById('rev-priority-select').value = AppState.reporting.reviewedPriority;
    document.getElementById('rev-dept').innerText = AppState.reporting.reviewedDepartment;
}

// Trigger review screen setup when advancing
document.getElementById('w4-next').addEventListener('click', setupReviewScreen);

// Final Grievance Submission
function handleSubmitGrievance() {
    const finalCategory = document.getElementById('rev-category-select').value;
    const finalPriority = document.getElementById('rev-priority-select').value;
    const finalDept = document.getElementById('rev-dept').innerText;

    // Check if citizen changed the values
    const categoryModified = finalCategory !== AppState.reporting.aiPrediction.category;
    const priorityModified = finalPriority !== AppState.reporting.aiPrediction.priority;

    const newTicket = ComplaintService.create({
        citizenId: AppState.currentUser.id,
        originalDescription: AppState.reporting.originalText,
        normalizedDescription: AppState.reporting.normalizedText,
        originalLanguage: AppState.reporting.detectedLanguage,
        image: AppState.reporting.image,
        location: {
            lat: AppState.reporting.lat,
            lng: AppState.reporting.lng,
            address: AppState.reporting.address,
            timestamp: new Date().toISOString()
        },
        category: finalCategory,
        priority: finalPriority,
        aiPrediction: {
            category: AppState.reporting.aiPrediction.category,
            priority: AppState.reporting.aiPrediction.priority,
            department: AppState.reporting.aiPrediction.department,
            confidence: AppState.reporting.aiPrediction.confidence,
            categoryModified,
            priorityModified
        },
        recommendedDepartment: finalDept,
        duplicateReviewed: AppState.reporting.duplicateReviewed
    });

    AppState.activeComplaintId = newTicket.id;
    
    // Add citizen notify alerts
    NotificationService.add(
        AppState.currentUser.id,
        "Grievance Filed",
        `Grievance ticket ${newTicket.id} filed successfully under ${newTicket.recommendedDepartment}.`,
        newTicket.id
    );

    // ── BRIDGE: Publish to Admin Portal ──
    // Enriches the complaint with admin-compatible schema and notifies admin
    CitizenBridge.publishNewComplaint(newTicket);

    // Show step 6 confirmation
    document.getElementById('confirm-ticket-id').innerText = newTicket.id;
    navigateWizardStep(6);
    
    updateDemoTicketDropdown();
}

/* ==========================================================================
   5. COMPLAINT DETAILS & HISTORY TRACKING
   ========================================================================== */
function setupComplaintDetailsScreen(complaintId) {
    AppState.activeComplaintId = complaintId;
    
    const comp = ComplaintService.getById(complaintId);
    if (!comp) return;

    // Title & Status
    document.getElementById('det-ticket-id').innerText = comp.id;
    const badge = document.getElementById('det-status-badge');
    badge.className = `status-badge status-${comp.status.toLowerCase().replace(/_/g, '')}`;
    badge.innerText = comp.status.replace(/_/g, ' ');

    document.getElementById('det-category-priority').innerText = `${comp.category} • ${comp.priority} Priority`;
    document.getElementById('det-complaint-img').src = comp.image || SAMPLE_IMAGE_CIVIC;
    document.getElementById('det-address-text').innerText = comp.location.address;
    document.getElementById('det-dept-name').innerText = comp.recommendedDepartment;
    
    // Mock Officer assignment detail text
    const hasOfficer = ['OFFICER_ASSIGNED', 'WORK_SCHEDULED', 'WORK_IN_PROGRESS', 'WORK_COMPLETED', 'VERIFICATION', 'RESOLVED'].includes(comp.status);
    document.getElementById('det-officer-id').innerText = hasOfficer ? "OFF-8241 (Officer Rajesh Kumar)" : "Awaiting assignment";

    // Setup map
    setTimeout(() => {
        initDetailsMap(comp.location.lat, comp.location.lng, comp.category);
    }, 200);

    // Setup Timeline progress
    renderComplaintTimeline(comp);

    // Resolution evidence container
    const evidenceCard = document.getElementById('det-resolution-evidence-card');
    const feedbackCard = document.getElementById('det-feedback-card');
    const savedFeedbackCard = document.getElementById('det-saved-feedback-card');
    
    evidenceCard.style.display = 'none';
    feedbackCard.style.display = 'none';
    savedFeedbackCard.style.display = 'none';

    if (comp.status === 'WORK_COMPLETED' || comp.status === 'RESOLVED') {
        evidenceCard.style.display = 'block';
        document.getElementById('det-evidence-before-img').src = comp.image || SAMPLE_IMAGE_CIVIC;
        document.getElementById('det-evidence-after-img').src = comp.completionImage || "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600";
        document.getElementById('det-resolution-details-text').innerText = comp.resolutionDetails || "Repairs successfully completed.";
        
        // Manage feedback panel inputs
        if (comp.status === 'WORK_COMPLETED') {
            feedbackCard.style.display = 'block';
            resetFeedbackForm();
        } else if (comp.status === 'RESOLVED') {
            savedFeedbackCard.style.display = 'block';
            if (comp.feedback) {
                document.getElementById('det-saved-stars').innerText = '★'.repeat(comp.feedback.rating) + '☆'.repeat(5 - comp.feedback.rating);
                document.getElementById('det-saved-solved-status').innerText = comp.feedback.solved;
                
                if (comp.feedback.comment) {
                    document.getElementById('det-saved-comments-box').style.display = 'block';
                    document.getElementById('det-saved-comments').innerText = comp.feedback.comment;
                } else {
                    document.getElementById('det-saved-comments-box').style.display = 'none';
                }
            }
        }
    }

    // Render Internal Audit Logs trail
    renderInternalAuditTrail(comp);
}

function initDetailsMap(lat, lng, category) {
    if (!AppState.detailsMap) {
        AppState.detailsMap = L.map('details-map', { zoomControl: false }).setView([lat, lng], 17);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(AppState.detailsMap);
        
        AppState.detailsMarker = L.marker([lat, lng]).addTo(AppState.detailsMap);
    } else {
        AppState.detailsMap.setView([lat, lng], 17);
        AppState.detailsMarker.setLatLng([lat, lng]);
    }
    
    AppState.detailsMarker.bindPopup(`<b>${category} Location</b>`).openPopup();
    AppState.detailsMap.invalidateSize();
}

function renderComplaintTimeline(comp) {
    const list = document.getElementById('det-timeline-list');
    
    // Master timeline hierarchy
    const stages = [
        { status: 'SUBMITTED', title: 'Submitted', desc: 'Complaint reported by citizen.' },
        { status: 'RECEIVED', title: 'Received', desc: 'Logged and cataloged in grievance portal database.' },
        { status: 'DEPARTMENT_ASSIGNED', title: 'Department Assigned', desc: `Forwarded to ${comp.recommendedDepartment}.` },
        { status: 'OFFICER_ASSIGNED', title: 'Officer Assigned', desc: 'Municipal engineer designated for inspection.' },
        { status: 'WORK_SCHEDULED', title: 'Work Scheduled', desc: 'Contractor assigned and equipment dispatched.' },
        { status: 'WORK_IN_PROGRESS', title: 'Work In Progress', desc: 'Repair crew is restoring the site.' },
        { status: 'WORK_COMPLETED', title: 'Work Completed', desc: 'Field repair completed. Crew evidence uploaded.' },
        { status: 'RESOLVED', title: 'Resolved', desc: 'Grievance resolved and confirmed by citizen feedback.' }
    ];

    const currentStageIndex = stages.findIndex(s => s.status === comp.status);
    
    list.innerHTML = stages.map((stage, idx) => {
        let completionClass = '';
        let dotSymbol = '';
        
        if (idx < currentStageIndex) {
            completionClass = 'completed';
            dotSymbol = '✓';
        } else if (idx === currentStageIndex) {
            completionClass = 'active';
            dotSymbol = '●';
        } else {
            dotSymbol = '○';
        }
        
        // Retrieve matching audit item timestamps
        const historyItem = comp.statusHistory.find(h => h.status === stage.status);
        const timeDisplay = historyItem ? new Date(historyItem.timestamp).toLocaleString() : '';
        const stageDesc = historyItem ? historyItem.description : stage.desc;

        return `
            <div class="timeline-item ${completionClass}">
                <div class="timeline-dot">${dotSymbol}</div>
                <div class="timeline-content">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h4 class="timeline-title">${stage.title}</h4>
                        ${timeDisplay ? `<span class="timeline-time">${timeDisplay}</span>` : ''}
                    </div>
                    <p class="timeline-desc">${stageDesc}</p>
                </div>
            </div>
        `;
    }).join('');
}

function renderInternalAuditTrail(comp) {
    const list = document.getElementById('det-audit-list');
    list.innerHTML = comp.statusHistory.map(h => `
        <div class="audit-item">
            <span class="timeline-time" style="min-width: 140px;">${new Date(h.timestamp).toLocaleString()}</span>
            <span class="audit-role">${h.role}</span>
            <span style="color: var(--text-secondary);">${h.description}</span>
        </div>
    `).join('');
}

// Reset ratings fields
let currentFeedbackRating = 5;

function resetFeedbackForm() {
    currentFeedbackRating = 5;
    updateStarsRatingUI(5);
    document.getElementById('feedback-comments').value = '';
    document.getElementById('reopen-warning-box').style.display = 'none';
    document.querySelector('input[name="feedback-solved"][value="Yes"]').checked = true;
}

function updateStarsRatingUI(val) {
    currentFeedbackRating = val;
    document.querySelectorAll('#feedback-stars span').forEach((span, idx) => {
        if (idx < val) {
            span.classList.add('active');
        } else {
            span.classList.remove('active');
        }
    });
}

// Save Ratings and feedback responses
function handleFeedbackSubmit(e) {
    e.preventDefault();
    
    const comments = document.getElementById('feedback-comments').value.trim();
    const solved = document.querySelector('input[name="feedback-solved"]:checked').value;
    
    const comp = ComplaintService.getById(AppState.activeComplaintId);
    if (!comp) return;

    comp.feedback = {
        rating: currentFeedbackRating,
        comment: comments,
        solved: solved
    };

    if (solved === 'Yes') {
        // Resolve ticket
        comp.status = 'RESOLVED';
        comp.statusHistory.push({
            status: 'RESOLVED',
            timestamp: new Date().toISOString(),
            description: `Citizen rated issue resolution as solved (${currentFeedbackRating} Stars). Grievance closed.`,
            role: 'CITIZEN'
        });
        
        NotificationService.add(
            comp.citizenId,
            "Grievance Resolved",
            `Complaint ticket ${comp.id} has been successfully closed.`,
            comp.id
        );
    } else {
        // Escalated reopened ticket
        comp.status = 'REOPENED';
        comp.statusHistory.push({
            status: 'REOPENED',
            timestamp: new Date().toISOString(),
            description: `Citizen marked problem as unsolved. Reopened for senior administration inspection. Comments: "${comments}"`,
            role: 'CITIZEN'
        });
        
        NotificationService.add(
            comp.citizenId,
            "Grievance Reopened",
            `Ticket ${comp.id} reopened for further review. Escalated to administration.`,
            comp.id
        );
    }

    ComplaintService.update(comp);
    setupComplaintDetailsScreen(comp.id);
    showToast(`Feedback submitted successfully!`);
}

/* ==========================================================================
   6. NOTIFICATION SYSTEM VIEWS
   ========================================================================== */
function setupNotificationsScreen() {
    const list = NotificationService.getAll(AppState.currentUser.id);
    const container = document.getElementById('notifications-list-container');
    
    if (list.length === 0) {
        container.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 3rem 0;">No notifications found.</p>`;
        return;
    }

    container.innerHTML = list.map(n => `
        <div class="card notification-card ${!n.read ? 'unread' : ''}" onclick="handleNotificationClicked('${n.id}', '${n.complaintId}')">
            <div class="notification-header">
                <span style="font-weight:700;">${n.title}</span>
                <span>${new Date(n.timestamp).toLocaleString()}</span>
            </div>
            <p style="font-size:0.9rem; color:var(--text-secondary); margin-top:0.25rem;">${n.message}</p>
            ${!n.read ? `<div style="font-size:0.75rem; color:var(--color-info); font-weight:600; margin-top:0.5rem; text-align:right;">Tap to mark as read</div>` : ''}
        </div>
    `).join('');
}

window.handleNotificationClicked = (id, complaintId) => {
    NotificationService.markAsRead(AppState.currentUser.id, id);
    if (complaintId) {
        window.appNavigateToComplaint(complaintId);
    } else {
        setupNotificationsScreen();
    }
};

function updateNotificationIconBadge() {
    if (!AppState.currentUser) return;
    const list = NotificationService.getAll(AppState.currentUser.id);
    const unread = list.some(n => !n.read);
    const notifBtn = document.getElementById('header-notif-btn');
    
    if (unread) {
        notifBtn.classList.add('badge-active');
    } else {
        notifBtn.classList.remove('badge-active');
    }
}

/* ==========================================================================
   7. PROFILE SCREEN & DETAILS EDIT
   ========================================================================== */
function setupProfileScreen() {
    if (!AppState.currentUser) return;
    
    const user = AppState.currentUser;
    document.getElementById('prof-name').value = user.name;
    document.getElementById('prof-phone').value = user.phone;
    document.getElementById('prof-email').value = user.email || '';
    document.getElementById('prof-address').value = user.address;
    document.getElementById('prof-city').value = user.city;
    document.getElementById('prof-pin').value = user.pinCode;

    document.getElementById('prof-notif-app').checked = user.notifications.inApp;
    document.getElementById('prof-notif-sms').checked = user.notifications.sms;
    document.getElementById('prof-notif-email').checked = user.notifications.email;
}

function handleProfileSave(e) {
    e.preventDefault();
    
    const updated = {
        ...AppState.currentUser,
        name: document.getElementById('prof-name').value.trim(),
        email: document.getElementById('prof-email').value.trim(),
        address: document.getElementById('prof-address').value.trim(),
        city: document.getElementById('prof-city').value.trim(),
        pinCode: document.getElementById('prof-pin').value.trim(),
        notifications: {
            inApp: document.getElementById('prof-notif-app').checked,
            sms: document.getElementById('prof-notif-sms').checked,
            email: document.getElementById('prof-notif-email').checked
        }
    };

    AuthService.setCurrentUser(updated);
    AppState.currentUser = updated;
    
    showToast("Profile settings saved successfully.");
    showScreen('dashboard');
}

/* ==========================================================================
   TOAST BANNER NOTIFICATION POPUPS
   ========================================================================== */
function showToast(message, notifObj = null) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    toast.innerHTML = `
        <div class="toast-content">${message}</div>
        <button class="toast-close">✕</button>
    `;
    
    // Tap toast to view corresponding ticket details
    if (notifObj && notifObj.complaintId) {
        toast.style.cursor = 'pointer';
        toast.addEventListener('click', (e) => {
            if (!e.target.classList.contains('toast-close')) {
                window.handleNotificationClicked(notifObj.id, notifObj.complaintId);
                toast.remove();
            }
        });
    }

    toast.querySelector('.toast-close').addEventListener('click', (e) => {
        e.stopPropagation();
        toast.remove();
    });

    container.appendChild(toast);
    
    // Auto dismiss
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

/* ==========================================================================
   DEVELOPMENT & DEMO PANEL SYSTEM CONSOLE
   ========================================================================== */
function initDemoConsole() {
    const consoleToggle = document.getElementById('demo-console-toggle');
    const consolePanel = document.getElementById('demo-console');
    const arrow = document.getElementById('demo-toggle-arrow');

    consoleToggle.addEventListener('click', () => {
        consolePanel.classList.toggle('collapsed');
        if (consolePanel.classList.contains('collapsed')) {
            arrow.setAttribute('data-lucide', 'chevron-up');
        } else {
            arrow.setAttribute('data-lucide', 'chevron-down');
            updateDemoTicketDropdown();
        }
        lucide.createIcons();
    });

    // Checkboxes bindings
    const bindToggle = (chkId, stateProp) => {
        document.getElementById(chkId).addEventListener('change', (e) => {
            window.DemoSettings[stateProp] = e.target.checked;
            console.log(`[DemoConsole] ${stateProp} set to ${e.target.checked}`);
        });
    };
    
    bindToggle('demo-blur-error', 'forceBlurError');
    bindToggle('demo-brightness-error', 'forceBrightnessError');
    bindToggle('demo-relevance-error', 'forceIrrelevantError');
    bindToggle('demo-duplicate-match', 'forceDuplicateMatch');

    // Load sample data
    document.getElementById('demo-load-samples-btn').addEventListener('click', () => {
        if (!AppState.currentUser) {
            alert("Please log in first before loading sample tickets.");
            return;
        }
        DemoService.loadSamples(AppState.currentUser.id);
        setupDashboard();
        updateDemoTicketDropdown();
        showToast("Demo samples loaded! Check My Complaints listing.");
    });

    // Clear Cache
    document.getElementById('demo-clear-all-btn').addEventListener('click', () => {
        if (confirm("Reset local storage cache? All user details and tickets will be wiped.")) {
            localStorage.clear();
            sessionStorage.clear();
            alert("LocalStorage wiped. Refreshing page.");
            window.location.reload();
        }
    });

    // Ticket Selection dropdown bindings
    document.getElementById('demo-ticket-selector').addEventListener('change', (e) => {
        const hasSelection = e.target.value !== "";
        document.getElementById('demo-advance-status-btn').disabled = !hasSelection;
        document.getElementById('demo-sla-escalate-btn').disabled = !hasSelection;
    });

    // Advance ticket status simulation
    document.getElementById('demo-advance-status-btn').addEventListener('click', () => {
        const ticketId = document.getElementById('demo-ticket-selector').value;
        if (ticketId) {
            const nextStatus = TrackingService.simulateNextStep(ticketId);
            if (nextStatus) {
                showToast(`Simulation: Advanced ${ticketId} status to ${nextStatus}`);
            } else {
                alert(`Ticket ${ticketId} is already fully resolved.`);
            }
        }
    });

    // SLA escalations warning simulation
    document.getElementById('demo-sla-escalate-btn').addEventListener('click', () => {
        const ticketId = document.getElementById('demo-ticket-selector').value;
        if (ticketId) {
            TrackingService.triggerSlaAlert(ticketId);
            showToast(`Simulation: Triggered SLA Escalate warning on ${ticketId}`);
        }
    });
}

function updateDemoTicketDropdown() {
    const select = document.getElementById('demo-ticket-selector');
    const complaints = ComplaintService.getAll();
    
    // Show only non-resolved tickets
    const activeTickets = complaints.filter(c => c.status !== 'RESOLVED');

    if (activeTickets.length === 0) {
        select.innerHTML = '<option value="">-- No Active Tickets --</option>';
        document.getElementById('demo-advance-status-btn').disabled = true;
        document.getElementById('demo-sla-escalate-btn').disabled = true;
        return;
    }

    const prevSelection = select.value;
    
    select.innerHTML = '<option value="">-- Select Active Ticket --</option>' + 
        activeTickets.map(c => `<option value="${c.id}">${c.id} (${c.status})</option>`).join('');

    // Restore previous selection if still active
    if (activeTickets.some(c => c.id === prevSelection)) {
        select.value = prevSelection;
        document.getElementById('demo-advance-status-btn').disabled = false;
        document.getElementById('demo-sla-escalate-btn').disabled = false;
    } else {
        document.getElementById('demo-advance-status-btn').disabled = true;
        document.getElementById('demo-sla-escalate-btn').disabled = true;
    }
}

/* ==========================================================================
   BACKGROUND PROCESSING SIMULATIONS
   ========================================================================== */
function startBackgroundSimulation() {
    // Ticks every 45 seconds to randomly advance one active complaint status
    if (AppState.simulationInterval) clearInterval(AppState.simulationInterval);
    
    AppState.simulationInterval = setInterval(() => {
        if (!AppState.currentUser) return;
        
        const complaints = ComplaintService.getAll();
        const activeComplaints = complaints.filter(c => 
            c.citizenId === AppState.currentUser.id && 
            !['RESOLVED', 'REOPENED', 'WORK_COMPLETED', 'VERIFICATION'].includes(c.status)
        );

        if (activeComplaints.length > 0) {
            // Select one random complaint to advance
            const randIdx = Math.floor(Math.random() * activeComplaints.length);
            const target = activeComplaints[randIdx];
            
            console.log(`[Simulation Ticker] Automatically advancing status of ${target.id}`);
            TrackingService.simulateNextStep(target.id);
        }
    }, 45000);
}

/* ==========================================================================
   HELPER UTILITIES
   ========================================================================== */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function formatTimeDifference(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);

    if (interval >= 1) return interval === 1 ? "1 year ago" : `${interval} years ago`;
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return interval === 1 ? "1 month ago" : `${interval} months ago`;
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return interval === 1 ? "1 day ago" : `${interval} days ago`;
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
    return seconds < 10 ? "just now" : `${Math.floor(seconds)} seconds ago`;
}

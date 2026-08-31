/* ==========================================================================
   CITIZEN CIVIC PORTAL SERVICES MODULE (SIMULATED API / BACKEND LAYER)
   ========================================================================== */

// Helper utility: Geographic Haversine Distance (in meters)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in meters
}

// Helper utility: Jaccard Word Similarity (0 to 1)
function getTextSimilarity(text1, text2) {
    const clean = (str) => str.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const words1 = new Set(clean(text1));
    const words2 = new Set(clean(text2));
    
    if (words1.size === 0 || words2.size === 0) return 0;
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
}

// Helper utility: Generate Unique Complaint IDs
function generateComplaintId() {
    const year = new Date().getFullYear();
    const rand = Math.floor(100000 + Math.random() * 900000); // 6-digit random
    return `CIV-${year}-${rand}`;
}

// Global Demo State (used for forcing specific mock outcomes)
window.DemoSettings = {
    forceBlurError: false,
    forceBrightnessError: false,
    forceIrrelevantError: false,
    forceDuplicateMatch: false,
    simulateSlaDelay: false,
    selectedImageBase64: null // Holds demo images loaded from system
};

/* ==========================================================================
   1. AUTHENTICATION SERVICE
   ========================================================================== */
export const AuthService = {
    getCurrentUser() {
        const user = localStorage.getItem('civic_citizen_user');
        return user ? JSON.parse(user) : null;
    },
    
    setCurrentUser(user) {
        localStorage.setItem('civic_citizen_user', JSON.stringify(user));
    },
    
    register(userData) {
        // Simulated registration
        const citizen = {
            id: 'CIT-' + Math.floor(1000 + Math.random() * 9000),
            name: userData.name,
            phone: userData.phone,
            email: userData.email || '',
            address: userData.address,
            city: userData.city,
            district: userData.district,
            state: userData.state,
            pinCode: userData.pinCode,
            verified: false,
            notifications: {
                inApp: true,
                email: userData.email ? true : false,
                sms: true
            }
        };
        return citizen;
    },
    
    verifyIdentity(citizen) {
        citizen.verified = true;
        this.setCurrentUser(citizen);
        return citizen;
    },
    
    sendOTP(phone) {
        // Simulation: console log OTP or mock send
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        sessionStorage.setItem(`otp_${phone}`, otp);
        sessionStorage.setItem(`otp_attempts_${phone}`, '0');
        console.log(`[AuthService] Mock SMS sent to ${phone}: OTP is ${otp}`);
        
        // Show simulated toast/alert to the user for demo usability
        return otp;
    },
    
    verifyOTP(phone, otpInput) {
        const correctOtp = sessionStorage.getItem(`otp_${phone}`);
        const attemptsKey = `otp_attempts_${phone}`;
        let attempts = parseInt(sessionStorage.getItem(attemptsKey) || '0', 10);
        
        if (attempts >= 3) {
            throw new Error("Too many incorrect attempts. Please request a new OTP.");
        }
        
        if (otpInput === correctOtp) {
            sessionStorage.removeItem(`otp_${phone}`);
            sessionStorage.removeItem(attemptsKey);
            
            // Check if user already exists in storage or create a mock session
            let user = this.getCurrentUser();
            if (!user || user.phone !== phone) {
                user = {
                    id: 'CIT-8924',
                    name: 'Karthik Raja',
                    phone: phone,
                    email: 'karthik.raja@email.com',
                    address: '12, Gandhi Street, T. Nagar',
                    city: 'Chennai',
                    district: 'Chennai',
                    state: 'Tamil Nadu',
                    pinCode: '600017',
                    verified: true,
                    notifications: { inApp: true, email: true, sms: true }
                };
                this.setCurrentUser(user);
            }
            return user;
        } else {
            attempts++;
            sessionStorage.setItem(attemptsKey, attempts.toString());
            throw new Error(`Invalid OTP. You have ${4 - attempts} attempts remaining.`);
        }
    },
    
    logout() {
        localStorage.removeItem('civic_citizen_user');
    }
};

/* ==========================================================================
   2. COMPLAINT SERVICE
   ========================================================================== */
export const ComplaintService = {
    getAll() {
        const data = localStorage.getItem('civic_complaints');
        return data ? JSON.parse(data) : [];
    },
    
    getById(id) {
        const complaints = this.getAll();
        return complaints.find(c => c.id === id) || null;
    },
    
    create(complaintData) {
        const complaints = this.getAll();
        const newComplaint = {
            id: generateComplaintId(),
            ...complaintData,
            status: 'SUBMITTED',
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            statusHistory: [
                {
                    status: 'SUBMITTED',
                    timestamp: new Date().toISOString(),
                    description: 'Complaint submitted by citizen.',
                    role: 'CITIZEN'
                }
            ],
            supporters: [],
            feedback: null
        };
        complaints.unshift(newComplaint);
        localStorage.setItem('civic_complaints', JSON.stringify(complaints));
        return newComplaint;
    },
    
    update(updatedComplaint) {
        const complaints = this.getAll();
        const index = complaints.findIndex(c => c.id === updatedComplaint.id);
        if (index !== -1) {
            updatedComplaint.lastUpdated = new Date().toISOString();
            complaints[index] = updatedComplaint;
            localStorage.setItem('civic_complaints', JSON.stringify(complaints));
            return updatedComplaint;
        }
        return null;
    },
    
    addHistoryStatus(id, status, description, role = 'SYSTEM') {
        const complaint = this.getById(id);
        if (complaint) {
            complaint.status = status;
            complaint.statusHistory.push({
                status: status,
                timestamp: new Date().toISOString(),
                description: description,
                role: role
            });
            this.update(complaint);
            return complaint;
        }
        return null;
    },
    
    supportComplaint(id, citizenId) {
        const complaint = this.getById(id);
        if (complaint) {
            if (!complaint.supporters.includes(citizenId)) {
                complaint.supporters.push(citizenId);
                this.update(complaint);
            }
            return complaint;
        }
        return null;
    },
    
    getStats(citizenId) {
        const complaints = this.getAll();
        // Filters by citizen ID OR where citizen is a supporter
        const userComplaints = complaints.filter(c => c.citizenId === citizenId || c.supporters.includes(citizenId));
        
        const total = userComplaints.length;
        const active = userComplaints.filter(c => ['SUBMITTED', 'RECEIVED', 'DEPARTMENT_ASSIGNED', 'OFFICER_ASSIGNED', 'WORK_SCHEDULED', 'WORK_IN_PROGRESS', 'WORK_COMPLETED', 'VERIFICATION'].includes(c.status)).length;
        const resolved = userComplaints.filter(c => c.status === 'RESOLVED').length;
        const pending = userComplaints.filter(c => c.status === 'REOPENED' || c.status === 'SUBMITTED').length;
        
        return { total, active, resolved, pending };
    }
};

/* ==========================================================================
   3. LOCATION SERVICE (MULTI-SOURCE HIGH-PRECISION LOCATION ENGINE)
   ========================================================================== */
export const LocationService = {
    // Default center fallback (Ranchi center for demonstration)
    getDemoCenter() {
        return { lat: 23.3441, lng: 85.3096, address: "Main Road, Ranchi, Jharkhand 834001" };
    },
    
    // Accuracy Level Classification
    getAccuracyLevel(accuracyMeters) {
        if (!accuracyMeters || accuracyMeters < 0) {
            return { label: '🎯 High Precision Fix', level: 'high', badgeClass: 'accuracy-badge-high', text: '±2.0m (GPS Hardware)' };
        }
        if (accuracyMeters <= 10) {
            return { label: '🎯 Pinpoint Satellite GPS', level: 'high', badgeClass: 'accuracy-badge-high', text: `±${accuracyMeters.toFixed(1)}m (Satellite)` };
        } else if (accuracyMeters <= 50) {
            return { label: '📡 Wi-Fi / Cell Triangulation', level: 'medium', badgeClass: 'accuracy-badge-med', text: `±${Math.round(accuracyMeters)}m (Wi-Fi/Cell)` };
        } else {
            return { label: '🌐 Network Area Estimate', level: 'low', badgeClass: 'accuracy-badge-low', text: `±${Math.round(accuracyMeters)}m (Network IP)` };
        }
    },
    
    // Multi-Provider High-Precision Reverse Geocoding Cascade
    async reverseGeocode(lat, lng) {
        // Provider 1: OpenStreetMap Nominatim
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
                headers: { 'Accept-Language': 'en' }
            });
            if (response.ok) {
                const data = await response.json();
                if (data && data.display_name) {
                    const addr = data.address || {};
                    const road = addr.road || addr.pedestrian || addr.suburb || addr.neighbourhood || '';
                    const district = addr.city_district || addr.county || addr.suburb || addr.city || '';
                    const state = addr.state || '';
                    const postcode = addr.postcode ? `- ${addr.postcode}` : '';
                    
                    if (road && district) {
                        return `${road}, ${district}, ${state} ${postcode}`.trim().replace(/^,\s*/, '');
                    }
                    return data.display_name;
                }
            }
        } catch (e) {
            console.warn("Nominatim geocoding failed, trying secondary provider...", e);
        }

        // Provider 2: Photon Komoot Reverse GIS
        try {
            const response2 = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lng}`);
            if (response2.ok) {
                const data2 = await response2.json();
                if (data2.features && data2.features.length > 0) {
                    const prop = data2.features[0].properties;
                    const parts = [prop.name, prop.street, prop.district, prop.city, prop.state].filter(Boolean);
                    if (parts.length > 0) return parts.join(', ');
                }
            }
        } catch (e) {
            console.warn("Photon reverse geocoding failed, trying tertiary provider...", e);
        }

        // Provider 3: BigDataCloud Reverse Geocoding Client
        try {
            const response3 = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
            if (response3.ok) {
                const data3 = await response3.json();
                if (data3.locality || data3.city) {
                    return `${data3.locality || data3.street || ''}, ${data3.city || data3.principalSubdivision || ''}, ${data3.countryName || ''}`.replace(/^,\s*/, '');
                }
            }
        } catch (e) {
            console.warn("BigDataCloud reverse geocoding failed", e);
        }

        return `Location Near (${lat.toFixed(6)}, ${lng.toFixed(6)})`;
    },

    // Multi-Service Network IP Geolocation Fallback (No API Key Required)
    async fetchIpLocation() {
        // Service 1: ipwho.is (Free, CORS enabled, no API key required)
        try {
            const res = await fetch('https://ipwho.is/');
            if (res.ok) {
                const d = await res.json();
                if (d.success && d.latitude && d.longitude) {
                    return { lat: parseFloat(d.latitude), lng: parseFloat(d.longitude), city: d.city || d.region || 'Current Area', provider: 'ipwho.is' };
                }
            }
        } catch (e) {
            console.warn("ipwho.is failed, trying geojs...", e);
        }

        // Service 2: GeoJS (Free open source IP location)
        try {
            const res2 = await fetch('https://get.geojs.io/v1/ip/geo.json');
            if (res2.ok) {
                const d2 = await res2.json();
                if (d2.latitude && d2.longitude) {
                    return { lat: parseFloat(d2.latitude), lng: parseFloat(d2.longitude), city: d2.city || d2.region || 'Current Area', provider: 'geojs' };
                }
            }
        } catch (e) {
            console.warn("geojs failed, trying freeipapi...", e);
        }

        // Service 3: freeipapi.com
        try {
            const res3 = await fetch('https://freeipapi.com/api/json');
            if (res3.ok) {
                const d3 = await res3.json();
                if (d3.latitude && d3.longitude) {
                    return { lat: parseFloat(d3.latitude), lng: parseFloat(d3.longitude), city: d3.cityName || 'Current Area', provider: 'freeipapi' };
                }
            }
        } catch (e) {
            console.warn("freeipapi failed", e);
        }

        return null;
    },

    // Extract EXIF GPS Metadata from JPEG Photo File
    async extractExifGps(file) {
        if (!file || !file.type || !file.type.includes('jpeg') && !file.type.includes('jpg')) return null;
        try {
            const buffer = await file.arrayBuffer();
            const dataView = new DataView(buffer);
            if (dataView.byteLength < 12 || dataView.getUint16(0, false) !== 0xFFD8) return null;
            
            let offset = 2;
            const length = dataView.byteLength;
            while (offset < length - 4) {
                const marker = dataView.getUint16(offset, false);
                offset += 2;
                if (marker === 0xFFE1) { // APP1 EXIF Header
                    const segmentLength = dataView.getUint16(offset, false);
                    if (dataView.getUint32(offset + 2, false) === 0x45786966) { // "Exif"
                        const tiffOffset = offset + 8;
                        const littleEndian = dataView.getUint16(tiffOffset, false) === 0x4949;
                        const firstIfdOffset = dataView.getUint32(tiffOffset + 4, littleEndian);
                        if (firstIfdOffset) {
                            return this.parseGpsFromIfd(dataView, tiffOffset, firstIfdOffset, littleEndian);
                        }
                    }
                    break;
                } else if ((marker & 0xFF00) === 0xFF00) {
                    const blockLength = dataView.getUint16(offset, false);
                    offset += blockLength;
                } else {
                    break;
                }
            }
        } catch (e) {
            console.warn("EXIF GPS parsing error:", e);
        }
        return null;
    },

    parseGpsFromIfd(dataView, tiffOffset, ifdOffset, littleEndian) {
        try {
            const entries = dataView.getUint16(tiffOffset + ifdOffset, littleEndian);
            let gpsIfdOffset = null;
            
            for (let i = 0; i < entries; i++) {
                const entryOffset = tiffOffset + ifdOffset + 2 + (i * 12);
                if (entryOffset + 12 > dataView.byteLength) break;
                const tag = dataView.getUint16(entryOffset, littleEndian);
                if (tag === 0x8825) { // GPS IFD Pointer
                    gpsIfdOffset = dataView.getUint32(entryOffset + 8, littleEndian);
                    break;
                }
            }
            
            if (!gpsIfdOffset) return null;
            
            const gpsEntries = dataView.getUint16(tiffOffset + gpsIfdOffset, littleEndian);
            let latValues = null, latRef = 'N', lngValues = null, lngRef = 'E';
            
            for (let i = 0; i < gpsEntries; i++) {
                const entryOffset = tiffOffset + gpsIfdOffset + 2 + (i * 12);
                if (entryOffset + 12 > dataView.byteLength) break;
                const tag = dataView.getUint16(entryOffset, littleEndian);
                const valueOffset = tiffOffset + dataView.getUint32(entryOffset + 8, littleEndian);
                
                if (tag === 1) { // GPSLatitudeRef
                    latRef = String.fromCharCode(dataView.getUint8(entryOffset + 8));
                } else if (tag === 2) { // GPSLatitude
                    latValues = this.readRationalArray(dataView, valueOffset, 3, littleEndian);
                } else if (tag === 3) { // GPSLongitudeRef
                    lngRef = String.fromCharCode(dataView.getUint8(entryOffset + 8));
                } else if (tag === 4) { // GPSLongitude
                    lngValues = this.readRationalArray(dataView, valueOffset, 3, littleEndian);
                }
            }
            
            if (latValues && lngValues && latValues.length === 3 && lngValues.length === 3) {
                let lat = latValues[0] + (latValues[1] / 60) + (latValues[2] / 3600);
                let lng = lngValues[0] + (lngValues[1] / 60) + (lngValues[2] / 3600);
                if (latRef === 'S') lat = -lat;
                if (lngRef === 'W') lng = -lng;
                if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
                    return { lat, lng, source: 'EXIF Photo Metadata' };
                }
            }
        } catch (e) {
            console.warn("GPS IFD sub-parser error:", e);
        }
        return null;
    },

    readRationalArray(dataView, offset, count, littleEndian) {
        const res = [];
        try {
            for (let i = 0; i < count; i++) {
                const pos = offset + (i * 8);
                if (pos + 8 > dataView.byteLength) break;
                const num = dataView.getUint32(pos, littleEndian);
                const den = dataView.getUint32(pos + 4, littleEndian);
                res.push(den ? num / den : 0);
            }
        } catch (e) {
            console.warn("Error reading rationals:", e);
        }
        return res;
    }
};


/* ==========================================================================
   4. IMAGE VALIDATION SERVICE
   ========================================================================== */
export const ImageValidationService = {
    async validateImage(file) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const results = {
                    format: true,
                    resolution: true,
                    brightness: true,
                    blur: true,
                    valid: true
                };
                
                // Read dimensions if browser loaded
                if (file.size < 1000) { // Reject tiny dummy files
                    results.resolution = false;
                    results.valid = false;
                }
                
                // Force Demo errors
                if (window.DemoSettings.forceBlurError) {
                    results.blur = false;
                    results.valid = false;
                }
                
                if (window.DemoSettings.forceBrightnessError) {
                    results.brightness = false;
                    results.valid = false;
                }
                
                resolve(results);
            }, 1500); // Simulated processing duration
        });
    }
};

/* ==========================================================================
   5. AI SERVICE (RELEVANCE, CONSISTENCY, ANOMALY & PREDICTIONS)
   ========================================================================== */
export const AIService = {
    // Maps simple terms/keywords to civic categories & departments
    analyzeComplaint(text, imageBase64) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const normText = text.toLowerCase();
                
                // 1. Image relevance check
                let imageRelevance = { relevant: true, confidence: 95 };
                if (window.DemoSettings.forceIrrelevantError) {
                    imageRelevance.relevant = false;
                    imageRelevance.confidence = 92;
                }
                
                // 2. Default predictions
                let category = "Other Civic Issue";
                let department = "General Grievance Cell";
                let priority = "Medium";
                let confidence = 88;
                
                // Word classification rules tailored for Societal & Disaster Challenges (PS 26043)
                if (normText.includes('subsidence') || normText.includes('mine') || normText.includes('methane') || normText.includes('lightning') || normText.includes('flood') || normText.includes('landslide') || normText.includes('disaster') || normText.includes('hazard')) {
                    category = "Disaster Management & Resilience";
                    department = "Disaster Management Cell / BIT Mesra R&D";
                    priority = "Critical";
                    confidence = 96;
                } else if (normText.includes('cold storage') || normText.includes('irrigation') || normText.includes('farm') || normText.includes('crop') || normText.includes('soil') || normText.includes('harvest') || normText.includes('drought')) {
                    category = "Agriculture & Water Resources";
                    department = "Agri-Tech & Water Resources Dept";
                    priority = "High";
                    confidence = 94;
                } else if (normText.includes('arsenic') || normText.includes('water contamination') || normText.includes('health') || normText.includes('disease') || normText.includes('hospital') || normText.includes('telemedicine')) {
                    category = "Healthcare & Sanitation";
                    department = "Healthcare & Environmental Biotechnology";
                    priority = "High";
                    confidence = 93;
                } else if (normText.includes('solar') || normText.includes('microgrid') || normText.includes('pollution') || normText.includes('clean energy') || normText.includes('biomass')) {
                    category = "Clean Energy & Environment";
                    department = "Clean Energy & Environmental Engg";
                    priority = "Medium";
                    confidence = 92;
                } else if (normText.includes('school') || normText.includes('learning') || normText.includes('education') || normText.includes('literacy') || normText.includes('tribal youth')) {
                    category = "Education & Accessibility";
                    department = "Education & Skill Tech R&D";
                    priority = "Medium";
                    confidence = 90;
                } else if (normText.includes('pothole') || normText.includes('road') || normText.includes('cracks') || normText.includes('bridge')) {
                    category = "Urban Infrastructure";
                    department = "Civil & Infrastructure Engg";
                    priority = "High";
                    confidence = 94;
                }
                
                // Boost priority based on critical keywords
                if (normText.includes('danger') || normText.includes('accident') || normText.includes('child') || normText.includes('broken pole') || normText.includes('flooding') || normText.includes('பாதிப்பு')) {
                    priority = "Critical";
                }
                
                // Text-Image Consistency check
                let consistencyScore = 90;
                let consistencyValid = true;
                
                // If demo relevant failure triggers, show possible mismatch
                if (window.DemoSettings.forceIrrelevantError) {
                    consistencyScore = 32;
                    consistencyValid = false;
                }
                
                resolve({
                    category,
                    priority,
                    department,
                    confidence,
                    imageRelevance,
                    consistency: {
                        score: consistencyScore,
                        valid: consistencyValid,
                        message: consistencyValid ? "High consistency between text and image evidence." : "Possible mismatch detected. Please upload an image related to the reported problem."
                    },
                    verificationRequired: !consistencyValid || !imageRelevance.relevant
                });
            }, 1800);
        });
    }
};

/* ==========================================================================
   6. DUPLICATE SERVICE
   ========================================================================== */
export const DuplicateService = {
    checkDuplicates(newLat, newLng, category, normalizedText) {
        const radius = 200; // 200 meters configurable duplicate detection radius
        const complaints = ComplaintService.getAll();
        
        let highestScore = 0;
        let matchedComplaint = null;
        
        // Demo force match override
        if (window.DemoSettings.forceDuplicateMatch && complaints.length > 0) {
            return {
                isDuplicate: true,
                score: 91,
                matchedComplaint: complaints[0],
                distance: 75
            };
        }
        
        for (const comp of complaints) {
            // Ignore resolved or reopened duplicates reviewed
            if (comp.status === 'RESOLVED') continue;
            
            // 1. Calculate distance similarity
            const dist = getDistance(newLat, newLng, comp.location.lat, comp.location.lng);
            if (dist > radius) continue;
            
            const distScore = Math.max(0, 100 - (dist / radius) * 100); // closer = higher score
            
            // 2. Category match similarity
            const catMatch = comp.category === category ? 100 : 0;
            
            // 3. Text description similarity
            const textSim = getTextSimilarity(normalizedText, comp.normalizedDescription) * 100;
            
            // 4. Time similarity: recent complaints get higher duplicate risk
            const daysDiff = (new Date() - new Date(comp.createdAt)) / (1000 * 60 * 60 * 24);
            const timeScore = Math.max(0, 100 - daysDiff * 2); // decays over 50 days
            
            // Weighted Duplicate score calculations
            // Location (40%), Category (25%), Text (25%), Time (10%)
            const duplicateScore = Math.round(
                (distScore * 0.40) + 
                (catMatch * 0.25) + 
                (textSim * 0.25) + 
                (timeScore * 0.10)
            );
            
            if (duplicateScore > highestScore) {
                highestScore = duplicateScore;
                matchedComplaint = comp;
            }
        }
        
        const duplicateThreshold = 65; // Trigger duplicate UI overlay if score > 65%
        
        return {
            isDuplicate: highestScore >= duplicateThreshold,
            score: highestScore,
            matchedComplaint,
            distance: matchedComplaint ? Math.round(getDistance(newLat, newLng, matchedComplaint.location.lat, matchedComplaint.location.lng)) : 0
        };
    }
};

/* ==========================================================================
   7. TRANSLATION & LANGUAGE SERVICE
   ========================================================================== */
export const TranslationService = {
    detectLanguage(text) {
        const norm = text.toLowerCase();
        
        // Simple heuristic language checks
        const tamilWords = ['சாலை', 'குழி', 'குப்பை', 'மின்சாரம்', 'மரம்', 'தண்ணீர்', 'தெருவிளக்கு'];
        const hindiWords = ['गड्ढा', 'सड़क', 'कचरा', 'बिजली', 'पानी', 'पेड़', 'गंदगी'];
        const spanishWords = ['hoyo', 'bache', 'calle', 'basura', 'electricidad', 'agua', 'arbol'];
        const frenchWords = ['nid-de-poule', 'route', 'dechet', 'ordure', 'eau', 'arbre', 'electricite'];
        
        if (tamilWords.some(w => norm.includes(w))) return { code: 'ta', name: 'Tamil' };
        if (hindiWords.some(w => norm.includes(w))) return { code: 'hi', name: 'Hindi' };
        if (spanishWords.some(w => norm.includes(w))) return { code: 'es', name: 'Spanish' };
        if (frenchWords.some(w => norm.includes(w))) return { code: 'fr', name: 'French' };
        
        // Detect default non-ASCII character blocks
        if (/[\u0b80-\u0bff]/.test(text)) return { code: 'ta', name: 'Tamil' };
        if (/[\u0900-\u097f]/.test(text)) return { code: 'hi', name: 'Hindi' };
        
        return { code: 'en', name: 'English' };
    },
    
    async translateAndNormalize(text) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const lang = this.detectLanguage(text);
                let normalizedText = text;
                
                if (lang.code === 'ta') {
                    if (text.includes('சாலை குழி')) normalizedText = "There is a large pothole on the road.";
                    else if (text.includes('குப்பை')) normalizedText = "Garbage is overflowed near the street bin.";
                    else if (text.includes('மின்சாரம்')) normalizedText = "Electric wires are sparking and streetlight is broken.";
                    else normalizedText = "[Translated from Tamil]: " + text;
                } else if (lang.code === 'hi') {
                    if (text.includes('गड्ढा')) normalizedText = "Pothole on the main road causing traffic delays.";
                    else if (text.includes('कचरा')) normalizedText = "Huge pile of garbage accumulated on the corner.";
                    else normalizedText = "[Translated from Hindi]: " + text;
                } else if (lang.code === 'es') {
                    normalizedText = "[Translated from Spanish]: " + text;
                } else if (lang.code === 'fr') {
                    normalizedText = "[Translated from French]: " + text;
                }
                
                resolve({
                    detectedLanguage: lang.name,
                    detectedLanguageCode: lang.code,
                    originalText: text,
                    normalizedText: normalizedText
                });
            }, 800);
        });
    }
};

/* ==========================================================================
   8. NOTIFICATION SERVICE
   ========================================================================== */
export const NotificationService = {
    getAll(citizenId) {
        const key = `notifications_${citizenId}`;
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },
    
    add(citizenId, title, message, complaintId = null) {
        const key = `notifications_${citizenId}`;
        const notifications = this.getAll(citizenId);
        
        const newNotif = {
            id: 'NOTIF-' + Math.floor(100000 + Math.random() * 900000),
            title,
            message,
            complaintId,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        notifications.unshift(newNotif);
        localStorage.setItem(key, JSON.stringify(notifications));
        
        // Trigger simulated SMS and Email alerts
        console.log(`[Notification SMS] Sent to Citizen: "${title} - ${message}"`);
        console.log(`[Notification Email] Sent: Subject "${title}" Message: "${message}"`);
        
        // Dispatch UI Toast event
        const event = new CustomEvent('civic_notification_received', { detail: newNotif });
        window.dispatchEvent(event);
        
        return newNotif;
    },
    
    markAsRead(citizenId, notifId) {
        const key = `notifications_${citizenId}`;
        const notifications = this.getAll(citizenId);
        const notif = notifications.find(n => n.id === notifId);
        if (notif) {
            notif.read = true;
            localStorage.setItem(key, JSON.stringify(notifications));
        }
    },
    
    markAllAsRead(citizenId) {
        const key = `notifications_${citizenId}`;
        const notifications = this.getAll(citizenId);
        notifications.forEach(n => n.read = true);
        localStorage.setItem(key, JSON.stringify(notifications));
    }
};

/* ==========================================================================
   9. TRACKING & STATUS SIMULATION SERVICE
   ========================================================================== */
export const TrackingService = {
    // Advanced simulated workflows for backend operations
    simulateNextStep(complaintId) {
        const complaint = ComplaintService.getById(complaintId);
        if (!complaint) return null;
        
        const currentStatus = complaint.status;
        let nextStatus = currentStatus;
        let updateMsg = "";
        let updaterRole = "SYSTEM";
        
        switch (currentStatus) {
            case 'SUBMITTED':
                nextStatus = 'RECEIVED';
                updateMsg = 'Your complaint was received at the Central Command Center.';
                updaterRole = 'SYSTEM';
                break;
            case 'RECEIVED':
                nextStatus = 'DEPARTMENT_ASSIGNED';
                updateMsg = `Assigned to the ${complaint.recommendedDepartment}.`;
                updaterRole = 'ADMIN';
                break;
            case 'DEPARTMENT_ASSIGNED':
                nextStatus = 'OFFICER_ASSIGNED';
                updateMsg = 'Officer Rajesh Kumar has been assigned to inspect the site.';
                updaterRole = 'DEPT_HEAD';
                break;
            case 'OFFICER_ASSIGNED':
                nextStatus = 'WORK_SCHEDULED';
                updateMsg = 'Repair crew scheduled for dispatch within 24 hours.';
                updaterRole = 'OFFICER';
                break;
            case 'WORK_SCHEDULED':
                nextStatus = 'WORK_IN_PROGRESS';
                updateMsg = 'Repair crew has arrived on site. Restorations underway.';
                updaterRole = 'OFFICER';
                break;
            case 'WORK_IN_PROGRESS':
                nextStatus = 'WORK_COMPLETED';
                // Attach mock completion image link or evidence
                complaint.completionImage = "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=600"; // Placeholder resolved pothole/clean street
                complaint.resolutionDetails = "Pothole filled with standard asphalt grade. Surface smoothed and cured.";
                updateMsg = 'Work completed by the field crew. Pending validation checks.';
                updaterRole = 'OFFICER';
                break;
            case 'WORK_COMPLETED':
                nextStatus = 'RESOLVED';
                updateMsg = 'Verification completed. Complaint marked as resolved.';
                updaterRole = 'ADMIN';
                break;
            default:
                return null;
        }
        
        if (nextStatus !== currentStatus) {
            ComplaintService.addHistoryStatus(complaintId, nextStatus, updateMsg, updaterRole);
            
            // Add notification alert
            NotificationService.add(
                complaint.citizenId, 
                `Complaint Status: ${nextStatus.replace(/_/g, ' ')}`, 
                `Complaint ${complaint.id} - ${updateMsg}`,
                complaint.id
            );
            
            // Dispatch update event
            const event = new CustomEvent('civic_status_updated', { detail: { complaintId, status: nextStatus } });
            window.dispatchEvent(event);
            
            return nextStatus;
        }
        return null;
    },
    
    triggerSlaAlert(complaintId) {
        const complaint = ComplaintService.getById(complaintId);
        if (complaint) {
            const msg = `SLA Delay Notification: Complaint ${complaint.id} has exceeded the standard 48-hour response limit. It has been escalated to senior engineers.`;
            NotificationService.add(complaint.citizenId, 'Escalation Warning', msg, complaint.id);
            ComplaintService.addHistoryStatus(complaintId, complaint.status, "SLA limit warning: Ticket escalated due to delay.", "SYSTEM");
        }
    }
};

/* ==========================================================================
   10. DEMO LOAD INITIAL COMPLAINTS (TO ENABLE DUPLICATE SCENARIOS)
   ========================================================================== */
export const DemoService = {
    loadSamples(citizenId) {
        const samples = [
            {
                id: 'CIV-2026-981274',
                citizenId: 'CIT-9999', // Reported by someone else
                originalDescription: "Rampant garbage overflowing from public bin near Nageswara Rao park.",
                normalizedDescription: "Garbage is overflowed near the street bin.",
                originalLanguage: "English",
                image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?q=80&w=600",
                location: {
                    lat: 13.0422, // 70 meters from center
                    lng: 80.2345,
                    address: "Nageswara Road, T. Nagar, Chennai, Tamil Nadu 600017",
                    timestamp: new Date().toISOString()
                },
                category: "Garbage / Waste",
                priority: "Medium",
                recommendedCategory: "Garbage / Waste",
                recommendedPriority: "Medium",
                recommendedDepartment: "Sanitation / Waste Management",
                aiConfidence: 95,
                status: 'WORK_IN_PROGRESS',
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
                lastUpdated: new Date().toISOString(),
                statusHistory: [
                    { status: 'SUBMITTED', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), description: 'Reported.', role: 'CITIZEN' },
                    { status: 'RECEIVED', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), description: 'Complaint logged.', role: 'SYSTEM' },
                    { status: 'DEPARTMENT_ASSIGNED', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), description: 'Assigned to Sanitation.', role: 'ADMIN' },
                    { status: 'WORK_IN_PROGRESS', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), description: 'Crew cleaning garbage pile.', role: 'OFFICER' }
                ],
                supporters: [],
                feedback: null
            },
            {
                id: 'CIV-2026-320491',
                citizenId: 'CIT-8924', // Reported by current logged user
                originalDescription: "Dangerous wiring hanging down low from streetlight post.",
                normalizedDescription: "Electric wires are sparking and streetlight is broken.",
                originalLanguage: "English",
                image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600",
                location: {
                    lat: 13.0415,
                    lng: 80.2338,
                    address: "Usman Road, T. Nagar, Chennai, Tamil Nadu 600017",
                    timestamp: new Date().toISOString()
                },
                category: "Streetlight / Electrical",
                priority: "Critical",
                recommendedCategory: "Streetlight / Electrical",
                recommendedPriority: "Critical",
                recommendedDepartment: "Electrical Department",
                aiConfidence: 91,
                status: 'RESOLVED',
                completionImage: "https://images.unsplash.com/photo-1513829092301-0227e78d48a9?q=80&w=600",
                resolutionDetails: "Replaced damaged connection cables and secured terminal box on pole #12.",
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
                lastUpdated: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
                statusHistory: [
                    { status: 'SUBMITTED', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), description: 'Reported.', role: 'CITIZEN' },
                    { status: 'RESOLVED', timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), description: 'Issue solved. Repaired wires.', role: 'ADMIN' }
                ],
                supporters: [],
                feedback: {
                    rating: 5,
                    comment: "Fast restoration! Thank you.",
                    solved: "Yes"
                }
            }
        ];
        
        const existing = ComplaintService.getAll();
        // Insert samples if they aren't already present
        let updated = [...existing];
        let count = 0;
        
        samples.forEach(s => {
            if (!existing.some(e => e.id === s.id)) {
                updated.push(s);
                count++;
            }
        });
        
        if (count > 0) {
            localStorage.setItem('civic_complaints', JSON.stringify(updated));
            console.log(`[DemoService] Loaded ${count} sample complaints into localStorage.`);
        }
    }
};

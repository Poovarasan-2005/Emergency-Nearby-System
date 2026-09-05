"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Security & Parsing Middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Allows flexible client proxying in dev
}));
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(express_1.default.json({ limit: '1mb' }));
// Global Rate Limiter
const globalLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    message: { error: 'Too many requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', globalLimiter);
// Specific strict rate limiter for SOS triggers (prevents abuse while allowing genuine emergencies)
const sosLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 12,
    message: { error: 'Rate limit reached for emergency activations. Dial 911 / 112 directly.' },
});
const sessionsDB = new Map();
const shareTokensDB = new Map();
const auditLogsDB = [];
// Seed demo sessions
sessionsDB.set('SOS-DEMO-1', {
    id: 'SOS-DEMO-1',
    userId: 'usr_demo_citizen',
    category: 'medical',
    status: 'resolved',
    lat: 40.7128,
    lng: -74.006,
    accuracy: 15,
    address: 'Broadway & Fulton St, New York, NY',
    notes: 'Admitted safely to Downtown Medical Center. Patient stable.',
    notifiedContactsCount: 2,
    actionsTaken: [
        'SOS Triggered at 40.7128, -74.0060',
        'Primary Contact (Maria) notified via SMS',
        'Secondary Contact (David) notified via SMS',
        'Destination locked: Downtown Medical Center',
        'Emergency marked resolved by patient',
    ],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    resolvedAt: new Date(Date.now() - 3600000 * 1.5).toISOString(),
});
// Helper for security logging
const logSecurityAudit = (action, userId, req, details) => {
    const log = {
        id: `audit_${Date.now()}_${crypto_1.default.randomBytes(3).toString('hex')}`,
        action,
        userId: userId || 'anonymous',
        timestamp: new Date().toISOString(),
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        details,
    };
    auditLogsDB.unshift(log);
    if (auditLogsDB.length > 500)
        auditLogsDB.pop();
};
// Haversine formula
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(2));
};
// -------------------------------------------------------------
// 1. Health & Status
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        system: 'Emergency Nearby System API',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
    });
});
// -------------------------------------------------------------
// 2. Nearby Services Discovery & Smart Ranking
// -------------------------------------------------------------
app.get('/api/nearby-services', async (req, res) => {
    try {
        const lat = parseFloat(req.query.lat);
        const lng = parseFloat(req.query.lng);
        const radiusKm = Math.min(25, Math.max(1, parseFloat(req.query.radiusKm || '5')));
        const category = req.query.category || 'all';
        const emergencyCategory = req.query.emergencyCategory || 'unknown';
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            return res.status(400).json({ error: 'Valid latitude (-90 to 90) and longitude (-180 to 180) required.' });
        }
        // High-precision deterministic facility generation
        const templates = [
            { name: 'City Trauma & Emergency Center', category: 'emergency_room', dLat: 0.0072, dLng: 0.0051, phone: '+1 (555) 911-3000', rating: 4.8, reviews: 642, address: '450 Emergency Blvd, Level 1 Trauma' },
            { name: 'Saint Jude Metropolitan Hospital', category: 'hospital', dLat: -0.0094, dLng: 0.0083, phone: '+1 (555) 834-1200', rating: 4.6, reviews: 890, address: '120 Health Sciences Way' },
            { name: 'Central District Police Precinct', category: 'police', dLat: 0.0041, dLng: -0.0062, phone: '+1 (555) 321-4400', rating: 4.4, reviews: 310, address: '88 Civic Justice Center' },
            { name: 'Fire Rescue Battalion & Paramedics', category: 'fire_station', dLat: -0.0055, dLng: -0.0048, phone: '+1 (555) 234-9911', rating: 4.9, reviews: 420, address: '14 Station Square' },
            { name: '24-Hour Urgent Care & Pharmacy', category: 'pharmacy', dLat: 0.0125, dLng: 0.0031, phone: '+1 (555) 678-2233', rating: 4.5, reviews: 512, address: '710 Grand Parkway' },
            { name: 'Community Medical Center & Clinic', category: 'medical_clinic', dLat: -0.0142, dLng: -0.0079, phone: '+1 (555) 443-8900', rating: 4.3, reviews: 180, address: '22 Elm Street Suite 100' },
            { name: 'Red Cross Emergency Blood Bank', category: 'blood_bank', dLat: 0.0168, dLng: -0.0112, phone: '+1 (555) 777-2244', rating: 4.7, reviews: 290, address: '305 Life Line Avenue' },
            { name: 'Safe Haven Emergency Crisis Shelter', category: 'shelter', dLat: -0.0185, dLng: 0.0135, phone: '+1 (555) 888-4357', rating: 4.8, reviews: 145, address: '50 Sanctuary Path' },
        ];
        const facilities = templates.map((tpl, i) => {
            const fLat = parseFloat((lat + tpl.dLat).toFixed(6));
            const fLng = parseFloat((lng + tpl.dLng).toFixed(6));
            const dist = calculateDistanceKm(lat, lng, fLat, fLng);
            const estimatedMins = Math.max(2, Math.round(dist * 2.8));
            // Scoring
            let score = 50;
            const reasons = [];
            if (dist <= 1.5) {
                score += 30;
                reasons.push('Immediate Proximity (<1.5 km)');
            }
            else if (dist <= 3.5) {
                score += 20;
                reasons.push('Close Proximity (<3.5 km)');
            }
            else {
                score += 10;
            }
            if (emergencyCategory === 'medical' && (tpl.category === 'emergency_room' || tpl.category === 'hospital')) {
                score += 25;
                reasons.push('Direct Match: Emergency Medical');
            }
            else if (emergencyCategory === 'crime' && tpl.category === 'police') {
                score += 25;
                reasons.push('Direct Match: Police & Threat Response');
            }
            else if (emergencyCategory === 'fire' && tpl.category === 'fire_station') {
                score += 25;
                reasons.push('Direct Match: Fire & Hazmat');
            }
            score += 10; // Open 24/7
            reasons.push('Open 24/7');
            if (tpl.rating >= 4.5) {
                score += 5;
                reasons.push(`Top Rated (${tpl.rating} ★)`);
            }
            return {
                id: `fac-${i + 1}`,
                name: tpl.name,
                category: tpl.category,
                lat: fLat,
                lng: fLng,
                distanceKm: dist,
                estimatedTravelMins: estimatedMins,
                address: tpl.address,
                phone: tpl.phone,
                isOpen: true,
                isVerified: true,
                rating: tpl.rating,
                userRatingsTotal: tpl.reviews,
                recommendationScore: Math.min(99, Math.max(20, score)),
                recommendationReasons: reasons,
            };
        })
            .filter((fac) => {
            if (category !== 'all' && fac.category !== category)
                return false;
            return fac.distanceKm <= radiusKm;
        })
            .sort((a, b) => b.recommendationScore - a.recommendationScore);
        res.json({
            success: true,
            origin: { lat, lng },
            radiusKm,
            totalCount: facilities.length,
            facilities,
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to search nearby facilities', message: err.message });
    }
});
// -------------------------------------------------------------
// 3. Emergency SOS Lifecycle Management
// -------------------------------------------------------------
// Start SOS
app.post('/api/emergency/start', sosLimiter, (req, res) => {
    const { userId, lat, lng, accuracy, category, address, notifiedContactsCount } = req.body;
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        return res.status(400).json({ error: 'Valid lat and lng numbers are required.' });
    }
    const sessionId = `SOS-${Date.now().toString(36).toUpperCase()}`;
    const record = {
        id: sessionId,
        userId: userId || 'anonymous',
        category: category || 'unknown',
        status: 'active',
        lat,
        lng,
        accuracy: accuracy || 15,
        address: address || 'Current Recorded GPS Pinpoint',
        notifiedContactsCount: notifiedContactsCount || 0,
        actionsTaken: [
            `Emergency SOS activated at ${lat.toFixed(5)}, ${lng.toFixed(5)} (±${accuracy || 15}m)`,
            `${notifiedContactsCount || 0} trusted emergency contacts pinged with live coordinates`,
        ],
        createdAt: new Date().toISOString(),
    };
    sessionsDB.set(sessionId, record);
    logSecurityAudit('SOS_ACTIVATED', userId, req, { sessionId, lat, lng, category });
    res.status(201).json({
        success: true,
        session: record,
        message: 'Emergency SOS activated. Immediate coordinates captured.',
    });
});
// Resolve SOS
app.post('/api/emergency/resolve', (req, res) => {
    const { sessionId, userId, notes } = req.body;
    if (!sessionId)
        return res.status(400).json({ error: 'sessionId is required' });
    const record = sessionsDB.get(sessionId);
    if (!record) {
        return res.status(404).json({ error: 'Emergency session not found' });
    }
    record.status = 'resolved';
    record.resolvedAt = new Date().toISOString();
    if (notes)
        record.notes = notes;
    record.actionsTaken.push(`Emergency safely resolved: ${notes || 'User confirmed safe'}`);
    // Revoke any active share tokens for this session
    for (const [token, share] of shareTokensDB.entries()) {
        if (share.sessionId === sessionId && share.status === 'active') {
            share.status = 'revoked';
        }
    }
    logSecurityAudit('SOS_RESOLVED', userId, req, { sessionId, notes });
    res.json({ success: true, session: record, message: 'Emergency session resolved.' });
});
// Cancel SOS
app.post('/api/emergency/cancel', (req, res) => {
    const { sessionId, userId, reason } = req.body;
    if (!sessionId)
        return res.status(400).json({ error: 'sessionId is required' });
    const record = sessionsDB.get(sessionId);
    if (!record) {
        return res.status(404).json({ error: 'Emergency session not found' });
    }
    record.status = 'cancelled';
    record.resolvedAt = new Date().toISOString();
    record.notes = `Cancelled: ${reason || 'User cancelled'}`;
    record.actionsTaken.push(`Emergency cancelled: ${reason || 'False activation'}`);
    // Revoke any active share tokens
    for (const [token, share] of shareTokensDB.entries()) {
        if (share.sessionId === sessionId && share.status === 'active') {
            share.status = 'revoked';
        }
    }
    logSecurityAudit('SOS_CANCELLED', userId, req, { sessionId, reason });
    res.json({ success: true, session: record, message: 'Emergency session cancelled.' });
});
// Get Active Session
app.get('/api/emergency/active', (req, res) => {
    const userId = req.query.userId;
    if (!userId)
        return res.status(400).json({ error: 'userId is required' });
    for (const record of sessionsDB.values()) {
        if (record.userId === userId && record.status === 'active') {
            return res.json({ session: record });
        }
    }
    res.json({ session: null });
});
// Get Session History
app.get('/api/emergency/history', (req, res) => {
    const userId = req.query.userId;
    if (!userId)
        return res.status(400).json({ error: 'userId is required' });
    const userSessions = Array.from(sessionsDB.values())
        .filter((s) => s.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ count: userSessions.length, history: userSessions });
});
// -------------------------------------------------------------
// 4. Secure Tokenized Live Location Sharing
// -------------------------------------------------------------
// Create tokenized share link
app.post('/api/emergency/share', (req, res) => {
    const { sessionId, userId, lat, lng, accuracy, category, durationMinutes } = req.body;
    const duration = Math.min(60, Math.max(5, parseInt(durationMinutes || '20', 10)));
    const token = crypto_1.default.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + duration * 60000).toISOString();
    const shareRecord = {
        token,
        sessionId: sessionId || 'SOS-MANUAL',
        userId: userId || 'anonymous',
        lat: lat || 40.7128,
        lng: lng || -74.006,
        accuracy: accuracy || 15,
        category: category || 'Medical Emergency',
        status: 'active',
        expiresAt,
        createdAt: new Date().toISOString(),
    };
    shareTokensDB.set(token, shareRecord);
    logSecurityAudit('SHARE_TOKEN_CREATED', userId, req, { token, expiresAt });
    res.status(201).json({
        success: true,
        token,
        expiresAt,
        durationMinutes: duration,
        sharePath: `/share/${token}`,
    });
});
// Public read-only tracking endpoint
app.get('/api/emergency/share/:token', (req, res) => {
    const { token } = req.params;
    const record = shareTokensDB.get(token);
    if (!record) {
        return res.status(404).json({ error: 'Tracking link not found or invalid token.' });
    }
    // Check expiration
    if (record.status === 'active' && new Date(record.expiresAt).getTime() < Date.now()) {
        record.status = 'expired';
    }
    if (record.status !== 'active') {
        return res.status(410).json({
            status: record.status,
            message: `This live location sharing session is ${record.status}.`,
        });
    }
    // Privacy protection: Return ONLY coordinates, accuracy, and expiration
    // NEVER return user's identity, full address, password, or medical history
    res.json({
        status: 'active',
        lat: record.lat,
        lng: record.lng,
        accuracy: record.accuracy,
        category: record.category,
        expiresAt: record.expiresAt,
        lastUpdated: new Date().toISOString(),
    });
});
// Revoke share token
app.delete('/api/emergency/share/:token', (req, res) => {
    const { token } = req.params;
    const record = shareTokensDB.get(token);
    if (!record) {
        return res.status(404).json({ error: 'Token not found.' });
    }
    record.status = 'revoked';
    logSecurityAudit('SHARE_TOKEN_REVOKED', record.userId, req, { token });
    res.json({ success: true, message: 'Live sharing has been revoked immediately.' });
});
// -------------------------------------------------------------
// 5. Trusted Contacts & Notifications Simulation
// -------------------------------------------------------------
app.post('/api/emergency/contacts/test-alert', (req, res) => {
    const { contactName, phone, relationship } = req.body;
    if (!phone) {
        return res.status(400).json({ error: 'Phone number is required for SMS simulation.' });
    }
    const dispatchId = `SMS-${crypto_1.default.randomBytes(4).toString('hex').toUpperCase()}`;
    res.json({
        success: true,
        dispatchId,
        message: `Simulated SMS dispatched to ${contactName || 'Emergency Contact'} (${phone}): "TEST ALERT: Emergency system verified for ${relationship || 'Contact'}."`,
        timestamp: new Date().toISOString(),
    });
});
// -------------------------------------------------------------
// 6. Admin Telemetry & Audit Logs
// -------------------------------------------------------------
app.get('/api/admin/telemetry', (req, res) => {
    const activeCount = Array.from(sessionsDB.values()).filter((s) => s.status === 'active').length;
    res.json({
        systemHealth: 'HEALTHY',
        apiUptime: process.uptime(),
        activeSosSessions: activeCount,
        totalSessionsRecorded: sessionsDB.size,
        totalShareTokens: shareTokensDB.size,
        auditLogs: auditLogsDB.slice(0, 50),
    });
});
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ error: 'API route not found' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal emergency server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});
app.listen(PORT, () => {
    console.log(`[Emergency Nearby Server] Running on http://localhost:${PORT}`);
});

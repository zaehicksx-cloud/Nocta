const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { authenticateToken } = require('../middleware/auth');

// Login / Authenticate
router.post('/login', (req, res) => {
    try {
        const { license_key, hwid, version } = req.body;

        if (!license_key || !hwid) {
            return res.status(400).json({ error: 'License key and HWID required' });
        }

        // Find user by license key
        const user = db.prepare('SELECT * FROM users WHERE license_key = ?').get(license_key);

        if (!user) {
            return res.status(401).json({ error: 'Invalid license key' });
        }

        if (user.is_banned) {
            return res.status(403).json({ error: 'Your account has been banned' });
        }

        // Check if license expired
        if (user.expires_at) {
            const expiryDate = new Date(user.expires_at);
            const now = new Date();
            
            if (expiryDate < now) {
                return res.status(403).json({ error: 'License expired' });
            }
        }

        // Update or set HWID
        if (!user.hwid) {
            db.prepare('UPDATE users SET hwid = ? WHERE id = ?').run(hwid, user.id);
        } else if (user.hwid !== hwid) {
            return res.status(403).json({ error: 'HWID mismatch. Contact support for HWID reset.' });
        }

        // Update last login
        db.prepare('UPDATE users SET last_login = datetime("now") WHERE id = ?').run(user.id);

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, tier: user.tier },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Store session
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        db.prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)').run(
            user.id,
            token,
            expiresAt.toISOString()
        );

        // Calculate days remaining
        let daysRemaining = 999;
        if (user.expires_at) {
            const expiry = new Date(user.expires_at);
            const now = new Date();
            daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
        }

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                hwid: user.hwid,
                tier: user.tier,
                expires_at: user.expires_at,
                days_remaining: daysRemaining
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Validate session
router.get('/validate', authenticateToken, (req, res) => {
    res.json({
        valid: true,
        user: {
            id: req.user.id,
            username: req.user.username,
            tier: req.user.tier
        }
    });
});

// Logout
router.post('/logout', authenticateToken, (req, res) => {
    try {
        db.prepare('DELETE FROM sessions WHERE token = ?').run(req.token);
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Check for updates
router.get('/check', (req, res) => {
    try {
        const currentVersion = req.query.version || '0.0.0';

        // Get latest update
        const latestUpdate = db.prepare(`
            SELECT * FROM updates 
            ORDER BY created_at DESC 
            LIMIT 1
        `).get();

        if (!latestUpdate) {
            return res.json({
                latest_version: currentVersion,
                update_available: false
            });
        }

        const updateAvailable = latestUpdate.version !== currentVersion;

        res.json({
            latest_version: latestUpdate.version,
            download_url: latestUpdate.download_url,
            changelog: latestUpdate.changelog,
            update_available: updateAvailable,
            mandatory: latestUpdate.mandatory === 1
        });
    } catch (error) {
        console.error('Check updates error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all updates
router.get('/history', (req, res) => {
    try {
        const updates = db.prepare(`
            SELECT version, changelog, created_at 
            FROM updates 
            ORDER BY created_at DESC 
            LIMIT 10
        `).all();

        res.json({ updates });
    } catch (error) {
        console.error('Get updates error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

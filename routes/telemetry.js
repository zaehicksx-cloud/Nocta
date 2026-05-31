const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Send telemetry - NO AUTH
router.post('/', (req, res) => {
    try {
        const { event_type, data, timestamp } = req.body;

        if (!event_type) {
            return res.status(400).json({ error: 'Event type required' });
        }

        db.prepare(`
            INSERT INTO telemetry (event_type, data, timestamp)
            VALUES (?, ?, ?)
        `).run(
            event_type,
            JSON.stringify(data || {}),
            timestamp ? new Date(timestamp * 1000).toISOString() : new Date().toISOString()
        );

        res.json({ message: 'Telemetry received' });
    } catch (error) {
        console.error('Telemetry error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get telemetry stats (admin only - you can add admin middleware)
router.get('/stats', (req, res) => {
    try {
        const stats = {
            total_events: db.prepare('SELECT COUNT(*) as count FROM telemetry').get().count,
            crashes: db.prepare('SELECT COUNT(*) as count FROM telemetry WHERE event_type = "crash"').get().count,
            feature_usage: db.prepare(`
                SELECT data, COUNT(*) as count 
                FROM telemetry 
                WHERE event_type = "feature_usage" 
                GROUP BY data 
                ORDER BY count DESC 
                LIMIT 10
            `).all()
        };

        res.json(stats);
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

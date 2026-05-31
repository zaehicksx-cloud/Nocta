const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const db = require('../database/db');

// Get all configs (paginated) - NO AUTH
router.get('/', (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        const configs = db.prepare(`
            SELECT 
                c.id, c.name, c.share_code, c.downloads, c.created_at, c.author
            FROM configs c
            ORDER BY c.created_at DESC
            LIMIT ? OFFSET ?
        `).all(limit, offset);

        const total = db.prepare('SELECT COUNT(*) as count FROM configs').get().count;

        res.json({
            configs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get configs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get config by share code - NO AUTH
router.get('/:shareCode', (req, res) => {
    try {
        const { shareCode } = req.params;

        const config = db.prepare(`
            SELECT 
                c.id, c.name, c.share_code, c.data, c.downloads, c.created_at, c.author
            FROM configs c
            WHERE c.share_code = ?
        `).get(shareCode);

        if (!config) {
            return res.status(404).json({ error: 'Config not found' });
        }

        // Increment download count
        db.prepare('UPDATE configs SET downloads = downloads + 1 WHERE id = ?').run(config.id);

        res.json(config);
    } catch (error) {
        console.error('Get config error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Upload config - NO AUTH (handled by loader)
router.post('/', (req, res) => {
    try {
        const { name, data, author } = req.body;

        if (!name || !data) {
            return res.status(400).json({ error: 'Name and data required' });
        }

        // Generate unique share code
        const shareCode = nanoid(8);

        const result = db.prepare(`
            INSERT INTO configs (name, share_code, data, author)
            VALUES (?, ?, ?, ?)
        `).run(name, shareCode, data, author || 'Anonymous');

        res.status(201).json({
            id: result.lastInsertRowid,
            share_code: shareCode,
            message: 'Config uploaded successfully'
        });
    } catch (error) {
        console.error('Upload config error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete config - NO AUTH (anyone can delete with ID)
router.delete('/:configId', (req, res) => {
    try {
        const { configId } = req.params;

        const config = db.prepare('SELECT * FROM configs WHERE id = ?').get(configId);

        if (!config) {
            return res.status(404).json({ error: 'Config not found' });
        }

        db.prepare('DELETE FROM configs WHERE id = ?').run(configId);

        res.json({ message: 'Config deleted successfully' });
    } catch (error) {
        console.error('Delete config error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

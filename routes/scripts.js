const express = require('express');
const router = express.Router();
const db = require('../database/db');

// Get all scripts - NO AUTH
router.get('/', (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const category = req.query.category || '';
        const offset = (page - 1) * limit;

        let query = 'SELECT id, name, description, author, category, downloads, rating, created_at FROM scripts';
        let params = [];

        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }

        query += ' ORDER BY downloads DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const scripts = db.prepare(query).all(...params);

        const totalQuery = category 
            ? 'SELECT COUNT(*) as count FROM scripts WHERE category = ?'
            : 'SELECT COUNT(*) as count FROM scripts';
        
        const total = category
            ? db.prepare(totalQuery).get(category).count
            : db.prepare(totalQuery).get().count;

        res.json({
            scripts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get scripts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get script by ID - NO AUTH
router.get('/:scriptId', (req, res) => {
    try {
        const { scriptId } = req.params;

        const script = db.prepare('SELECT * FROM scripts WHERE id = ?').get(scriptId);

        if (!script) {
            return res.status(404).json({ error: 'Script not found' });
        }

        // Increment download count
        db.prepare('UPDATE scripts SET downloads = downloads + 1 WHERE id = ?').run(scriptId);

        res.json(script);
    } catch (error) {
        console.error('Get script error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Upload script - NO AUTH
router.post('/', (req, res) => {
    try {
        const { name, description, category, code, author } = req.body;

        if (!name || !code) {
            return res.status(400).json({ error: 'Name and code required' });
        }

        const result = db.prepare(`
            INSERT INTO scripts (name, description, author, category, code)
            VALUES (?, ?, ?, ?, ?)
        `).run(name, description || '', author || 'Anonymous', category || 'misc', code);

        res.status(201).json({
            id: result.lastInsertRowid,
            message: 'Script uploaded successfully'
        });
    } catch (error) {
        console.error('Upload script error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

const jwt = require('jsonwebtoken');
const db = require('../database/db');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if session exists and is valid
        const session = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > datetime("now")').get(token);
        
        if (!session) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }

        // Get user
        const user = db.prepare('SELECT * FROM users WHERE id = ? AND is_banned = 0').get(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ error: 'User not found or banned' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid token' });
    }
}

function requireTier(minTier) {
    const tierLevels = {
        'free': 0,
        'premium': 1,
        'lifetime': 2
    };

    return (req, res, next) => {
        const userTier = req.user.tier || 'free';
        
        if (tierLevels[userTier] < tierLevels[minTier]) {
            return res.status(403).json({ 
                error: `This feature requires ${minTier} tier or higher`,
                current_tier: userTier,
                required_tier: minTier
            });
        }

        next();
    };
}

module.exports = { authenticateToken, requireTier };

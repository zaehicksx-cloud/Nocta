const express = require('express');
const router = express.Router();

// Get server status
router.get('/', (req, res) => {
    try {
        const killSwitch = process.env.KILL_SWITCH === 'true';
        const maintenance = process.env.MAINTENANCE_MODE === 'true';
        const detectedGameVersion = process.env.DETECTED_GAME_VERSION || '';
        const isGameVersionSafe = process.env.IS_GAME_VERSION_SAFE !== 'false';

        let message = '';
        
        if (killSwitch) {
            message = '⚠️ Cheat temporarily disabled - Rockstar is actively banning!';
        } else if (maintenance) {
            message = '🔧 Server under maintenance. Please try again later.';
        } else if (!isGameVersionSafe) {
            message = `⚠️ Warning: Game version ${detectedGameVersion} may be risky!`;
        } else {
            message = '✅ All systems operational';
        }

        res.json({
            kill_switch: killSwitch,
            maintenance: maintenance,
            message: message,
            detected_game_version: detectedGameVersion,
            is_game_version_safe: isGameVersionSafe,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

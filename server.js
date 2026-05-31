require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// No auth routes - handled by loader
const configRoutes = require('./routes/configs');
const scriptRoutes = require('./routes/scripts');
const updateRoutes = require('./routes/updates');
const statusRoutes = require('./routes/status');
const telemetryRoutes = require('./routes/telemetry');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: { error: 'Too many requests, please try again later.' }
});

app.use('/v1/', limiter);

// Health check
app.get('/', (req, res) => {
    res.json({
        name: 'Nocta API',
        version: '1.0.0',
        status: 'online',
        note: 'Authentication handled by loader',
        timestamp: new Date().toISOString()
    });
});

// Routes (no auth required)
app.use('/v1/configs', configRoutes);
app.use('/v1/scripts', scriptRoutes);
app.use('/v1/updates', updateRoutes);
app.use('/v1/status', statusRoutes);
app.use('/v1/telemetry', telemetryRoutes);
app.use('/v1/scripts', scriptRoutes);
app.use('/v1/updates', updateRoutes);
app.use('/v1/status', statusRoutes);
app.use('/v1/telemetry', telemetryRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`╔═══════════════════════════════════════╗`);
    console.log(`║     Nocta API Server v1.0.0          ║`);
    console.log(`╚═══════════════════════════════════════╝`);
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Kill Switch: ${process.env.KILL_SWITCH === 'true' ? 'ENABLED' : 'DISABLED'}`);
    console.log(`\n✅ Ready to accept connections\n`);
});

module.exports = app;

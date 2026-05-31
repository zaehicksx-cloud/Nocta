const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'nocta.db');
const dbDir = path.dirname(dbPath);

// Ensure database directory exists
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Initialize tables
function initDatabase() {
    // Users table
    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            license_key TEXT UNIQUE NOT NULL,
            hwid TEXT,
            tier TEXT DEFAULT 'free',
            expires_at TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            last_login TEXT,
            is_banned INTEGER DEFAULT 0
        )
    `);

    // Sessions table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            expires_at TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Configs table
    db.exec(`
        CREATE TABLE IF NOT EXISTS configs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            share_code TEXT UNIQUE NOT NULL,
            data TEXT NOT NULL,
            author TEXT DEFAULT 'Anonymous',
            downloads INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Scripts table
    db.exec(`
        CREATE TABLE IF NOT EXISTS scripts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            author TEXT,
            category TEXT,
            code TEXT NOT NULL,
            downloads INTEGER DEFAULT 0,
            rating REAL DEFAULT 0.0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Telemetry table (no user_id)
    db.exec(`
        CREATE TABLE IF NOT EXISTS telemetry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            data TEXT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Updates table
    db.exec(`
        CREATE TABLE IF NOT EXISTS updates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version TEXT UNIQUE NOT NULL,
            download_url TEXT NOT NULL,
            changelog TEXT,
            mandatory INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    console.log('✅ Database initialized successfully');
}

initDatabase();

module.exports = db;

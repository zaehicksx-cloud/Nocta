// Script om een user te bannen
const db = require('../database/db');

const licenseKey = process.argv[2];

if (!licenseKey) {
    console.log('Usage: node ban-user.js <LICENSE_KEY>');
    console.log('Example: node ban-user.js NOCTA-ABCD-1234-EFGH-5678');
    process.exit(1);
}

const user = db.prepare('SELECT * FROM users WHERE license_key = ?').get(licenseKey);

if (!user) {
    console.log('❌ User not found with license key:', licenseKey);
    process.exit(1);
}

if (user.is_banned) {
    console.log('⚠️  User is already banned');
    process.exit(0);
}

db.prepare('UPDATE users SET is_banned = 1 WHERE license_key = ?').run(licenseKey);

// Delete all sessions
db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);

console.log('✅ User banned successfully');
console.log('Username:', user.username);
console.log('License Key:', licenseKey);
console.log('\nThe user will be kicked on next API call.');

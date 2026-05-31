// Script om HWID te resetten (voor als iemand nieuwe PC heeft)
const db = require('../database/db');

const licenseKey = process.argv[2];

if (!licenseKey) {
    console.log('Usage: node reset-hwid.js <LICENSE_KEY>');
    console.log('Example: node reset-hwid.js NOCTA-ABCD-1234-EFGH-5678');
    process.exit(1);
}

const user = db.prepare('SELECT * FROM users WHERE license_key = ?').get(licenseKey);

if (!user) {
    console.log('❌ User not found with license key:', licenseKey);
    process.exit(1);
}

const oldHwid = user.hwid;

db.prepare('UPDATE users SET hwid = NULL WHERE license_key = ?').run(licenseKey);

console.log('✅ HWID reset successfully');
console.log('Username:', user.username);
console.log('Old HWID:', oldHwid || 'None');
console.log('\nUser can now login from a new PC.');

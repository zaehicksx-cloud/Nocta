// Script om alle users te bekijken
const db = require('../database/db');

console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
console.log('║                           Nocta Users List                                ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

const users = db.prepare(`
    SELECT id, username, license_key, tier, expires_at, last_login, is_banned
    FROM users
    ORDER BY id DESC
`).all();

if (users.length === 0) {
    console.log('No users found.');
} else {
    users.forEach(user => {
        console.log(`ID: ${user.id}`);
        console.log(`Username: ${user.username}`);
        console.log(`License Key: ${user.license_key}`);
        console.log(`Tier: ${user.tier}`);
        
        if (user.expires_at) {
            const expiry = new Date(user.expires_at);
            const now = new Date();
            const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
            
            if (daysLeft > 0) {
                console.log(`Expires: ${expiry.toLocaleDateString()} (${daysLeft} days left)`);
            } else {
                console.log(`Expires: ${expiry.toLocaleDateString()} (EXPIRED)`);
            }
        } else {
            console.log(`Expires: Never`);
        }
        
        console.log(`Last Login: ${user.last_login || 'Never'}`);
        console.log(`Banned: ${user.is_banned ? 'YES' : 'No'}`);
        console.log('─────────────────────────────────────────────────────────────────────────────');
    });

    console.log(`\nTotal users: ${users.length}`);
}

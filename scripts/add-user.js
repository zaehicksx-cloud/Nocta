// Script om nieuwe users/license keys toe te voegen
const db = require('../database/db');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function generateLicenseKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = 'NOCTA-';
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        if (i < 3) key += '-';
    }
    return key;
}

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function main() {
    console.log('╔═══════════════════════════════════════╗');
    console.log('║   Nocta License Key Generator        ║');
    console.log('╚═══════════════════════════════════════╝\n');

    const username = await question('Username: ');
    
    console.log('\nTier options:');
    console.log('1. Free');
    console.log('2. Premium (30 days)');
    console.log('3. Premium (90 days)');
    console.log('4. Lifetime');
    
    const tierChoice = await question('\nSelect tier (1-4): ');
    
    let tier = 'free';
    let expiresAt = null;
    
    switch(tierChoice) {
        case '1':
            tier = 'free';
            break;
        case '2':
            tier = 'premium';
            expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            break;
        case '3':
            tier = 'premium';
            expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
            break;
        case '4':
            tier = 'lifetime';
            break;
        default:
            console.log('Invalid choice, defaulting to free');
    }

    const licenseKey = generateLicenseKey();

    try {
        db.prepare(`
            INSERT INTO users (username, license_key, tier, expires_at)
            VALUES (?, ?, ?, ?)
        `).run(username, licenseKey, tier, expiresAt);

        console.log('\n✅ User created successfully!\n');
        console.log('═══════════════════════════════════════');
        console.log('Username:     ', username);
        console.log('License Key:  ', licenseKey);
        console.log('Tier:         ', tier);
        if (expiresAt) {
            console.log('Expires:      ', new Date(expiresAt).toLocaleDateString());
        } else {
            console.log('Expires:       Never');
        }
        console.log('═══════════════════════════════════════\n');

    } catch (error) {
        console.error('❌ Error creating user:', error.message);
    }

    rl.close();
}

main();

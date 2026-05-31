// Script om statistieken te bekijken
const db = require('../database/db');

console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
console.log('║                         Nocta API Statistics                              ║');
console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

// User stats
const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
const freeUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE tier = "free"').get().count;
const premiumUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE tier = "premium"').get().count;
const lifetimeUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE tier = "lifetime"').get().count;
const bannedUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_banned = 1').get().count;

console.log('👥 Users:');
console.log(`   Total:    ${totalUsers}`);
console.log(`   Free:     ${freeUsers}`);
console.log(`   Premium:  ${premiumUsers}`);
console.log(`   Lifetime: ${lifetimeUsers}`);
console.log(`   Banned:   ${bannedUsers}`);

// Active sessions
const activeSessions = db.prepare('SELECT COUNT(*) as count FROM sessions WHERE expires_at > datetime("now")').get().count;
console.log(`\n🔐 Active Sessions: ${activeSessions}`);

// Config stats
const totalConfigs = db.prepare('SELECT COUNT(*) as count FROM configs').get().count;
const totalConfigDownloads = db.prepare('SELECT SUM(downloads) as total FROM configs').get().total || 0;

console.log(`\n☁️  Configs:`);
console.log(`   Total:     ${totalConfigs}`);
console.log(`   Downloads: ${totalConfigDownloads}`);

// Script stats
const totalScripts = db.prepare('SELECT COUNT(*) as count FROM scripts').get().count;
const totalScriptDownloads = db.prepare('SELECT SUM(downloads) as total FROM scripts').get().total || 0;

console.log(`\n📜 Scripts:`);
console.log(`   Total:     ${totalScripts}`);
console.log(`   Downloads: ${totalScriptDownloads}`);

// Telemetry stats
const totalEvents = db.prepare('SELECT COUNT(*) as count FROM telemetry').get().count;
const crashes = db.prepare('SELECT COUNT(*) as count FROM telemetry WHERE event_type = "crash"').get().count;

console.log(`\n📊 Telemetry:`);
console.log(`   Total Events: ${totalEvents}`);
console.log(`   Crashes:      ${crashes}`);

// Top features
const topFeatures = db.prepare(`
    SELECT data, COUNT(*) as count 
    FROM telemetry 
    WHERE event_type = "feature_usage" 
    GROUP BY data 
    ORDER BY count DESC 
    LIMIT 5
`).all();

if (topFeatures.length > 0) {
    console.log(`\n🔥 Top Features:`);
    topFeatures.forEach((feature, index) => {
        try {
            const data = JSON.parse(feature.data);
            console.log(`   ${index + 1}. ${data.feature}: ${feature.count} uses`);
        } catch (e) {
            console.log(`   ${index + 1}. Unknown: ${feature.count} uses`);
        }
    });
}

// Recent logins
const recentLogins = db.prepare(`
    SELECT username, last_login 
    FROM users 
    WHERE last_login IS NOT NULL 
    ORDER BY last_login DESC 
    LIMIT 5
`).all();

if (recentLogins.length > 0) {
    console.log(`\n🕐 Recent Logins:`);
    recentLogins.forEach(login => {
        console.log(`   ${login.username} - ${new Date(login.last_login).toLocaleString()}`);
    });
}

console.log('\n═══════════════════════════════════════════════════════════════════════════\n');

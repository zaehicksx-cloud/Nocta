const db = require('../database/db');
const { nanoid } = require('nanoid');

console.log('🔧 Initializing Nocta API Database...\n');

// Create some test users
const testUsers = [
    {
        username: 'TestUser',
        license_key: 'NOCTA-TEST-FREE-KEY',
        tier: 'free',
        expires_at: null
    },
    {
        username: 'PremiumUser',
        license_key: 'NOCTA-TEST-PREMIUM-KEY',
        tier: 'premium',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    },
    {
        username: 'LifetimeUser',
        license_key: 'NOCTA-TEST-LIFETIME-KEY',
        tier: 'lifetime',
        expires_at: null
    }
];

console.log('📝 Creating test users...');
for (const user of testUsers) {
    try {
        db.prepare(`
            INSERT OR IGNORE INTO users (username, license_key, tier, expires_at)
            VALUES (?, ?, ?, ?)
        `).run(user.username, user.license_key, user.tier, user.expires_at);
        
        console.log(`✅ Created user: ${user.username} (${user.tier}) - Key: ${user.license_key}`);
    } catch (error) {
        console.log(`⚠️  User ${user.username} already exists`);
    }
}

// Create some test scripts
const testScripts = [
    {
        name: 'Teleport to Waypoint',
        description: 'Instantly teleport to your waypoint marker',
        author: 'Nocta',
        category: 'teleport',
        code: `-- Teleport to Waypoint
local waypoint = GetFirstBlipInfoId(8)
if DoesBlipExist(waypoint) then
    local coords = GetBlipInfoIdCoord(waypoint)
    SetEntityCoords(PlayerPedId(), coords.x, coords.y, coords.z)
    print("Teleported to waypoint!")
else
    print("No waypoint set!")
end`
    },
    {
        name: 'Spawn Vehicle',
        description: 'Spawn any vehicle by model name',
        author: 'Nocta',
        category: 'vehicle',
        code: `-- Spawn Vehicle
local model = GetHashKey("adder")
RequestModel(model)
while not HasModelLoaded(model) do
    Wait(0)
end

local coords = GetEntityCoords(PlayerPedId())
local vehicle = CreateVehicle(model, coords.x, coords.y, coords.z, GetEntityHeading(PlayerPedId()), true, false)
SetPedIntoVehicle(PlayerPedId(), vehicle, -1)
print("Vehicle spawned!")`
    },
    {
        name: 'Money Drop',
        description: 'Drop money bags around you',
        author: 'Nocta',
        category: 'money',
        code: `-- Money Drop
local coords = GetEntityCoords(PlayerPedId())
for i = 1, 10 do
    local x = coords.x + math.random(-5, 5)
    local y = coords.y + math.random(-5, 5)
    CreateAmbientPickup(GetHashKey("PICKUP_MONEY_CASE"), x, y, coords.z, 0, 2500, 1, false, true)
end
print("Money dropped!")`
    }
];

console.log('\n📜 Creating test scripts...');
for (const script of testScripts) {
    try {
        db.prepare(`
            INSERT OR IGNORE INTO scripts (name, description, author, category, code)
            VALUES (?, ?, ?, ?, ?)
        `).run(script.name, script.description, script.author, script.category, script.code);
        
        console.log(`✅ Created script: ${script.name}`);
    } catch (error) {
        console.log(`⚠️  Script ${script.name} already exists`);
    }
}

// Create a test update
console.log('\n🔄 Creating test update...');
try {
    db.prepare(`
        INSERT OR IGNORE INTO updates (version, download_url, changelog, mandatory)
        VALUES (?, ?, ?, ?)
    `).run(
        '1.0.0',
        'https://nocta.gg/downloads/nocta-v1.0.0.dll',
        '- Initial release\n- Added aimbot\n- Added ESP\n- Added Lua executor',
        0
    );
    console.log('✅ Created update entry');
} catch (error) {
    console.log('⚠️  Update already exists');
}

console.log('\n✅ Database initialization complete!\n');
console.log('═══════════════════════════════════════');
console.log('Test License Keys:');
console.log('═══════════════════════════════════════');
console.log('Free:     NOCTA-TEST-FREE-KEY');
console.log('Premium:  NOCTA-TEST-PREMIUM-KEY');
console.log('Lifetime: NOCTA-TEST-LIFETIME-KEY');
console.log('═══════════════════════════════════════\n');

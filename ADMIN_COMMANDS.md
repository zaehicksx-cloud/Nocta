# Nocta API - Admin Commands

Handige scripts voor het beheren van je Nocta API server.

## 📋 User Management

### Nieuwe user aanmaken
```bash
node scripts/add-user.js
```

Interactief script dat vraagt om:
- Username
- Tier (Free/Premium/Lifetime)
- Expiry (voor Premium)

Genereert automatisch een license key.

### Alle users bekijken
```bash
node scripts/list-users.js
```

Toont lijst van alle users met:
- ID, Username, License Key
- Tier en expiry date
- Last login
- Ban status

### User bannen
```bash
node scripts/ban-user.js NOCTA-ABCD-1234-EFGH-5678
```

Bant een user en verwijdert alle actieve sessions.

### HWID resetten
```bash
node scripts/reset-hwid.js NOCTA-ABCD-1234-EFGH-5678
```

Reset de HWID van een user (voor als ze nieuwe PC hebben).

## 📊 Statistics

### Bekijk statistieken
```bash
node scripts/stats.js
```

Toont:
- User counts per tier
- Active sessions
- Config & script downloads
- Telemetry data
- Top features
- Recent logins

## 🔧 Database Management

### Database resetten
```bash
del database\nocta.db
npm run init-db
```

⚠️ **WARNING**: Dit verwijdert ALLE data!

### Database backup maken
```bash
copy database\nocta.db database\nocta.backup.db
```

### Database restore
```bash
copy database\nocta.backup.db database\nocta.db
```

## 🚨 Kill Switch

### Kill switch activeren
```bash
# In .env file:
KILL_SWITCH=true
```

Dan restart server:
```bash
# Stop server (Ctrl+C)
npm start
```

Alle clients krijgen nu een waarschuwing en kunnen niet meer gebruiken.

### Kill switch deactiveren
```bash
# In .env file:
KILL_SWITCH=false
```

Restart server.

## 🔄 Updates

### Nieuwe update toevoegen
```javascript
// add-update.js
const db = require('./database/db');

db.prepare(`
    INSERT INTO updates (version, download_url, changelog, mandatory)
    VALUES (?, ?, ?, ?)
`).run(
    '1.1.0',
    'https://nocta.gg/downloads/nocta-v1.1.0.dll',
    '- Added new features\n- Fixed bugs\n- Improved performance',
    0  // 0 = optional, 1 = mandatory
);

console.log('Update added!');
```

Run:
```bash
node add-update.js
```

## 📜 Scripts

### Script toevoegen
```javascript
// add-script.js
const db = require('./database/db');

db.prepare(`
    INSERT INTO scripts (name, description, author, category, code)
    VALUES (?, ?, ?, ?, ?)
`).run(
    'Script Name',
    'Script description',
    'Author',
    'category',
    'print("Hello World")'
);

console.log('Script added!');
```

## 🔍 SQL Queries

### Direct database query
```bash
# Installeer sqlite3 CLI
npm install -g sqlite3

# Open database
sqlite3 database/nocta.db

# Voorbeelden:
sqlite> SELECT * FROM users;
sqlite> SELECT * FROM configs ORDER BY downloads DESC LIMIT 10;
sqlite> SELECT COUNT(*) FROM telemetry WHERE event_type = 'crash';
sqlite> .exit
```

### Handige queries

**Actieve premium users:**
```sql
SELECT username, tier, expires_at 
FROM users 
WHERE tier IN ('premium', 'lifetime') 
AND is_banned = 0;
```

**Meest gedownloade configs:**
```sql
SELECT c.name, u.username, c.downloads 
FROM configs c 
JOIN users u ON c.user_id = u.id 
ORDER BY c.downloads DESC 
LIMIT 10;
```

**Crashes laatste 24 uur:**
```sql
SELECT COUNT(*) 
FROM telemetry 
WHERE event_type = 'crash' 
AND timestamp > datetime('now', '-1 day');
```

**Expired licenses:**
```sql
SELECT username, license_key, expires_at 
FROM users 
WHERE expires_at < datetime('now') 
AND expires_at IS NOT NULL;
```

## 🛠️ Maintenance

### Server logs bekijken
```bash
# Als je PM2 gebruikt:
pm2 logs nocta-api

# Of gewoon terminal output
npm start
```

### Server herstarten
```bash
# PM2:
pm2 restart nocta-api

# Of stop en start opnieuw:
# Ctrl+C
npm start
```

### Dependencies updaten
```bash
npm update
npm audit fix
```

## 🔐 Security

### JWT Secret veranderen
1. Stop server
2. Edit `.env`:
```
JWT_SECRET=new-random-secret-key-here
```
3. Restart server
4. ⚠️ Alle users moeten opnieuw inloggen!

### Rate limit aanpassen
In `.env`:
```
RATE_LIMIT_WINDOW_MS=900000  # 15 minuten
RATE_LIMIT_MAX_REQUESTS=100  # Max 100 requests per window
```

## 📊 Monitoring

### Check server status
```bash
curl http://localhost:3000
```

### Check kill switch status
```bash
curl http://localhost:3000/v1/status
```

### Test authentication
```bash
curl -X POST http://localhost:3000/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"license_key\":\"NOCTA-TEST-FREE-KEY\",\"hwid\":\"test123\",\"version\":\"1.0.0\"}"
```

## 🚀 Production Tips

### PM2 Setup
```bash
npm install -g pm2
pm2 start server.js --name nocta-api
pm2 startup
pm2 save
```

### Auto-restart on crash
PM2 doet dit automatisch!

### Log rotation
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Monitor resources
```bash
pm2 monit
```

## 📧 Notifications

### Discord webhook voor crashes
Voeg toe aan `routes/telemetry.js`:

```javascript
const axios = require('axios');

router.post('/', authenticateToken, async (req, res) => {
    const { event_type, data } = req.body;
    
    // ... existing code ...
    
    // Send Discord notification for crashes
    if (event_type === 'crash') {
        try {
            await axios.post('YOUR_DISCORD_WEBHOOK_URL', {
                content: `🚨 Crash reported by ${req.user.username}`,
                embeds: [{
                    title: 'Crash Report',
                    description: data.error,
                    color: 0xff0000
                }]
            });
        } catch (e) {
            // Ignore webhook errors
        }
    }
    
    res.json({ message: 'Telemetry received' });
});
```

## 🔄 Backup Automation

### Windows Task Scheduler
Maak `backup.bat`:
```batch
@echo off
set timestamp=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%
copy "C:\path\to\database\nocta.db" "C:\backups\nocta_%timestamp%.db"
```

Schedule dit dagelijks.

### Linux Cron
```bash
# Edit crontab
crontab -e

# Add daily backup at 3 AM
0 3 * * * cp /path/to/database/nocta.db /backups/nocta_$(date +\%Y\%m\%d).db
```

## ❓ Troubleshooting

### "Database is locked"
```bash
# Stop all server instances
pm2 stop nocta-api

# Remove lock files
del database\nocta.db-wal
del database\nocta.db-shm

# Restart
pm2 start nocta-api
```

### "Port already in use"
```bash
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

### "Cannot find module"
```bash
npm install
```

## 📚 Meer Info

Voor meer details, zie:
- `README.md` - Server setup
- `QUICK_START.md` - Snelle start guide
- `API_INTEGRATION_GUIDE.md` - Client integratie

---

**Pro tip**: Maak een `admin.bat` file met shortcuts:

```batch
@echo off
echo Nocta API Admin Menu
echo ====================
echo 1. Add User
echo 2. List Users
echo 3. View Stats
echo 4. Reset HWID
echo 5. Ban User
echo.
set /p choice="Select option: "

if %choice%==1 node scripts/add-user.js
if %choice%==2 node scripts/list-users.js
if %choice%==3 node scripts/stats.js
if %choice%==4 (
    set /p key="Enter license key: "
    node scripts/reset-hwid.js %key%
)
if %choice%==5 (
    set /p key="Enter license key: "
    node scripts/ban-user.js %key%
)

pause
```

Dan kun je gewoon `admin.bat` runnen! 🎉

# Nocta API - Quick Start

## 🚀 Start in 5 minuten

### 1. Installeer Node.js
Download: https://nodejs.org/ (LTS versie)

### 2. Open terminal in deze folder
```bash
cd NoctaAPI-Server
```

### 3. Installeer packages
```bash
npm install
```

### 4. Maak .env file
```bash
copy .env.example .env
```

### 5. Initialiseer database
```bash
npm run init-db
```

### 6. Start server
```bash
npm start
```

✅ Server draait nu op `http://localhost:3000`

## 🔑 Test License Keys

Na `npm run init-db` kun je deze keys gebruiken:

- **Free**: `NOCTA-TEST-FREE-KEY`
- **Premium**: `NOCTA-TEST-PREMIUM-KEY`
- **Lifetime**: `NOCTA-TEST-LIFETIME-KEY`

## 🧪 Test de API

Open browser en ga naar:
```
http://localhost:3000
```

Je zou moeten zien:
```json
{
  "name": "Nocta API",
  "version": "1.0.0",
  "status": "online"
}
```

## 🔧 Client Setup

In je C++ project:

1. Voeg toe aan includes:
```cpp
#include "Cheat/api/APIIntegration.h"
```

2. In dllmain.cpp:
```cpp
// Bij startup
APIIntegration::InitializeAPI();

// Bij shutdown
APIIntegration::ShutdownAPI();
```

3. In je menu:
```cpp
if (!APIIntegration::IsAuthenticated()) {
    APIIntegration::RenderAuthenticationWindow();
}
```

## 📝 Eerste Test

1. Start de server (`npm start`)
2. Inject je DLL in FiveM
3. Open menu
4. Voer in: `NOCTA-TEST-FREE-KEY`
5. Klik "Authenticate"

✅ Je bent nu ingelogd!

## 🛠️ Handige Commands

```bash
# Start server
npm start

# Start met auto-reload (development)
npm run dev

# Reset database
del database\nocta.db
npm run init-db

# Check server status
curl http://localhost:3000
```

## 🔒 Kill Switch Activeren

In `.env` file:
```
KILL_SWITCH=true
```

Restart server. Alle clients krijgen nu een waarschuwing.

## 📊 Statistieken Bekijken

```
http://localhost:3000/v1/telemetry/stats
```

## ❓ Problemen?

### Server start niet
- Check of Node.js geïnstalleerd is: `node --version`
- Check of port 3000 vrij is
- Run `npm install` opnieuw

### "Cannot find module"
```bash
npm install
```

### Database errors
```bash
del database\nocta.db
npm run init-db
```

### Client kan niet connecten
- Check of server draait
- Check firewall
- Verander URL in `NoctaAPI.h` naar `http://localhost:3000`

## 🌐 Productie Deployment

Voor productie gebruik:
- VPS (DigitalOcean, Linode, etc.)
- PM2 voor process management
- Nginx voor reverse proxy
- SSL certificaat (Let's Encrypt)

Zie `API_INTEGRATION_GUIDE.md` voor details.

## 📚 Meer Info

- Volledige guide: `API_INTEGRATION_GUIDE.md`
- Server README: `README.md`
- API docs: Check de `routes/` folder

Veel succes! 🎉

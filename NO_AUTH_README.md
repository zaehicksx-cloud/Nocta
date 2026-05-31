# Nocta API - No Authentication Version

Deze API heeft **geen authentication** omdat dat wordt afgehandeld door je loader.

## 🔓 Geen Auth Vereist

Alle endpoints zijn **publiek toegankelijk**:
- ✅ Cloud Configs - Upload/download zonder login
- ✅ Script Store - Browse en download scripts
- ✅ Telemetry - Send analytics
- ✅ Updates - Check voor updates
- ✅ Status - Kill switch status

## 🚀 Quick Start

```bash
cd NoctaAPI-Server
npm install
npm run init-db
npm start
```

Server draait op `http://localhost:3000`

## 📡 API Domain

Client gebruikt: `https://api.projectnocta.xyz`

Verander in `NoctaAPI.h` als je een ander domein wilt.

## 🔧 Endpoints

### Configs
- `GET /v1/configs` - Lijst van configs
- `GET /v1/configs/:code` - Download config
- `POST /v1/configs` - Upload config
  ```json
  {
    "name": "My Config",
    "data": "{...json...}",
    "author": "Username"
  }
  ```
- `DELETE /v1/configs/:id` - Delete config

### Scripts
- `GET /v1/scripts` - Lijst van scripts
- `GET /v1/scripts/:id` - Download script
- `POST /v1/scripts` - Upload script
  ```json
  {
    "name": "Script Name",
    "description": "Description",
    "category": "teleport",
    "code": "print('hello')",
    "author": "Username"
  }
  ```

### Status
- `GET /v1/status` - Server status & kill switch

### Updates
- `GET /v1/updates/check?version=1.0.0` - Check updates

### Telemetry
- `POST /v1/telemetry` - Send telemetry
  ```json
  {
    "event_type": "feature_usage",
    "data": {"feature": "aimbot"}
  }
  ```

## 🎯 Client Usage

```cpp
// Initialize (no auth needed)
APIIntegration::InitializeAPI();

// Upload config
std::string shareCode;
APIIntegration::UploadCurrentConfig("My Config", shareCode);

// Download config
APIIntegration::DownloadConfig("ABC12345");

// Track feature
APIIntegration::TrackFeature("aimbot");
```

## 🔒 Kill Switch

Activeer in `.env`:
```
KILL_SWITCH=true
```

Restart server. Alle clients krijgen waarschuwing.

## 📊 Statistics

```bash
node scripts/stats.js
```

Bekijk:
- Total configs/scripts
- Downloads
- Telemetry events
- Top features

## 🌐 Production

Deploy naar VPS en wijs `api.projectnocta.xyz` naar je server IP.

Setup nginx reverse proxy:
```nginx
server {
    listen 443 ssl;
    server_name api.projectnocta.xyz;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 💡 Tips

- **Rate limiting** is ingebouwd (100 req/15min)
- **CORS** is enabled voor alle origins
- **Backup database** regelmatig
- **Monitor logs** voor abuse

## 🐛 Troubleshooting

### Client kan niet connecten
- Check of `api.projectnocta.xyz` bereikbaar is
- Check firewall/SSL certificaat
- Test met: `curl https://api.projectnocta.xyz`

### Database errors
```bash
del database\nocta.db
npm run init-db
```

## 📚 Meer Info

- Server setup: `README.md`
- Client integratie: `API_INTEGRATION_GUIDE.md`
- Admin commands: `ADMIN_COMMANDS.md`

---

**Note**: Authentication wordt afgehandeld door je loader, niet door deze API!

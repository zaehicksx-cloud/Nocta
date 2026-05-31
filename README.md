# Nocta API Server

Complete API backend for the Nocta GTA V cheat menu.

## Features

- ✅ **License Authentication** - HWID-based license verification
- ✅ **Cloud Configs** - Upload and share configs with unique codes
- ✅ **Script Store** - Download community Lua scripts
- ✅ **Update System** - Automatic update checking
- ✅ **Kill Switch** - Emergency disable functionality
- ✅ **Telemetry** - Crash reports and usage analytics
- ✅ **Tier System** - Free, Premium, Lifetime tiers

## Installation

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```bash
copy .env.example .env
```

3. Edit `.env` and change `JWT_SECRET` to a random string

4. Initialize database:
```bash
npm run init-db
```

5. Start server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /v1/auth/login` - Login with license key
- `GET /v1/auth/validate` - Validate session token
- `POST /v1/auth/logout` - Logout

### Configs
- `GET /v1/configs` - Get all configs (paginated)
- `GET /v1/configs/:shareCode` - Get config by share code
- `POST /v1/configs` - Upload config (requires auth)
- `DELETE /v1/configs/:id` - Delete config (requires auth)

### Scripts
- `GET /v1/scripts` - Get all scripts
- `GET /v1/scripts/:id` - Get script by ID (requires auth)
- `POST /v1/scripts` - Upload script (requires premium)

### Updates
- `GET /v1/updates/check?version=1.0.0` - Check for updates
- `GET /v1/updates/history` - Get update history

### Status
- `GET /v1/status` - Get server status & kill switch

### Telemetry
- `POST /v1/telemetry` - Send telemetry data (requires auth)
- `GET /v1/telemetry/stats` - Get telemetry stats

## Test License Keys

After running `npm run init-db`, you can use these test keys:

- **Free**: `NOCTA-TEST-FREE-KEY`
- **Premium**: `NOCTA-TEST-PREMIUM-KEY`
- **Lifetime**: `NOCTA-TEST-LIFETIME-KEY`

## Kill Switch

To enable kill switch (disable all cheats):

```bash
# In .env file
KILL_SWITCH=true
```

Or set environment variable:
```bash
set KILL_SWITCH=true
```

Restart server for changes to take effect.

## Deployment

### Using PM2 (Recommended)

```bash
npm install -g pm2
pm2 start server.js --name nocta-api
pm2 save
pm2 startup
```

### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t nocta-api .
docker run -p 3000:3000 --env-file .env nocta-api
```

## Security

- Change `JWT_SECRET` in production
- Use HTTPS in production (reverse proxy with nginx/caddy)
- Set up rate limiting (already configured)
- Regularly backup the database
- Monitor telemetry for suspicious activity

## Database

SQLite database located at `./database/nocta.db`

To backup:
```bash
copy database\nocta.db database\nocta.backup.db
```

## License

MIT

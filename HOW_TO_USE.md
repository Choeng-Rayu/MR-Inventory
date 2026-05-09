# How to Use — Smart Inventory (Docker)

This guide covers all common Docker operations for the Smart Inventory Management System.

---

## Quick Start

### 1. Start all services
```bash
sudo docker compose up -d
```
This starts 4 containers in the background:
- `inventory-mysql` — MySQL 8 database (port 3306)
- `inventory-minio` — MinIO object storage (ports 9000/9001)
- `inventory-backend` — NestJS API (port 3000)
- `inventory-frontend` — React app via Nginx (port 80)

### 2. Check status
```bash
sudo docker compose ps
```
All containers should show `healthy` or `running`.

### 3. Open the app
| Service | URL |
|---------|-----|
| Frontend (React app) | http://localhost |
| API Swagger Docs | http://localhost/api/docs |
| API Health Check | http://localhost/api/health |
| Backend (direct) | http://localhost:3000 |
| MinIO Console | http://localhost:9001 |

---

## First-Time Setup

### 1. Configure environment variables
Copy the example file and fill in your values:
```bash
cp .env.example .env
```

Key variables to set in `.env`:
```
# Database
MYSQL_ROOT_PASSWORD=your_root_password
MYSQL_USER=inventory
MYSQL_PASSWORD=your_db_password

# JWT Secret (generate a random string)
JWT_SECRET=your_random_jwt_secret

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_PUBLIC_URL=http://localhost:9000

# OAuth (optional — add when ready)
GOOGLE_CLIENT_ID=your_google_client_id

# Telegram (optional — add when ready)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### 2. Build and start fresh
```bash
# Stop everything and remove volumes (wipes database)
sudo docker compose down -v

# Build images and start
sudo docker compose up --build -d
```

---

## Daily Commands

### View logs
```bash
# All containers (live stream)
sudo docker compose logs -f

# Specific container
sudo docker compose logs -f backend
sudo docker compose logs -f frontend
sudo docker compose logs -f mysql
sudo docker compose logs -f minio

# Last 50 lines (no follow)
sudo docker compose logs --tail=50
```
Press `Ctrl+C` to stop following logs.

### Stop services
```bash
# Stop containers (keep data)
sudo docker compose down

# Stop and remove everything including database data
sudo docker compose down -v
```

### Restart a single service
```bash
# Restart backend only
sudo docker compose restart backend

# Rebuild and restart frontend only
sudo docker compose up --build -d frontend
```

### Rebuild after code changes
```bash
# Rebuild everything
sudo docker compose up --build -d

# Rebuild backend only
sudo docker compose up --build -d backend
```

---

## Troubleshooting

### Container won't start
```bash
# Check detailed logs
sudo docker compose logs <service-name>

# Example: backend crashed
sudo docker compose logs backend
```

### Database issues (duplicate index, schema errors)
```bash
# Nuclear option: wipe database and start fresh
sudo docker compose down -v
sudo docker compose up --build -d
```

### Nginx "host not found" error
This usually fixes itself on restart. If not:
```bash
sudo docker compose restart frontend
```

### Port already in use
If port 80, 3000, 3306, or 9000/9001 is taken:
```bash
# Check what's using port 80
sudo lsof -i :80

# Kill the process or change ports in docker-compose.yml
```

---

## Container Shell Access

```bash
# Enter backend container
sudo docker exec -it inventory-backend sh

# Enter MySQL container
sudo docker exec -it inventory-mysql bash

# Enter frontend container
sudo docker exec -it inventory-frontend sh

# Enter MinIO container
sudo docker exec -it inventory-minio sh
```

---

## Database Access

```bash
# Connect to MySQL from host (requires mysql client)
mysql -h 127.0.0.1 -P 3306 -u inventory -p

# Or from inside the MySQL container
sudo docker exec -it inventory-mysql mysql -u inventory -p smart_inventory
```

---

## Useful Aliases (add to `~/.bashrc`)

```bash
alias dcu='sudo docker compose up -d'
alias dcd='sudo docker compose down'
alias dcl='sudo docker compose logs -f'
alias dcb='sudo docker compose up --build -d'
alias dps='sudo docker compose ps'
```

Then reload:
```bash
source ~/.bashrc
```

---

## Development Mode (Recommended for Testing & Bug Fixing)

In development, run only the **infrastructure** in Docker (MySQL + MinIO), and run the **backend** and **frontend** manually on your host. This gives you:
- Hot reload on code changes
- Direct console logs without `docker logs`
- Easier debugging with breakpoints
- Faster iteration

### Architecture in Dev Mode

```
┌─────────────────┐      ┌──────────────────┐
│   Browser       │─────▶│  Vite Dev Server │
│   (localhost)   │      │  (port 5173)     │
└─────────────────┘      └──────────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │  NestJS API      │◀── localhost:3000
                         │  (port 3000)     │    (nodemon hot reload)
                         └──────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                             │
           ┌────────▼────────┐         ┌────────▼────────┐
           │  MySQL 8        │         │  MinIO          │
           │  (port 3306)    │         │  (port 9000)    │
           │  Docker         │         │  Docker         │
           └─────────────────┘         └─────────────────┘
```

### Step 1: Start infrastructure services

```bash
# From project root
sudo docker compose -f docker-compose.dev.yml up -d
```

This starts only:
- `inventory-mysql-dev` on port 3306
- `inventory-minio-dev` on port 9000/9001

Check they're healthy:
```bash
sudo docker compose -f docker-compose.dev.yml ps
```

### Step 2: Configure backend environment

```bash
cd backend
cp .env.example .env
```

The `.env.example` already has the correct dev defaults:
```
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=inventory
DB_PASSWORD=inventory_password
DB_DATABASE=smart_inventory
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
```

**Important:** In dev mode, `DB_HOST=localhost` and `MINIO_ENDPOINT=localhost` because the backend runs on your host machine, not inside Docker.

### Step 3: Start the backend

```bash
cd backend
npm install          # if not already installed
npm run start:dev
```

The backend will:
- Start on http://localhost:3000
- Auto-sync database schema (`synchronize: true` in dev)
- Run initial seed data
- Hot-reload on file changes

**Check it's working:**
```bash
curl http://localhost:3000/api/health
```

### Step 4: Start the frontend

```bash
cd frontend
npm install          # if not already installed
npm run dev
```

The frontend dev server starts on http://localhost:5173

**The frontend `.env.development` is already configured with:**
```
VITE_API_BASE_URL=http://localhost:3000/api
```

This tells the frontend to call the backend directly instead of going through `/api` (which only works with nginx in production).

### Step 5: Open the app

| Service | Dev URL |
|---------|---------|
| Frontend (Vite dev) | http://localhost:5173 |
| API Swagger Docs | http://localhost:3000/api/docs |
| API Health | http://localhost:3000/api/health |
| MinIO Console | http://localhost:9001 |

### Stop dev infrastructure

```bash
sudo docker compose -f docker-compose.dev.yml down

# Wipe dev database (start fresh)
sudo docker compose -f docker-compose.dev.yml down -v
```

### Dev vs Production Config Summary

| Setting | Dev Mode | Production (Docker) |
|---------|----------|---------------------|
| Frontend URL | http://localhost:5173 | http://localhost |
| API URL (frontend) | http://localhost:3000/api | /api (nginx proxy) |
| DB Host | localhost | inventory-mysql |
| MinIO Endpoint | localhost | inventory-minio |
| Backend CORS origin | http://localhost:5173 | http://localhost |
| DB Sync | true (auto) | false |
| Seeds | Auto-run | Manual |

---

## Architecture Overview

```
┌─────────────────┐      ┌──────────────────┐
│   Browser       │─────▶│  Nginx (port 80) │──┐
│   (localhost)   │      │  inventory-frontend  │  │
└─────────────────┘      └──────────────────┘  │
                                                │
                         ┌──────────────────┐  │
                         │  NestJS API      │◀─┘
                         │  (port 3000)     │
                         │  inventory-backend   │
                         └──────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                             │
           ┌────────▼────────┐         ┌────────▼────────┐
           │  MySQL 8        │         │  MinIO          │
           │  (port 3306)    │         │  (port 9000)    │
           │  inventory-mysql    │         │  inventory-minio    │
           └─────────────────┘         └─────────────────┘
```

- **Nginx** proxies `/api/*` requests to the backend
- **Backend** connects to MySQL and MinIO internally via Docker network
- **Frontend** is a static React SPA served by Nginx

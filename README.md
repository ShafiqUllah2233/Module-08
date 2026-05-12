# G08 — Dispute Resolution (Full Stack)

Module 8 of the National Freelance & Skill Verification Platform — Dispute & Conflict Resolution.

This repository contains:
- React + Vite frontend (`src/`)
- Express + PostgreSQL backend (`server/`)
- Centralized SQL reference (`Default/SPM_Centralized_Db.sql`)

## Current architecture

- Frontend authenticates via `POST /api/auth/login`.
- Frontend sends `Authorization: Bearer <token>` for protected API calls.
- Vite dev server proxies `/api` and `/uploads` to `http://localhost:4000`.
- Backend enforces role checks using `req.ctxUser` and `req.ctxAdmin`.

## Tech stack

- Frontend: React 18, Vite, React Router, Tailwind, lucide-react
- Backend: Node.js, Express, PostgreSQL (`pg`), Multer, JWT, bcrypt

## Quick start (local)

### 1) Backend

```bash
cd server
cp .env.example .env
npm install
npm run db:reset
npm run dev
```

> On Windows PowerShell, use:
> `Copy-Item .env.example .env`

Backend runs at:
- `http://localhost:4000`
- health: `http://localhost:4000/api/health`

### 2) Frontend

```bash
# from repo root
npm install
npm run dev
```

Frontend runs at:
- `http://localhost:5173`

## Auth & demo logins

After local reset/seed, use:
- Admin: `sarah@nexus.com` / `password`
- User: `alice@example.com` / `password`

## Role behavior in UI

- **User** can file disputes and escalate from mediation.
- **Admin** can review/assign disputes, update status, review evidence, arbitrate, generate reports.
- Admin pages:
  - `/admin/queue`
  - `/admin/profiles`
  - `/admin/register`
  - `/admin/audit-log`

## Key routes (frontend)

- `/login`
- `/disputes`
- `/disputes/new` (user-only)
- `/disputes/:id`
- `/disputes/:id/mediation`
- `/disputes/:id/history`
- `/admin/queue`
- `/admin/profiles`
- `/admin/register`
- `/admin/audit-log`
- `/admin/disputes/:id/review`
- `/admin/disputes/:id/arbitration`
- `/admin/disputes/:id/resolution`
- `/profile`
- `/settings`

## Docker — Integration Team Guide

### Prerequisites
- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)
- Git

### Quick Start

#### 1) Clone the Repository
```bash
git clone https://github.com/ShafiqUllah2233/Module-08.git
cd Module-08
```

#### 2) Build and Run All Services
```powershell
# Build images and start all containers
docker compose up -d --build
```

#### 3) Verify All Services Are Running
```powershell
# Check status of containers
docker compose ps

# View logs (all services)
docker compose logs -f

# View specific service logs
docker compose logs -f server
docker compose logs -f web
docker compose logs -f db
```

#### 4) Access the Application
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:4000
- **Database:** localhost:5432 (user: `postgres`, password: `postgres`)

### Demo Credentials (After DB Initialization)
- **Admin:** sarah@nexus.com / password
- **User:** alice@example.com / password

### Available Commands

```powershell
# Start services
docker compose up -d

# Stop all services
docker compose down

# Stop and remove volumes (full reset)
docker compose down -v

# Rebuild without cache
docker compose build --no-cache

# View detailed logs
docker compose logs

# Scale a service (e.g., run 2 backend instances)
docker compose up -d --scale server=2
```

### Using Pre-built Hub Images
Once images are published to Docker Hub, use:
```powershell
docker compose -f docker-compose.hub.yml pull
docker compose -f docker-compose.hub.yml up -d
```

### Troubleshooting

**Issue: Exit Code 1 or containers won't start**
```powershell
# Full reset with volume cleanup
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

**Issue: Port already in use**
Edit `docker-compose.yml` and change ports:
```yaml
ports:
  - "8081:80"      # Change 8080 to 8081
  - "4001:4000"    # Change 4000 to 4001
```

**Issue: Database not initializing**
```powershell
# Wait 15-30 seconds and check logs
docker compose logs db

# If stuck, reset database
docker compose down -v
docker compose up -d
```

**Issue: Frontend can't connect to backend**
- Check `CLIENT_ORIGIN` in `docker-compose.yml` matches frontend domain
- Verify all containers are running: `docker compose ps`
- Check nginx config: `cat nginx.conf`

### Service Architecture

```
┌─────────────┐
│   Frontend  │ (nginx @ :80 → :8080)
│  React App  │
└──────┬──────┘
       │ /api proxy
       ↓
┌─────────────────┐
│   Backend API   │ (Express @ :4000)
│ Node.js Server  │
└────────┬────────┘
         │ queries
         ↓
┌─────────────────┐
│   PostgreSQL    │ (:5432)
│    Database     │
└─────────────────┘
```

### Default Service Endpoints
- Web (Frontend): `http://localhost:8080`
- API (Backend): `http://localhost:4000`
- Database: `localhost:5432`
- API Health: `http://localhost:4000/api/health`

## Notes for GitHub upload

- `server/.env` is intentionally ignored.
- Commit `server/.env.example` (safe template) so others can run quickly.
- Do not commit local secrets, uploads, or `node_modules`.

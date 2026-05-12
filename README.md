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

## Docker

You can still run via compose:

```powershell
docker compose up -d --build
# or
docker compose -f docker-compose.hub.yml up -d
```

Default service endpoints:
- Web: `http://localhost:8080`
- API: `http://localhost:4000`
- DB: `localhost:5432`

## Notes for GitHub upload

- `server/.env` is intentionally ignored.
- Commit `server/.env.example` (safe template) so others can run quickly.
- Do not commit local secrets, uploads, or `node_modules`.

# G08 — Dispute Resolution API (PERN backend)

Express + PostgreSQL service for the Dispute Resolution module. Lives alongside the React frontend.

## Stack

- **Node.js + Express 4** (HTTP routing)
- **PostgreSQL** (via the `pg` driver)
- **Multer** (evidence file uploads)
- **dotenv / cors / morgan** (config + cross-origin + logging)

## Folder layout

```
server/
├── src/
│   ├── config/
│   │   └── db.js               # Shared pg.Pool
│   ├── db/
│   │   ├── schema.sql          # CREATE TABLE statements (matches the spec)
│   │   ├── seed.sql            # Demo data mirroring the React mock store
│   │   └── reset.js            # Runs schema + seed
│   ├── middleware/
│   │   ├── ctxUser.js          # Reads x-user-id / x-admin-id headers
│   │   └── error.js            # Uniform error envelope + HttpError class
│   ├── routes/
│   │   ├── disputes.js         # /api/disputes (+ summary, status, assign, escalate)
│   │   ├── evidence.js         # /api/disputes/:id/evidence + /api/evidence/:id
│   │   ├── mediation.js        # /api/disputes/:id/mediation
│   │   ├── arbitration.js      # /api/disputes/:id/arbitration
│   │   ├── reports.js          # /api/disputes/:id/report + /api/reports/:id/deliver
│   │   ├── statusHistory.js    # /api/disputes/:id/history
│   │   ├── admins.js           # /api/admins
│   │   ├── auditLog.js         # /api/admin/audit-log (+ /export CSV)
│   │   ├── users.js            # /api/users (+ /me)
│   │   └── projects.js         # /api/projects
│   ├── utils/
│   │   ├── audit.js            # logAudit() helper
│   │   ├── labels.js           # DB enum <-> UI label mappings
│   │   └── serializers.js      # Row -> API response shapers
│   └── server.js               # Express entry point
├── package.json
└── .env.example
```

## Prerequisites

1. **Node.js 18+**
2. **PostgreSQL 14+** running locally
3. A database created for this module:

   ```sql
   CREATE DATABASE g08_dispute;
   ```

## First-time setup

```bash
cd server
copy .env.example .env       # Windows (PowerShell users: Copy-Item .env.example .env)
npm install
```

Edit `.env` and set `DATABASE_URL` to your local PG connection string. Then create the tables and seed demo data:

```bash
npm run db:reset
```

The seed mirrors the demo cases shown in the React frontend (DSP‑2023‑001 … DSP‑2023‑005) so the two stay in sync visually.

## Running

```bash
npm run dev        # nodemon, auto-restarts on file changes
# or
npm start
```

The server prints `G08 Dispute Resolution API listening on http://localhost:4000` once ready.

Health check: `GET http://localhost:4000/api/health`.

## "Who is calling?"

Real authentication is owned by Module 1. Until that is wired, every request can identify itself with two optional headers:

| Header        | Meaning                                 | Default      |
| ------------- | --------------------------------------- | ------------ |
| `x-user-id`   | A row id from `users`                   | `2` (Alice)  |
| `x-admin-id`  | A row id from `admin_profiles` (admin)  | derived from `x-user-id` if that user has an admin profile |

Admin-only endpoints (status changes, assignments, decisions, etc.) reject the request when the calling user has no active admin profile.

## API surface

### Disputes
| Method | Path                                | Purpose                                  |
| ------ | ----------------------------------- | ---------------------------------------- |
| GET    | `/api/disputes/summary`             | KPI counts (open / mediation / …)        |
| GET    | `/api/disputes`                     | List + filters: `q`, `status`, `type`, `assigned_admin_id`, `complainant_id`, `respondent_id` |
| GET    | `/api/disputes/:id`                 | Full detail (incl. evidence, history, mediation, decision, report) |
| POST   | `/api/disputes`                     | File a new dispute |
| PATCH  | `/api/disputes/:id/status`          | Admin status change |
| PATCH  | `/api/disputes/:id/assign`          | Assign / reassign admin |
| POST   | `/api/disputes/:id/escalate`        | Mediation → arbitration |

### Evidence
| Method | Path                                          | Purpose                  |
| ------ | --------------------------------------------- | ------------------------ |
| GET    | `/api/disputes/:id/evidence`                  | List evidence            |
| POST   | `/api/disputes/:id/evidence`                  | Upload (multipart)       |
| PATCH  | `/api/evidence/:id/visibility`                | Toggle visibility (admin)|
| POST   | `/api/evidence/:id/review`                    | Mark reviewed (admin)    |
| GET    | `/api/evidence/:id/download`                  | Download file            |

### Mediation, Arbitration, Reports
| Method | Path                                            | Purpose |
| ------ | ----------------------------------------------- | ------- |
| GET    | `/api/disputes/:id/mediation`                   | List statements |
| POST   | `/api/disputes/:id/mediation`                   | Append statement |
| GET    | `/api/disputes/:id/arbitration`                 | Get decision |
| POST   | `/api/disputes/:id/arbitration`                 | Submit decision (admin) |
| GET    | `/api/disputes/:id/report`                      | Get resolution report |
| POST   | `/api/disputes/:id/report`                      | Generate / regenerate (admin) |
| PATCH  | `/api/reports/:id/deliver`                      | Toggle delivery to parties |

### Status history
| Method | Path                                | Purpose |
| ------ | ----------------------------------- | ------- |
| GET    | `/api/disputes/:id/history`         | Full timeline |

### Admin profiles
| Method | Path                                | Purpose |
| ------ | ----------------------------------- | ------- |
| GET    | `/api/admins`                       | List |
| GET    | `/api/admins/:id`                   | Detail |
| POST   | `/api/admins`                       | Create (admin) |
| PATCH  | `/api/admins/:id`                   | Update role / active |
| POST   | `/api/admins/:id/deactivate`        | Quick deactivate |

### Audit log
| Method | Path                                | Purpose |
| ------ | ----------------------------------- | ------- |
| GET    | `/api/admin/audit-log`              | Filterable list |
| GET    | `/api/admin/audit-log/export`       | CSV export |

### Users / Projects
| Method | Path                  | Purpose |
| ------ | --------------------- | ------- |
| GET    | `/api/users/me`       | Caller info |
| GET    | `/api/users`          | List (filter by role) |
| GET    | `/api/users/:id`      | Detail |
| GET    | `/api/projects`       | List (filter by client/freelancer/q) |
| GET    | `/api/projects/:id`   | Detail |

## Smoke test (PowerShell)

```powershell
# 1. Health
curl http://localhost:4000/api/health

# 2. Summary KPIs
curl http://localhost:4000/api/disputes/summary

# 3. List disputes
curl http://localhost:4000/api/disputes

# 4. Detail of dispute #1
curl http://localhost:4000/api/disputes/1

# 5. As Admin Sarah, change status of dispute #2 to under_review
curl -Method PATCH `
     -Headers @{ 'x-user-id' = '90'; 'Content-Type' = 'application/json' } `
     -Body '{ "status": "under_review" }' `
     http://localhost:4000/api/disputes/2/status
```

## SRS coverage (FR‑DR mapping)

- **FR‑DR‑01..07** Dispute submission → `POST /api/disputes`
- **FR‑DR‑08..12** Evidence handling → `/api/disputes/:id/evidence`, `/api/evidence/:id/visibility`
- **FR‑DR‑13..16** Status tracking → `PATCH /api/disputes/:id/status`, `/history`
- **FR‑DR‑17..21** Mediation → `/api/disputes/:id/mediation`, `escalate`
- **FR‑DR‑22..27** Arbitration → `POST /api/disputes/:id/arbitration`
- **FR‑DR‑28..31** Resolution report → `POST /api/disputes/:id/report`, `PATCH /api/reports/:id/deliver`
- **FR‑DR‑32..35** Admin profiles → `/api/admins`
- **FR‑DR‑36..38** Audit log → `/api/admin/audit-log`

## Notes

- The schema in `src/db/schema.sql` faithfully implements the spec but **drops the `complainant_id UNIQUE` constraint**, which would have prevented users from filing more than one dispute over their lifetime. All other constraints (CHECK, FK, ON DELETE) are preserved verbatim.
- A minimal `users` and `projects` table are created so the module is self‑contained for development. In production those are owned by Modules 1 and 3/4 and this server's `schema.sql` will skip creating them.

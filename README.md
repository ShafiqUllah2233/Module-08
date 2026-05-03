# G08 — Dispute Resolution (Frontend)

Module 8 of the National Freelance & Skill Verification Platform — Dispute & Conflict Resolution.
This is the React frontend implementation of the Figma design.

## Stack

- **React 18** + **Vite** (fast dev server / HMR)
- **React Router v6** (page navigation)
- **Tailwind CSS** (theme tokens for the Figma palette)
- **lucide-react** (icons)

## Pages implemented

| Route | File | Figma |
| --- | --- | --- |
| `/disputes` | `src/pages/DisputesList.jsx` | Image 1 — Your Disputes |
| `/disputes/new` | `src/pages/NewDispute.jsx` | Image 2 — File a New Dispute |
| `/disputes/:id` | `src/pages/DisputeDetail.jsx` | Image 3 — Dispute Detail |
| `/disputes/:id/mediation` | `src/pages/MediationRoom.jsx` | Image 4 — Mediation Room |
| `/disputes/:id/history` | `src/pages/StatusHistory.jsx` | Image 5 — Status History |

All pages share a single mock data source in `src/data/mockData.js` so navigating
between pages keeps you on the same dispute (e.g. clicking *View* on `DSP-2023-001`
takes you to its detail, and from there to its mediation room and status history).

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## Run with Docker

The whole stack (Postgres + Express API + React/nginx frontend) can be started
with a single command using Docker Compose.

### Prerequisites

Install **Docker Desktop** for Windows:
<https://www.docker.com/products/docker-desktop/>

After install, verify from PowerShell:

```powershell
docker --version
docker compose version
```

### Start the stack

From the project root (`Module 8/`):

```powershell
docker compose up -d --build
```

Services and ports:

| Service | URL / Port | Description |
| --- | --- | --- |
| `web`    | <http://localhost:8080>        | React app served by nginx, proxies `/api` to the backend |
| `server` | <http://localhost:4000/api/health> | Express API |
| `db`     | `localhost:5432`               | Postgres 16 (user `postgres`, password `postgres`, db `g08_dispute`) |

On first start, the database is auto-initialized from
`server/src/db/schema.sql` and `server/src/db/seed.sql`.

### Common commands

```powershell
docker compose logs -f            # tail logs from all services
docker compose logs -f server     # tail only the backend
docker compose ps                 # list running containers
docker compose down               # stop and remove containers (keeps data)
docker compose down -v            # also wipe the database volume
docker compose up -d --build web  # rebuild only the frontend image
```

### Push images to Docker Hub

1. Create a Docker Hub account at <https://hub.docker.com/> and run
   `docker login` from PowerShell.
2. Tag and push. Replace `YOUR_DOCKERHUB_USERNAME` with your username:

   ```powershell
   # Build locally first (compose already built them, but retag for the registry)
   docker tag module-8-web    YOUR_DOCKERHUB_USERNAME/module8-web:latest
   docker tag module-8-server YOUR_DOCKERHUB_USERNAME/module8-server:latest

   docker push YOUR_DOCKERHUB_USERNAME/module8-web:latest
   docker push YOUR_DOCKERHUB_USERNAME/module8-server:latest
   ```

   > The image names (`module-8-web`, `module-8-server`) come from the compose
   > project name + service name. Run `docker images` to confirm the exact
   > names on your machine before tagging.

3. Anyone can then run your images without the source code:

   ```powershell
   docker pull YOUR_DOCKERHUB_USERNAME/module8-web:latest
   docker pull YOUR_DOCKERHUB_USERNAME/module8-server:latest
   ```

## Mapping to SRS requirements

- **FR-DR-01..07** Dispute Submission → `NewDispute.jsx`
- **FR-DR-08..12** Evidence Upload → evidence section of `NewDispute.jsx` and `DisputeDetail.jsx`
- **FR-DR-13..16** Status Tracking → `StatusHistory.jsx` + timeline preview
- **FR-DR-17..21** Mediation → `MediationRoom.jsx`
- **FR-DR-22..27** Arbitration → escalate button (UI hook present, admin panel comes next)
- **FR-DR-28..31** Resolution Reporting → resolution view from history (next iteration)

Cross-module integration points are visually annotated with the
red dashed `IntegrationTag` component (e.g. *Links to G06 — Messaging*) to mirror
the Figma. Real REST calls will replace the mock data when the Integration Group
publishes endpoint specs (see TBD-03).

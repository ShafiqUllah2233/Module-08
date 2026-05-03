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

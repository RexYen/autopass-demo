# Autopass Demo

Internal admin-console **prototype** for Autopass. Frontend-only: all data is mock data and every interaction is simulated in the browser — there is no backend, API, auth, or persistence, so a refresh resets all state.

Built with React 19 + TypeScript + Vite, Mantine UI, and React Router. Deployed on Vercel: https://autopass-demo.vercel.app

## Features

- **通行費自動繳 / 查繳任務** — the main feature: a 代查代繳 ticket workflow (card list, detail Drawer, query-result / confirm-paid / note Modals, and a history view). Full spec: [`drivingexpense-ticket.md`](./drivingexpense-ticket.md).
- **業者管理 / 任務管理 / 圖資管理 / 商店管理** — earlier prototype pages.
- `/preview` — a reference page showing every ticket-card state and its Modals (not linked in the nav; open by URL).

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production (`tsc -b && vite build`) |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Project layout

- `src/components/` — pages & UI components
- `src/types/autopass.ts` — 查繳 domain types & metadata (single source of truth)
- `src/data/autopassMock.ts` — mock data
- `src/App.tsx` — routes & app shell

## Contributing

Changes go through a **Pull Request** — branch off `main`, push, and open a PR. Don't push directly to `main`.

## Docs

- [`drivingexpense-ticket.md`](./drivingexpense-ticket.md) — 查繳 (通行費自動繳) feature spec & implementation notes
- [`CLAUDE.md`](./CLAUDE.md) — guidance for AI coding agents working in this repo

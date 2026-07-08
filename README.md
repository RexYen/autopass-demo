# Autopass Demo

Internal admin-console **prototype** for Autopass. Frontend-only: all data is mock data and every interaction is simulated in the browser — there is no backend, API, auth, or persistence, so a refresh resets all state.

Built with React 19 + TypeScript + Vite, Mantine UI, and React Router. Deployed on Vercel: https://autopass-demo.vercel.app

## Features

- **通行費自動繳 / 查繳任務** — the main feature: a 代查代繳 ticket workflow (card list, detail Drawer, query-result / confirm-paid / note Modals, and a history view). Full spec: [`drivingexpense-ticket.md`](./drivingexpense-ticket.md).
- **通行費申請單** (`/autopass/drivingexpense-applications`) — 自動繳申請清單 + 可編輯查繳週期。
- **行駕照/保單** (`/driver-center/accounts`) — 駕駛中心證件審核頁（行照/駕照/保單上傳資料的檢視與審核，PRD v9.0 4.9 後臺顯示）。
- **業者管理 / 任務管理 / 圖資管理 / 商店管理** — earlier prototype pages.
- `/preview` — a reference page showing every ticket-card state and its Modals (not linked in the nav; open by URL).

## Getting started

Requires **Node 22** (matches CI; declared in `.nvmrc` / `engines`).

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run typecheck` | Type-check only (`tsc -b`, no bundling — fastest check) |
| `npm run build` | Type-check and build for production (`tsc -b && vite build`) |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

## Project layout

- `src/components/` — pages & UI components
- `src/types/autopass.ts` — 查繳 domain types & metadata (single source of truth)（駕駛中心域型別在 `src/types/driverCenter.ts`、通知在 `src/types/notification.ts`）
- `src/data/` — mock data（autopassMock / autopassApplicationsMock / driverCenterMock）
- `src/hooks/` — 全站通知 context / hook（`useNotification`）
- `src/App.tsx` — routes & app shell

## Contributing

Changes go through a **Pull Request** — branch off `main`, push, and open a PR. Don't push directly to `main`. CI runs on every PR (lint + type-check/build, plus a production-dependency `npm audit`), so make sure `npm run lint` and `npm run build` pass locally before pushing. Merging to `main` auto-deploys the live demo via Vercel; PRs get preview deployments.

## Docs

- [`drivingexpense-ticket.md`](./drivingexpense-ticket.md) — 查繳 (通行費自動繳) feature spec & implementation notes
- [`CLAUDE.md`](./CLAUDE.md) — guidance for AI coding agents working in this repo
- `docs/superpowers/` — 歷史實作計畫／設計紀錄（**非現行 spec**，僅供追溯；現行行為以程式碼與上列文件為準）

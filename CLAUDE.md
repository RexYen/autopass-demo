# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

**Autopass Demo** — an internal admin-console **prototype** for Autopass. It is **frontend-only**: all data is hard-coded mock data and every state change is in-memory (a page refresh resets everything). There is no backend, API, auth, or persistence.

- **Stack**: React 19 + TypeScript + Vite, Mantine UI v8, React Router v7, Leaflet (map page).
- **Source** lives at the repo root (`package.json`, `src/`, `vite.config.ts`).
- **Deploy**: Vercel — https://autopass-demo.vercel.app. `vercel.json` has a SPA catch-all rewrite, required because the app uses `BrowserRouter` (real paths like `/autopass/tickets` would 404 on refresh otherwise).

## Workflow rules

- **Use a Pull Request for every change — never commit or push directly to `main`.** Branch off `main`, commit, push, and open a PR with `gh`.
- Only push / open PRs when the user explicitly asks.

## Commands

Run from the repo root:

- Dev server: `npm run dev` (Vite, default http://localhost:5173)
- Build: `npm run build` (`tsc -b && vite build`)
- Lint: `npm run lint` (ESLint — should be clean; CI gates lint + build on every PR)

## Architecture

`src/App.tsx` is an `AppShell` + `BrowserRouter`; `src/components/Navigation.tsx` is the side nav. Routes:

| Route | Component | Page |
| --- | --- | --- |
| `/` → `/autopass/tickets` | — | default landing |
| `/autopass/tickets` | `AutopassTickets` | 查繳任務 (**main feature**) |
| `/autopass/history` | `AutopassTickets mode="history"` | 歷史任務 |
| `/autopass/drivingexpense-applications` | `AutopassApplications` | 通行費申請單（側欄「通行費自動繳」收合群組） |
| `/autopass/tickets/:id` | — | redirect → `/autopass/tickets`（詳情走 Drawer，無深連結） |
| `/driver-center/accounts` | `DriverCenterAccounts` | 行駕照/保單（駕駛中心證件審核；側欄「駕駛管理」收合群組） |
| `/preview` | `TicketPreview` | 查繳卡片/Modal 狀態參考頁（不掛 nav） |
| `/vendors`, `/vendors/:name`, `/vendors/new` | `VendorManagement` / `VendorDetail` | 業者管理 |
| `/tasks` | `TaskManagement` | 任務管理 |
| `/map` | `MapManagement` | 圖資管理 |
| `/stores` | `StoreManagement` | 商店管理 |
| `*`（其他） | — | redirect → `/autopass/tickets` |

### Primary feature — 通行費自動繳 / 查繳 (Autopass tickets)

Operators manage 代查代繳 task tickets (代查 + 代繳 a user's tolls/fees per cycle). **Full spec & design notes live in [`drivingexpense-ticket.md`](./drivingexpense-ticket.md).** Key files:

- `src/types/autopass.ts` — domain types + metadata tables (`STATUS_META`, `SERVICE_META`, `SERVICE_QUERY_FIELDS`, `QUERY_FIELD_META`, `TERMINAL_STATUSES`, `AutopassApplication` / `BillingCycle`, …). Single source of truth for status/service mappings; new service types or statuses start here.
- `src/data/autopassMock.ts` — hard-coded mock tickets.
- `src/components/AutopassTickets.tsx` — list container; serves both 查繳任務 and 歷史任務 via the `mode` prop. Holds all the in-memory override state.
- `src/components/TicketCard.tsx` — shared ticket card (pure render + callbacks).
- `src/components/TicketModals.tsx` — `QueryResultModal` / `ConfirmPaidModal` / `AddNoteModal`.
- `src/components/AutopassTicketDetail.tsx` — detail Drawer with the Activity timeline.
- `src/components/TicketPreview.tsx` — `/preview` reference page, reuses the above components.
- `src/components/AutopassApplications.tsx` — 通行費申請單頁（`/autopass/drivingexpense-applications`），展示 `AutopassApplication` 申請清單與可編輯的查繳週期（`BillingCycle`）。

**Demo convention**: form submits write to override maps (`statusOverrides` / `noteOverrides` / `emailOverrides` / `invoiceOverrides`) inside `AutopassTickets`, merged onto the mock data with `useMemo`. Status flow, 請款, 發信, and排程 are all simulated with toasts; nothing persists.

### 駕駛中心帳號管理 (Driver center accounts)

對應 PRD [駕駛中心] v9.0「4.9 後臺顯示」：營運／審核人員檢視用戶上傳的證件（駕照／行照／保單）並審核。Tabs 以**審核狀態**為維度（待審核／審核失敗／審核成功），內容為**列表**（欄位依 tab 而異：類型／Email／上傳時間／審核時間／備註／操作），篩選為證件類型；一組證件（正＋反面）一列。證件影像**內嵌於審核 Modal**（看圖＋記錄結果一次完成，正反面左右切換、不提供下載入口）；審核失敗必填備註。審核結果送出後**不可調整**、已審核列無操作欄；審核失敗後偵測到用戶重新上傳時，系統會刪除原紀錄並在待審核建立新一筆（後端行為，demo 未模擬）。Key files: `src/types/driverCenter.ts`（domain types + `DRIVER_DOC_META` / `REVIEW_STATUS_META`）、`src/data/driverCenterMock.ts`（mock 上傳資料，證件影像為 SVG data URI 佔位）、`src/components/DriverCenterAccounts.tsx`（頁面 + 檢視/審核 Modal，審核結果走 in-memory override）。

### Other pages

業者管理 (`VendorManagement` / `VendorDetail`), 任務管理 (`TaskManagement`), 圖資管理 (`MapManagement` / `PlaceDetail`, Leaflet-based), 商店管理 (`StoreManagement`). Shared infra: `Navigation`, `Notification` + `hooks/useNotification`, `utils/mask`.

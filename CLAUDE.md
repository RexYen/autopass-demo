# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository overview

**Autopass Demo** — an internal admin-console **prototype** for Autopass. It is **frontend-only**: all data is hard-coded mock data and every state change is in-memory (a page refresh resets everything). There is no backend, API, auth, or persistence.

- **Stack**: React 19 + TypeScript + Vite, Mantine UI v8, React Router v7, Leaflet (map page). Node 22（同 CI，宣告於 `.nvmrc` / `engines`）.
- **Source** lives at the repo root (`package.json`, `src/`, `vite.config.ts`).
- **Deploy**: Vercel — https://autopass-demo.vercel.app（demo URL 即交付物）。merge 到 `main` 由 Vercel Git integration 自動部署上線，PR 產生 preview deployment。`vercel.json` has a SPA catch-all rewrite, required because the app uses `BrowserRouter` (real paths like `/autopass/tickets` would 404 on refresh otherwise).

## Workflow rules

- **Use a Pull Request for every change — never commit or push directly to `main`.** Branch off `main`, commit, push, and open a PR with `gh`.
- Only push / open PRs when the user explicitly asks.
- **文件同步（改程式必查）**：改路由／側欄 → 本檔路由表；改查繳行為、狀態機、欄位（`Autopass*` / `Ticket*`）→ [`drivingexpense-ticket.md`](./drivingexpense-ticket.md) 對應章節；改駕駛中心行為 → 本檔「行駕照/保單」段；使用者可見的功能增減 → `README.md`。文件漂移實際發生過（PR #42 即為一輪補救），別讓它重演。

## Commands

Run from the repo root:

- Dev server: `npm run dev` (Vite, default http://localhost:5173)
- Type check: `npm run typecheck` (`tsc -b`，不打包——改完先跑這個最快)
- Lint: `npm run lint` (ESLint — should be clean)
- Build: `npm run build` (`tsc -b && vite build`)
- CI gates **audit + lint + build** on every PR（audit = `npm audit --omit=dev --audit-level=high`）。注意：prod 依賴出現新 high advisory 時，所有 PR 會同時變紅且與改動內容無關——CI 失敗訊息對不上你的 diff 時先想到這個。

## Architecture

`src/main.tsx` mounts `BrowserRouter`; `src/App.tsx` is the `AppShell` + route table; `src/components/Navigation.tsx` is the side nav. Routes:

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

側欄另有「**財務管理**」佔位項：掛下拉箭頭但無子項、無路由、點擊不導頁（demo 視覺用，非壞掉的功能，勿修勿刪除非使用者要求）。

**新增頁面 checklist**（view 字串間接層，漏一處會靜默失效——路由能到但側欄不高亮、或點選單沒反應）：`App.tsx` 的 `CurrentView` union ＋ `pathToView` ＋ `viewToPath`、`Navigation.tsx` 的 view key 與選單項、本檔路由表。

### Primary feature — 通行費自動繳 / 查繳 (Autopass tickets)

Operators manage 代查代繳 task tickets (代查 + 代繳 a user's tolls/fees per cycle). **Full spec & design notes live in [`drivingexpense-ticket.md`](./drivingexpense-ticket.md).** Key files:

- `src/types/autopass.ts` — domain types + metadata tables (`STATUS_META`, `SERVICE_META`, `SERVICE_QUERY_FIELDS`, `QUERY_FIELD_META`, `TERMINAL_STATUSES`, `AutopassApplication` / `BillingCycle`, …). Single source of truth for status/service mappings; new service types or statuses start here — **但有型別帶不出的散點，新增 `ServiceType` 前先看 spec §5.5 檢查清單**。
- `src/data/autopassMock.ts` — hard-coded mock tickets（檔頭註記：ticket 用戶與申請單／駕駛中心 mock 是不同批示範用戶）。
- `src/components/AutopassTickets.tsx` — list container; serves both 查繳任務 and 歷史任務 via the `mode` prop. Holds all the in-memory override state.
- `src/components/TicketCard.tsx` — shared ticket card (pure render + callbacks).
- `src/components/TicketModals.tsx` — `QueryResultModal` / `ConfirmPaidModal` / `AddNoteModal`.
- `src/components/AutopassTicketDetail.tsx` — detail Drawer with the Activity timeline.
- `src/components/TicketPreview.tsx` — `/preview` reference page, reuses the above components.
- `src/components/AutopassApplications.tsx` — 通行費申請單頁（`/autopass/drivingexpense-applications`），行為規格見 spec §4.5；mock 資料在 `src/data/autopassApplicationsMock.ts`。

**Demo convention**: form submits write to override maps (`statusOverrides` / `noteOverrides` / `emailOverrides` / `invoiceOverrides`) inside `AutopassTickets`, merged onto the mock data with `useMemo`. Status flow, 請款, 發信, and 排程 are all simulated with toasts; nothing persists. 同一慣例也用在 `AutopassApplications` 的 `cycleOverrides` 與 `DriverCenterAccounts` 的審核 override。

### 行駕照/保單 (Driver center accounts)

對應 PRD [駕駛中心] v9.0「4.9 後臺顯示」：營運／審核人員檢視並審核用戶上傳的證件（駕照／行照／保單）。行為要點：

- Tabs 以**審核狀態**為維度（待審核／審核失敗／審核成功），內容為列表、欄位依 tab 而異；一組證件一列——駕照／行照為正＋反面兩檔，**保單為單一文件**，檔案數不固定，UI 以 `files.length` 判斷是否顯示切換。
- 篩選＝Email 關鍵字＋證件類型，**送出制**（按「搜尋」才套用，另有「重設」）；分頁每頁 10 筆。
- 證件影像**內嵌於審核 Modal**（看圖＋記錄結果一次完成；多檔左右切換、不提供下載入口）。兩種結果皆有二次確認 Modal，審核失敗於確認時**必填原因**（列表備註欄顯示）。
- 審核結果送出後**不可調整**（成功列僅剩「檢視」開純檢視 Modal、失敗列無操作欄）；審核失敗後用戶重新上傳 → 系統刪原紀錄、在待審核建新筆（後端行為，demo 未模擬）。

Key files: `src/types/driverCenter.ts`（domain types + `DRIVER_DOC_META` / `REVIEW_STATUS_META`）、`src/data/driverCenterMock.ts`（mock 上傳資料，證件影像為 SVG data URI 佔位）、`src/components/DriverCenterAccounts.tsx`（頁面 + 檢視/審核 Modal，審核結果走 in-memory override）。

### Other pages — legacy，維護準則

業者管理 (`VendorManagement` / `VendorDetail`)、任務管理 (`TaskManagement`)、圖資管理 (`MapManagement` / `PlaceDetail`, Leaflet-based)、商店管理 (`StoreManagement`) 是早期 prototype 頁，**視為 frozen legacy：僅小修、不主動重構**。已知狀況（碰到再處理，勿專程投資）：

- 四個巨型單檔（1,500–2,400 行）、mock 資料 inline、寫法與新頁（Autopass* / DriverCenter*）慣例不同。
- 舊列表頁的 `Pagination` 多為**裝飾性**（不真的切資料）；新頁才是真分頁（`PAGE_SIZE` + slice）。複製舊頁樣板做新頁時別把假分頁帶過去。
- 業者名單在 `VendorManagement` / `StoreManagement` / `App.tsx` 三處 hard-code 且 id 對應已漂移——改業者 mock 需同步三處，否則商店頁「檢視業者」會導錯。
- root 的「Autopass 充電站資訊_v2.csv」是當年建圖資頁的來源素材，**程式不讀取**，僅供人工對照。

### Shared infra & 慣例

- **Toast 兩種用法並存**（底層都是 Mantine notifications，`App.tsx` 同時掛 `<Notifications>` 與 `NotificationProvider`）：查繳主功能（`AutopassTickets` / `TicketModals` / `TicketPreview`）直接 `notifications.show`；其餘頁面用 `hooks/useNotification` 的 `showSuccess` 等（包自製 `Notification` 樣式）。新程式碼**跟隨所在頁面的既有用法**，勿引入第三種。
- demo 不做欄位遮罩，證件號碼／統編明碼顯示（原 `utils/mask.ts` 已移除）。
- `docs/superpowers/` 下的 plan / spec 是**歷史實作紀錄，非現行 spec**——現行行為以程式碼、`drivingexpense-ticket.md` 與本檔為準，勿依其中的程式碼區塊或 checkbox 行事。
- **新程式碼從最小實作開始**：不做未被要求的彈性／設定項、不為單一使用場景抽象化——這是 demo prototype，每一行都該對應到需求。
- **改動要外科手術式**：每行 diff 都能對應到本次任務；過程中發現的無關問題（死碼、怪寫法）**回報而不順手改**，讓它進獨立 PR。
- **驗證迴圈**固定為：`npm run typecheck` → `npm run lint` → `npm run build` → dev server 肉眼走過受影響頁面（本 repo 無測試框架，為刻意取捨）。

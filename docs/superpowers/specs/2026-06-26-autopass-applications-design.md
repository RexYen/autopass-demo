# 自動繳申請清單（營運後台）— 設計文件

- **日期**：2026-06-26
- **狀態**：設計已確認，待寫實作計畫
- **分支**：`feat/autopass-drivingexpense-applications`
- **來源需求**：Notion `[駕駛中心 v8.3] 自動繳收尾盤點` — 營運後台 #6「後台顯示自動繳申請清單」(P2) + #7「後台開放營運設定服務查繳週期」(P2)

## 1. 背景與目的

`autopass-demo` 是純前端、全 mock 的 Autopass 內部後台原型。本次新增一個**營運後台頁面**，讓營運人員：

1. 查看所有「自動繳申請」清單（哪個帳號、申請了哪個服務、用什麼資料、何時申請、目前的查繳週期）。
2. 編輯單筆申請的「查繳週期」並即時反映在畫面上。

「申請（application）」是查繳 ticket 的**上游概念**：用戶替某服務開通自動繳後，後端會依該申請的查繳週期，按週期產生查繳 tickets。本頁只管理「申請」本身，不涉及查繳 ticket 的查/繳流程（那是既有的 `AutopassTickets` 功能）。

### 與既有功能的關係

- 複用 `src/types/autopass.ts` 既有的 `ServiceType` / `SERVICE_META` / `QueryField` / `QUERY_FIELD_META` / `SERVICE_QUERY_FIELDS`，維持單一真實來源。
- 沿用 `AutopassTickets` 的「override map + `useMemo` 合併」記憶體變更慣例。
- 頁面外觀沿用既有管理頁（以 `StoreManagement` 為範本）的 `<Paper>` shell + Mantine `<Table>` + 搜尋 + `Pagination` 慣例。

## 2. 範圍

### In scope

- 新頁面 `自動繳申請`：表格顯示申請清單。
- 每列可透過「編輯」開 Modal，修改該申請的查繳週期；變更存於記憶體並即時生效。
- 側欄導覽新增入口、路由接線。

### Out of scope（明確不做）

- 新增/建立申請（header 不放「新增」鈕）。
- Notion #9「後台開放營運建立查繳任務票」(P3)。
- 任何持久化、API、後端串接。
- 編輯查繳週期以外的欄位（帳號、服務、申請資料皆唯讀）。

## 3. 術語釐清：`billingCycle` ≠ `Ticket.cycle`

| 概念 | 型別/值 | 意義 |
|---|---|---|
| `Ticket.cycle`（既有） | free string，如 `"2026/W18"`、`"2026/Q2"`、`"2026/05"` | 某張查繳 ticket 覆蓋的**週期實例** |
| `AutopassApplication.billingCycle`（新增） | `BillingCycle` enum：`週繳 / 雙週繳 / 月繳 / 年繳` | 該申請的**查繳頻率設定**（多久產一次 ticket） |

兩者刻意分開，互不沿用。本頁「查繳週期」欄指的是後者（頻率）。

## 4. Domain model（加進 `src/types/autopass.ts`）

```ts
export type BillingCycle = '週繳' | '雙週繳' | '月繳' | '年繳'

export const BILLING_CYCLES: BillingCycle[] = ['週繳', '雙週繳', '月繳', '年繳']

export interface AutopassApplication {
  id: string                                       // AP-xxx
  userEmail: string                                // 駕駛中心帳號
  serviceType: ServiceType                         // 申請服務 → SERVICE_META[serviceType].label
  queryData: Partial<Record<QueryField, string>>   // 申請資料；key 取自 SERVICE_QUERY_FIELDS[serviceType]
  appliedAt: string                                // 申請時間（ISO 字串）
  billingCycle: BillingCycle                       // 查繳週期（可編輯）
}
```

設計重點：

- `queryData` 以 `QueryField` 為 key，值為字串。渲染時對 `SERVICE_QUERY_FIELDS[serviceType]` 逐欄取值，標籤取 `QUERY_FIELD_META[field].label`。
- **不遮罩**：身分證/統編/車牌/Email 全部顯示完整值。不需引入 `utils/mask`。
- `BILLING_CYCLES` 為週期選項的單一來源（Modal 的 `Select` 與未來擴充都讀它）。目前不含 `季繳`；要加只需改這一處。

## 5. Mock data（新檔 `src/data/autopassApplicationsMock.ts`）

```ts
import type { AutopassApplication } from '../types/autopass'

export const mockApplications: AutopassApplication[] = [ /* 8–10 筆 */ ]
```

需求：

- 約 8–10 筆，**涵蓋全部 7 種 `ServiceType`**，個人與法人並存。
- 查繳週期分布要含 `雙週繳`（呼應 v8.3 ETC 改雙週繳）。
- 每筆 `queryData` 的 key 必須與 `SERVICE_QUERY_FIELDS[serviceType]` 完全對齊（例如 `traffic-fine-corporate` 要有 `idNumber` + `plateNumber` + `vehicleType`）。
- `appliedAt` 用近期日期（2026-06 上旬），對齊 Notion 範例。
- 對齊 Notion 範例列（ETC 通行費 / 違反強制險罰緩 / 公路養管費（汽燃費）等）。

## 6. 路由與導覽

### 路由（`src/App.tsx`）

- 新增 `<Route path="/autopass/drivingexpense-applications" element={<AutopassApplications />} />`。
- `CurrentView` union 新增 `'autopass-applications'`。
- `pathToView`：`if (path === '/autopass/drivingexpense-applications') return 'autopass-applications'`。
- `viewToPath`：`'autopass-applications': '/autopass/drivingexpense-applications'`。

### 導覽（`src/components/Navigation.tsx`）

- `NavigationView` union 新增 `'autopass-applications'`。
- `getActiveKey`：`case 'autopass-applications': return 'autopass-applications'`。
- 在「通行費自動繳」群組、`歷史任務` 之後新增一個 `<NavLink label="自動繳申請">`，icon 用 `@tabler/icons-react`（建議 `IconFileText` 或 `IconUserPlus`），active key `'autopass-applications'`，沿用 `navItemStyles`。

## 7. 頁面元件（`src/components/AutopassApplications.tsx`）

外層沿用既有管理頁 shell：

- `<Paper shadow radius="16px" style={{ minHeight: '760px', backgroundColor: '#ffffff', display:'flex', flexDirection:'column' }}>`
- **Header**：`<Group justify="space-between" px="20px" py="24px">`，左 `<Title order={2}>自動繳申請</Title>`，**右側不放任何按鈕**。
- **搜尋/篩選列**：`<Box px="20px" pb="24px">`，含
  - `<TextInput leftSection={<IconSearch/>} maxWidth 321>`：以 Email 或車牌過濾。
  - 服務別 `<Select leftSection={<IconFilter/>}>`：選項由 `SERVICE_META` 產生（含「全部」預設）。搜尋與服務別篩選為 AND 關係。
- **內容區**：可捲動 `<Box style={{ flex:1, overflow:'auto' }}>` 內放 `<Table withRowBorders>`。
- **Footer**：`<Group justify="space-between" px="20px" py="24px">`，左顯示「顯示 1 - N 筆，共 M 筆」，右 `<Pagination>`（`PAGE_SIZE = 10`，`color="#228be6"`）。

樣式（th/td padding、顏色 `#868e96` 表頭、`Noto Sans TC` 字型、`#228be6` 主色、Pagination 樣式）一律沿用 `StoreManagement` 既有寫法。

### 表格欄位

| 欄 | 內容 | 來源 |
|---|---|---|
| 駕駛中心帳號 | Email 完整值 | `app.userEmail` |
| 申請服務 | 服務名稱（可帶分類） | `SERVICE_META[app.serviceType].label`（分類 `.category`） |
| 申請資料 | 動態單欄，逐欄 `label：value` | 對 `SERVICE_QUERY_FIELDS[serviceType]` 取 `QUERY_FIELD_META[f].label` + `queryData[f]` |
| 申請時間 | 格式化日期時間 | `app.appliedAt` |
| 查繳週期 | 週期值（文字或 Badge） | 合併後的 `billingCycle`（含 override） |
| （操作） | 「編輯」按鈕 | 開 `EditCycleModal` |

「申請資料」採**單一動態欄**而非字面拆 `申請資料1 / 申請資料N`，以吃下不同服務的變動欄數。

## 8. 編輯互動與狀態

### Override map（記憶體變更，模仿 `AutopassTickets`）

```ts
const [cycleOverrides, setCycleOverrides] = useState<Record<string, BillingCycle>>({})

const applications = useMemo(
  () => mockApplications.map(a =>
    cycleOverrides[a.id] ? { ...a, billingCycle: cycleOverrides[a.id] } : a
  ),
  [cycleOverrides]
)
```

- 搜尋/篩選/分頁都跑在合併後的 `applications` 上。
- 變更只在記憶體；重新整理即重置（與全 app 一致）。

### `EditCycleModal`

- 觸發：列上「編輯」→ 設定 `editingId`，開 Modal。
- 內容：
  - 唯讀 context：帳號（`userEmail`）、服務（`SERVICE_META[...].label`）。
  - `<Select data={BILLING_CYCLES} defaultValue={目前 billingCycle}>`。
  - 底部 `[取消] [儲存]`。
- 儲存：`setCycleOverrides(prev => ({ ...prev, [editingId]: 選定值 }))` → 關閉 Modal → `showSuccess(\`已更新查繳週期為「\${value}」\`, '查繳週期已更新')`。
- Modal 與按鈕樣式沿用既有管理頁（`header: { display:'none' }`、主鈕 `#228be6`、`'&:hover':#1c7ed6`、取消鈕 outline）。

### 通知

```ts
import { useNotification } from '../hooks/useNotification'
const { showSuccess } = useNotification()
```

呼叫簽名 `showSuccess(title, subtitle)`，與既有頁一致。

## 9. 受影響檔案清單

| 檔案 | 變更 |
|---|---|
| `src/types/autopass.ts` | 新增 `BillingCycle`、`BILLING_CYCLES`、`AutopassApplication` |
| `src/data/autopassApplicationsMock.ts` | 新檔，`mockApplications` |
| `src/components/AutopassApplications.tsx` | 新檔，頁面 + 表格 + EditCycleModal + override 狀態 |
| `src/App.tsx` | 路由、`CurrentView`、`pathToView`、`viewToPath` |
| `src/components/Navigation.tsx` | `NavigationView`、`getActiveKey`、新 `NavLink` |

## 10. 驗收條件

1. 側欄「通行費自動繳」群組出現「自動繳申請」，點擊導到 `/autopass/drivingexpense-applications` 並 highlight。
2. 表格列出 mock 申請，欄位齊全，申請資料依服務動態顯示對的欄位、值完整不遮罩。
3. 搜尋可用 Email / 車牌過濾，服務別 `Select` 可篩選（與搜尋為 AND）；分頁正常。
4. 點某列「編輯」開 Modal，改週期後儲存 → 該列查繳週期即時更新、跳成功 toast，重新整理才重置。
5. `npm run lint` 乾淨、`npm run build` 通過。

## 11. 風險 / 備註

- 直連 `/autopass/drivingexpense-applications` 重新整理不會 404（`vercel.json` 已有 SPA catch-all）。
- 命名上 `drivingexpense-applications` 與既有 `tickets`/`history` 同層、扁平 segment，刻意呼應 `drivingexpense-ticket.md` 規格命名。
- 工作流程：本功能走 `feat/autopass-drivingexpense-applications` 分支，**僅在使用者明確要求時才 push / 開 PR**。

# 自動繳申請清單（營運後台）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 autopass-demo 新增一個營運後台頁面「自動繳申請」，顯示自動繳申請清單，並可逐筆編輯查繳週期（記憶體變更、即時生效）。

**Architecture:** 純前端、全 mock。新 domain 型別與 mock 資料分別放 `src/types/autopass.ts` 與 `src/data/autopassApplicationsMock.ts`；頁面元件 `src/components/AutopassApplications.tsx` 沿用 `StoreManagement` 的 `<Paper>` shell + Mantine `<Table>` 慣例；編輯查繳週期用小 Modal 寫入 `cycleOverrides` useState map，再以 `useMemo` 疊回 `mockApplications`（模仿 `AutopassTickets` 的 override 模式）。路由 `/autopass/drivingexpense-applications`，側欄入口接在「通行費自動繳」群組。

**Tech Stack:** React 19 + TypeScript + Vite、Mantine UI v8、React Router v7、`@tabler/icons-react`。

> **⚠️ 實作後調整（本計畫為當時的逐步建置紀錄，下列差異未回寫到內文程式碼區塊；最新設計以 spec `2026-06-26-autopass-applications-design.md` §12 與實際程式碼為準）：**
> 1. 頁面 / 側欄命名「自動繳申請」→「**通行費申請單**」。
> 2. 第一欄「駕駛中心帳號」→「**Email**」。
> 3. 欄位順序：「查繳週期」移到「申請服務」之後（Email / 申請服務 / 查繳週期 / 申請資料 / 申請時間 / 操作）。
> 4. 操作的「編輯」文字連結 → **pencil ActionIcon**（`IconPencil` + `<ActionIcon variant="transparent" size={20}>`，沿用業者管理列表）。
> 5. **移除交通罰緩服務**（已下架）：`ServiceType` 7→**5 種**，本頁 mock 申請 10→**8 筆**（移除 AP-007 / AP-008）。

## Global Constraints

> 每個 task 的要求都隱含包含本節。

- **純前端 prototype**：無後端 / API / 持久化。所有狀態變更皆記憶體，重新整理即重置。
- **無測試框架**：本 repo 沒有 test runner。每個 task 的驗證 = `npx tsc -b`（型別）+ `npm run lint`（eslint，必須零錯誤）+ 在 `npm run dev`（http://localhost:5173 ，HMR 已開）肉眼確認行為。最後一個 task 額外跑 `npm run build` 當總門檻。
- **遮罩**：不遮任何欄位（身分證/統編/車牌/Email 全顯示完整）。不引入 `utils/mask`。
- **查繳週期選項**：`週繳 / 雙週繳 / 月繳 / 年繳`（不含季繳），單一來源 `BILLING_CYCLES`。
- **`billingCycle`（頻率）與既有 `Ticket.cycle`（週期實例字串）是兩個概念，不沿用、不混寫。**
- **樣式**：沿用既有管理頁慣例 — `Noto Sans TC, sans-serif` 字型、主色 `#228be6`（hover `#1c7ed6`）、表頭文字 `#868e96`、`<Table withTableBorder={false} withRowBorders>`。
- **路由**：`/autopass/drivingexpense-applications`（扁平 segment、連字號）。
- **分支與 PR**：在 `feat/autopass-drivingexpense-applications` 上開發；**僅在使用者明確要求時才 push / 開 PR**。
- **Commit 訊息**：繁中、conventional prefix，結尾加上：
  ```
  Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
  ```

---

### Task 1: Domain 型別

**Files:**
- Modify: `src/types/autopass.ts`（在檔案尾端追加）

**Interfaces:**
- Consumes: 既有 `ServiceType`、`QueryField`（同檔已定義）
- Produces:
  - `type BillingCycle = '週繳' | '雙週繳' | '月繳' | '年繳'`
  - `const BILLING_CYCLES: BillingCycle[]`
  - `interface AutopassApplication { id: string; userEmail: string; serviceType: ServiceType; queryData: Partial<Record<QueryField, string>>; appliedAt: string; billingCycle: BillingCycle }`

- [ ] **Step 1: 在 `src/types/autopass.ts` 檔案最末端追加以下程式碼**

```ts

// ── 自動繳申請（營運後台）──────────────────────────────
// 查繳「頻率」設定，與 Ticket.cycle（週期實例字串，如 "2026/W18"）是不同概念，不可混用。
export type BillingCycle = '週繳' | '雙週繳' | '月繳' | '年繳'

export const BILLING_CYCLES: BillingCycle[] = ['週繳', '雙週繳', '月繳', '年繳']

// 一筆自動繳「申請」：用戶替某服務開通自動繳，後端再依 billingCycle 週期性產生查繳 ticket。
export interface AutopassApplication {
  id: string                                       // AP-xxx
  userEmail: string                                // 駕駛中心帳號
  serviceType: ServiceType                         // 申請服務 → SERVICE_META[serviceType].label
  queryData: Partial<Record<QueryField, string>>   // 申請資料；key 取自 SERVICE_QUERY_FIELDS[serviceType]
  appliedAt: string                                // 申請時間（ISO 字串）
  billingCycle: BillingCycle                       // 查繳週期（可編輯）
}
```

- [ ] **Step 2: 型別檢查**

Run: `npx tsc -b`
Expected: 無錯誤（純新增型別宣告，尚無 consumer）。

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: 零錯誤。

- [ ] **Step 4: Commit**

```bash
git add src/types/autopass.ts
git commit -m "$(cat <<'EOF'
feat(autopass): 新增自動繳申請 domain 型別（AutopassApplication / BillingCycle）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Mock 資料

**Files:**
- Create: `src/data/autopassApplicationsMock.ts`

**Interfaces:**
- Consumes: `AutopassApplication`（Task 1）、`SERVICE_QUERY_FIELDS`（決定每筆 `queryData` 該有哪些 key）
- Produces: `const mockApplications: AutopassApplication[]`

每筆 `queryData` 的 key 必須與 `SERVICE_QUERY_FIELDS[serviceType]` 完全一致：
- `etc-toll` / `fuel-fee-personal` / `fuel-fee-corporate` / `fuel-fee-overdue` → `idNumber` + `plateNumber`
- `traffic-fine-personal` → `idNumber` + `birthDate`
- `traffic-fine-corporate` → `idNumber` + `plateNumber` + `vehicleType`
- `compulsory-insurance-fine` → `plateNumber` + `vehicleType`

- [ ] **Step 1: 建立 `src/data/autopassApplicationsMock.ts`，內容如下**

```ts
import type { AutopassApplication } from '../types/autopass'

// 純 demo 用 mock 資料；涵蓋全部 7 種 serviceType、個人與法人、各種查繳週期（含雙週繳）。
// 每筆 queryData 的 key 對齊 SERVICE_QUERY_FIELDS[serviceType]。
export const mockApplications: AutopassApplication[] = [
  {
    id: 'AP-001',
    userEmail: 'abc@123.com',
    serviceType: 'etc-toll',
    queryData: { idNumber: 'A123456789', plateNumber: 'ABC-123' },
    appliedAt: '2026-06-10T00:00:11',
    billingCycle: '週繳',
  },
  {
    id: 'AP-002',
    userEmail: 'abc@123.com',
    serviceType: 'compulsory-insurance-fine',
    queryData: { plateNumber: 'ABC-123', vehicleType: '汽車' },
    appliedAt: '2026-06-10T00:00:11',
    billingCycle: '月繳',
  },
  {
    id: 'AP-003',
    userEmail: 'xyz@gmail.com',
    serviceType: 'etc-toll',
    queryData: { idNumber: 'B223456789', plateNumber: 'KKK-1345' },
    appliedAt: '2026-06-10T15:11:30',
    billingCycle: '雙週繳',
  },
  {
    id: 'AP-004',
    userEmail: 'fff@gmail.com',
    serviceType: 'fuel-fee-personal',
    queryData: { idNumber: 'A187654321', plateNumber: 'FFG-754' },
    appliedAt: '2026-06-10T15:32:07',
    billingCycle: '年繳',
  },
  {
    id: 'AP-005',
    userEmail: 'fleet@logistics.com.tw',
    serviceType: 'fuel-fee-corporate',
    queryData: { idNumber: '53212539', plateNumber: 'RBA-7788' },
    appliedAt: '2026-06-11T09:14:52',
    billingCycle: '年繳',
  },
  {
    id: 'AP-006',
    userEmail: 'late.payer@hotmail.com',
    serviceType: 'fuel-fee-overdue',
    queryData: { idNumber: 'F234567890', plateNumber: 'MNL-2210' },
    appliedAt: '2026-06-11T11:03:20',
    billingCycle: '月繳',
  },
  {
    id: 'AP-007',
    userEmail: 'jane.driver@gmail.com',
    serviceType: 'traffic-fine-personal',
    queryData: { idNumber: 'A299887766', birthDate: '1990/04/15' },
    appliedAt: '2026-06-12T08:45:00',
    billingCycle: '月繳',
  },
  {
    id: 'AP-008',
    userEmail: 'ops@taxi-corp.com.tw',
    serviceType: 'traffic-fine-corporate',
    queryData: { idNumber: '28990011', plateNumber: 'TXC-0099', vehicleType: '汽車' },
    appliedAt: '2026-06-12T16:20:41',
    billingCycle: '雙週繳',
  },
  {
    id: 'AP-009',
    userEmail: 'rider01@gmail.com',
    serviceType: 'compulsory-insurance-fine',
    queryData: { plateNumber: 'MGB-368', vehicleType: '機車' },
    appliedAt: '2026-06-13T10:09:33',
    billingCycle: '年繳',
  },
  {
    id: 'AP-010',
    userEmail: 'second.car@gmail.com',
    serviceType: 'etc-toll',
    queryData: { idNumber: 'A123456789', plateNumber: 'BNG-5521' },
    appliedAt: '2026-06-13T19:55:08',
    billingCycle: '月繳',
  },
]
```

- [ ] **Step 2: 型別檢查（驗證 queryData key 與服務對齊、欄位型別正確）**

Run: `npx tsc -b`
Expected: 無錯誤。

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: 零錯誤。

- [ ] **Step 4: Commit**

```bash
git add src/data/autopassApplicationsMock.ts
git commit -m "$(cat <<'EOF'
feat(autopass): 新增自動繳申請 mock 資料（涵蓋全 7 服務 / 各週期）

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: 申請清單頁（唯讀）+ 路由與導覽接線

**Files:**
- Create: `src/components/AutopassApplications.tsx`
- Modify: `src/App.tsx`
- Modify: `src/components/Navigation.tsx`

**Interfaces:**
- Consumes: `mockApplications`（Task 2）、`SERVICE_META` / `SERVICE_QUERY_FIELDS` / `QUERY_FIELD_META`（既有）
- Produces: `export function AutopassApplications()`（無 props）；路由 `/autopass/drivingexpense-applications`；側欄項目「自動繳申請」（active key `'autopass-applications'`）
- 備註：本 task 的清單直接讀 `mockApplications`（含搜尋 / 服務別篩選 / 分頁）。Task 4 會把資料來源換成帶 `cycleOverrides` 的 `useMemo`，並把「編輯」鈕接上 Modal。

- [ ] **Step 1: 建立 `src/components/AutopassApplications.tsx`，完整內容如下**

```tsx
import {
  Paper,
  Title,
  Group,
  TextInput,
  Table,
  Badge,
  Pagination,
  Text,
  Box,
  Select,
  Stack,
} from '@mantine/core'
import { IconSearch, IconFilter } from '@tabler/icons-react'
import { useState } from 'react'
import {
  SERVICE_META,
  SERVICE_QUERY_FIELDS,
  QUERY_FIELD_META,
} from '../types/autopass'
import { mockApplications } from '../data/autopassApplicationsMock'

const PAGE_SIZE = 10

// 服務別篩選：以顯示名稱去重（同名不同 serviceType 視為同一類，例如個人/法人汽燃費）
const SERVICE_LABELS = Array.from(
  new Set(Object.values(SERVICE_META).map((m) => m.label)),
)

const cellText = {
  color: '#000000',
  fontSize: '14px',
  lineHeight: '20px',
  fontFamily: 'Noto Sans TC, sans-serif',
  fontWeight: 400,
}

const cellTextDim = {
  color: '#495057',
  fontSize: '13px',
  lineHeight: '18px',
  fontFamily: 'Noto Sans TC, sans-serif',
  fontWeight: 400,
}

const cycleBadgeStyles = {
  root: {
    backgroundColor: 'rgba(34,139,230,0.1)',
    color: '#1971c2',
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 400,
    padding: '4px 8px',
    borderRadius: '16px',
    border: 'none',
    fontFamily: 'Noto Sans TC, sans-serif',
  },
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function AutopassApplications() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState<string | null>(null)

  const applications = mockApplications

  const filtered = applications.filter((app) => {
    const term = searchTerm.trim().toLowerCase()
    const matchesSearch =
      !term ||
      app.userEmail.toLowerCase().includes(term) ||
      (app.queryData.plateNumber ?? '').toLowerCase().includes(term)
    const matchesService =
      !filterService || SERVICE_META[app.serviceType].label === filterService
    return matchesSearch && matchesService
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )
  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length)

  return (
    <Paper
      shadow="0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)"
      radius="16px"
      style={{
        minHeight: '760px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {/* Header */}
      <Group
        justify="space-between"
        px="20px"
        py="24px"
        style={{ borderBottom: 'none', flexShrink: 0 }}
      >
        <Title
          order={2}
          style={{
            color: '#000000',
            fontWeight: 700,
            fontSize: '20px',
            lineHeight: '24px',
            fontFamily: 'Noto Sans TC, sans-serif',
          }}
        >
          自動繳申請
        </Title>
      </Group>

      {/* Search and Filters */}
      <Box px="20px" pb="24px" style={{ flexShrink: 0 }}>
        <Group gap="16px" align="end">
          <TextInput
            placeholder="搜尋 Email 或車牌"
            leftSection={<IconSearch size={16} />}
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.currentTarget.value)
              setCurrentPage(1)
            }}
            style={{ maxWidth: '321px', width: '100%' }}
            styles={{
              input: {
                borderColor: '#dee2e6',
                borderRadius: '4px',
                height: '40px',
                fontSize: '14px',
                lineHeight: '20px',
                '&::placeholder': { color: '#adb5bd' },
              },
            }}
          />
          <Select
            placeholder="服務別"
            data={SERVICE_LABELS}
            value={filterService}
            onChange={(value) => {
              setFilterService(value)
              setCurrentPage(1)
            }}
            clearable
            leftSection={<IconFilter size={16} />}
            style={{ width: '200px' }}
            styles={{
              input: {
                borderColor: '#dee2e6',
                borderRadius: '4px',
                height: '40px',
                fontSize: '14px',
                lineHeight: '20px',
              },
            }}
          />
        </Group>
      </Box>

      {/* Table */}
      <Box
        style={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Table
          withTableBorder={false}
          withRowBorders
          styles={{
            table: { backgroundColor: '#ffffff', width: '100%' },
            thead: { backgroundColor: '#ffffff' },
            th: {
              color: '#868e96',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '20px',
              padding: '12px 20px',
              height: '50px',
              borderBottom: '1px solid #dee2e6',
              fontFamily: 'Noto Sans TC, sans-serif',
            },
            td: {
              padding: '12px 20px',
              height: 'auto',
              minHeight: '50px',
              borderBottom: '1px solid #dee2e6',
              verticalAlign: 'middle',
              overflow: 'visible',
            },
            tr: {
              backgroundColor: '#ffffff',
              '&:hover': { backgroundColor: '#ffffff' },
            },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: '22%' }}>駕駛中心帳號</Table.Th>
              <Table.Th style={{ width: '16%' }}>申請服務</Table.Th>
              <Table.Th style={{ width: '26%' }}>申請資料</Table.Th>
              <Table.Th style={{ width: '16%' }}>申請時間</Table.Th>
              <Table.Th style={{ width: '12%' }}>查繳週期</Table.Th>
              <Table.Th style={{ width: '8%' }}>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pageItems.map((app) => (
              <Table.Tr key={app.id}>
                <Table.Td>
                  <Text style={cellText}>{app.userEmail}</Text>
                </Table.Td>
                <Table.Td>
                  <Text style={cellText}>
                    {SERVICE_META[app.serviceType].label}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Stack gap={2}>
                    {SERVICE_QUERY_FIELDS[app.serviceType].map((field) => (
                      <Text key={field} style={cellTextDim}>
                        {QUERY_FIELD_META[field].label}：
                        {app.queryData[field] ?? '—'}
                      </Text>
                    ))}
                  </Stack>
                </Table.Td>
                <Table.Td>
                  <Text style={cellText}>{formatDateTime(app.appliedAt)}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" styles={cycleBadgeStyles}>
                    {app.billingCycle}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text
                    style={{
                      color: '#228be6',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontFamily: 'Noto Sans TC, sans-serif',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    編輯
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>

      {/* Footer */}
      <Group
        justify="space-between"
        px="20px"
        py="24px"
        style={{ borderTop: 'none', flexShrink: 0 }}
      >
        <Text
          style={{
            color: '#868e96',
            fontSize: '14px',
            lineHeight: '20px',
            fontFamily: 'Noto Sans TC, sans-serif',
          }}
        >
          顯示 {rangeStart} - {rangeEnd} 筆，共 {filtered.length} 筆
        </Text>
        <Pagination
          total={totalPages}
          value={safePage}
          onChange={setCurrentPage}
          color="#228be6"
          size="sm"
          styles={{
            control: {
              width: '24px',
              height: '24px',
              minWidth: '24px',
              fontSize: '14px',
              lineHeight: '20px',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
              backgroundColor: '#ffffff',
              color: '#000000',
              '&[data-active]': {
                backgroundColor: '#228be6',
                color: '#ffffff',
                borderColor: '#228be6',
              },
              '&[data-active]:hover': {
                backgroundColor: '#228be6',
                color: '#ffffff',
              },
            },
          }}
        />
      </Group>
    </Paper>
  )
}
```

- [ ] **Step 2: 在 `src/App.tsx` 加入 import（接在第 11 行 `TicketPreview` import 之後）**

```tsx
import { AutopassApplications } from './components/AutopassApplications'
```

- [ ] **Step 3: 在 `src/App.tsx` 的 `CurrentView` union 末端新增成員**

把：

```tsx
  | 'autopass-tickets'
  | 'autopass-history'
```

改成：

```tsx
  | 'autopass-tickets'
  | 'autopass-history'
  | 'autopass-applications'
```

- [ ] **Step 4: 在 `src/App.tsx` 的 `pathToView` 內，於 `autopass-history` 那行之後新增一行**

把：

```tsx
    if (path === '/autopass/history') return 'autopass-history'
    return 'autopass-tickets'
```

改成：

```tsx
    if (path === '/autopass/history') return 'autopass-history'
    if (path === '/autopass/drivingexpense-applications') return 'autopass-applications'
    return 'autopass-tickets'
```

- [ ] **Step 5: 在 `src/App.tsx` 的 `viewToPath` record 內新增一筆**

把：

```tsx
      'autopass-tickets': '/autopass/tickets',
      'autopass-history': '/autopass/history',
    }
```

改成：

```tsx
      'autopass-tickets': '/autopass/tickets',
      'autopass-history': '/autopass/history',
      'autopass-applications': '/autopass/drivingexpense-applications',
    }
```

- [ ] **Step 6: 在 `src/App.tsx` 的 `<Routes>` 內，於 `/autopass/history` 那條 Route 之後新增**

把：

```tsx
          <Route path="/autopass/history" element={<AutopassTickets mode="history" />} />
          <Route path="/preview" element={<TicketPreview />} />
```

改成：

```tsx
          <Route path="/autopass/history" element={<AutopassTickets mode="history" />} />
          <Route path="/autopass/drivingexpense-applications" element={<AutopassApplications />} />
          <Route path="/preview" element={<TicketPreview />} />
```

- [ ] **Step 7: 在 `src/components/Navigation.tsx` 的 icons import 內新增 `IconFileText`**

把：

```tsx
  IconClipboardList,
  IconHistory,
} from '@tabler/icons-react'
```

改成：

```tsx
  IconClipboardList,
  IconHistory,
  IconFileText,
} from '@tabler/icons-react'
```

- [ ] **Step 8: 在 `src/components/Navigation.tsx` 的 `NavigationView` union 末端新增成員**

把：

```tsx
  | 'autopass-tickets'
  | 'autopass-history'
```

改成：

```tsx
  | 'autopass-tickets'
  | 'autopass-history'
  | 'autopass-applications'
```

- [ ] **Step 9: 在 `src/components/Navigation.tsx` 的 `getActiveKey` switch 內，於 `autopass-history` case 之後新增**

把：

```tsx
      case 'autopass-history':
        return 'autopass-history'
      case 'welcome':
```

改成：

```tsx
      case 'autopass-history':
        return 'autopass-history'
      case 'autopass-applications':
        return 'autopass-applications'
      case 'welcome':
```

- [ ] **Step 10: 在 `src/components/Navigation.tsx`「通行費自動繳」群組內，於「歷史任務」NavLink 之後新增一個 NavLink**

找到歷史任務 NavLink（`label="歷史任務"`）的結尾 `/>`，在它之後、`</Stack>` 之前插入：

```tsx
        <NavLink
          href="#"
          label="自動繳申請"
          leftSection={<IconFileText size={16} />}
          active={active === 'autopass-applications'}
          onClick={() => {
            setActive('autopass-applications')
            onNavigate?.('autopass-applications')
          }}
          styles={navItemStyles(active === 'autopass-applications')}
        />
```

- [ ] **Step 11: 型別檢查**

Run: `npx tsc -b`
Expected: 無錯誤。

- [ ] **Step 12: Lint**

Run: `npm run lint`
Expected: 零錯誤。

- [ ] **Step 13: 肉眼驗證（dev server 已在 http://localhost:5173 ）**

1. 左側「通行費自動繳」群組出現「自動繳申請」，點它 → 網址變 `/autopass/drivingexpense-applications`，該項 highlight。
2. 表格列出 10 筆 mock 申請；「申請資料」欄依服務顯示對應欄位（如 ETC 顯示 證件號碼／統編 + 車牌號碼；強制險顯示 車牌號碼 + 車種），值完整未遮罩。
3. 搜尋輸入 `xyz` 或 `KKK` → 列表縮到對應列；服務別 `Select` 選「ETC 通行費」→ 只剩 ETC 列；分頁顯示「顯示 1 - N 筆，共 N 筆」。
4. 重新整理 `/autopass/drivingexpense-applications` 不會 404。

- [ ] **Step 14: Commit**

```bash
git add src/components/AutopassApplications.tsx src/App.tsx src/components/Navigation.tsx
git commit -m "$(cat <<'EOF'
feat(autopass): 自動繳申請清單頁 + 路由與導覽接線

新增 /autopass/drivingexpense-applications 唯讀清單（表格 / 搜尋 / 服務別篩選 / 分頁），
側欄「通行費自動繳」群組新增入口。

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: 編輯查繳週期（小 Modal + 記憶體 override）

**Files:**
- Modify: `src/components/AutopassApplications.tsx`

**Interfaces:**
- Consumes: `BILLING_CYCLES` / `BillingCycle`（Task 1）、`useNotification`（既有 hook，`showSuccess(title, subtitle)`）
- Produces: 點「編輯」開 Modal、改週期儲存後寫入 `cycleOverrides`，列表即時更新並保留到重新整理
- 變更摘要：擴充 import；把 `applications` 改成帶 `cycleOverrides` 的 `useMemo`；新增編輯 state 與 handlers；把「編輯」`Text` 接上 `openEdit`；在 `</Paper>` 前加入 Modal。

- [ ] **Step 1: 擴充 `@mantine/core` import（加入 `Modal`、`Button`）**

把：

```tsx
import {
  Paper,
  Title,
  Group,
  TextInput,
  Table,
  Badge,
  Pagination,
  Text,
  Box,
  Select,
  Stack,
} from '@mantine/core'
```

改成：

```tsx
import {
  Paper,
  Title,
  Group,
  TextInput,
  Table,
  Badge,
  Pagination,
  Text,
  Box,
  Select,
  Stack,
  Modal,
  Button,
} from '@mantine/core'
```

- [ ] **Step 2: 擴充 react import 與型別 / hook import**

把：

```tsx
import { useState } from 'react'
import {
  SERVICE_META,
  SERVICE_QUERY_FIELDS,
  QUERY_FIELD_META,
} from '../types/autopass'
import { mockApplications } from '../data/autopassApplicationsMock'
```

改成：

```tsx
import { useState, useMemo } from 'react'
import {
  SERVICE_META,
  SERVICE_QUERY_FIELDS,
  QUERY_FIELD_META,
  BILLING_CYCLES,
} from '../types/autopass'
import type { BillingCycle } from '../types/autopass'
import { mockApplications } from '../data/autopassApplicationsMock'
import { useNotification } from '../hooks/useNotification'
```

- [ ] **Step 3: 新增 `labelText` module-level 樣式（接在 `cycleBadgeStyles` 之後）**

```tsx
const labelText = {
  color: '#000000',
  fontSize: '14px',
  fontFamily: 'Noto Sans TC',
  fontWeight: 500,
  lineHeight: '20px',
}
```

- [ ] **Step 4: 把資料來源換成帶 override 的 `useMemo`，並新增編輯 state / hook / handlers**

把：

```tsx
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState<string | null>(null)

  const applications = mockApplications
```

改成：

```tsx
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterService, setFilterService] = useState<string | null>(null)

  // 記憶體 override：編輯查繳週期只在前端生效，重新整理即重置（與全 app 一致）
  const [cycleOverrides, setCycleOverrides] = useState<
    Record<string, BillingCycle>
  >({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftCycle, setDraftCycle] = useState<BillingCycle | null>(null)
  const { showSuccess } = useNotification()

  const applications = useMemo(
    () =>
      mockApplications.map((a) =>
        cycleOverrides[a.id]
          ? { ...a, billingCycle: cycleOverrides[a.id] }
          : a,
      ),
    [cycleOverrides],
  )

  const editingApp = applications.find((a) => a.id === editingId) ?? null

  const openEdit = (id: string, cycle: BillingCycle) => {
    setEditingId(id)
    setDraftCycle(cycle)
  }

  const closeEdit = () => {
    setEditingId(null)
    setDraftCycle(null)
  }

  const saveEdit = () => {
    if (editingId && draftCycle) {
      setCycleOverrides((prev) => ({ ...prev, [editingId]: draftCycle }))
      showSuccess(`已更新查繳週期為「${draftCycle}」`, '查繳週期已更新')
      closeEdit()
    }
  }
```

- [ ] **Step 5: 把「編輯」`Text` 接上 `openEdit`**

把：

```tsx
                  <Text
                    style={{
                      color: '#228be6',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontFamily: 'Noto Sans TC, sans-serif',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    編輯
                  </Text>
```

改成：

```tsx
                  <Text
                    onClick={() => openEdit(app.id, app.billingCycle)}
                    style={{
                      color: '#228be6',
                      fontSize: '14px',
                      lineHeight: '20px',
                      fontFamily: 'Noto Sans TC, sans-serif',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    }}
                  >
                    編輯
                  </Text>
```

- [ ] **Step 6: 在結尾 `</Paper>` 之前插入編輯 Modal**

把 component return 的最後：

```tsx
        />
      </Group>
    </Paper>
  )
}
```

改成（在 `</Group>` 與 `</Paper>` 之間插入 Modal）：

```tsx
        />
      </Group>

      {/* 編輯查繳週期 Modal */}
      <Modal
        opened={editingId !== null}
        onClose={closeEdit}
        title=""
        centered
        size={420}
        padding="16px"
        styles={{
          content: {
            background: '#ffffff',
            boxShadow:
              '0px 7px 7px -5px rgba(0,0,0,0.04), 0px 10px 15px -5px rgba(0,0,0,0.1), 0px 1px 3px 0px rgba(0,0,0,0.05)',
            borderRadius: '4px',
            width: '420px',
          },
          header: { display: 'none' },
          body: { padding: '16px' },
        }}
      >
        <Stack gap="24px">
          <Title
            order={4}
            style={{
              color: '#000000',
              fontSize: '16px',
              fontFamily: 'Noto Sans TC',
              fontWeight: 700,
              lineHeight: '24px',
              margin: 0,
            }}
          >
            編輯查繳週期
          </Title>

          <Stack gap="16px">
            {editingApp && (
              <Stack gap="4px">
                <Text style={labelText}>帳號</Text>
                <Text style={cellText}>{editingApp.userEmail}</Text>
              </Stack>
            )}
            {editingApp && (
              <Stack gap="4px">
                <Text style={labelText}>服務</Text>
                <Text style={cellText}>
                  {SERVICE_META[editingApp.serviceType].label}
                </Text>
              </Stack>
            )}
            <Stack gap="4px">
              <Text style={labelText}>查繳週期</Text>
              <Select
                data={BILLING_CYCLES}
                value={draftCycle}
                onChange={(value) => setDraftCycle(value as BillingCycle | null)}
                styles={{
                  input: {
                    backgroundColor: '#ffffff',
                    padding: '6px 12px',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'Noto Sans TC',
                    fontWeight: 400,
                    lineHeight: '20px',
                  },
                }}
              />
            </Stack>
          </Stack>

          <Group justify="flex-end" gap="16px">
            <Button
              variant="outline"
              onClick={closeEdit}
              styles={{
                root: {
                  backgroundColor: '#ffffff',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  color: '#212529',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 400,
                  lineHeight: '20px',
                  '&:hover': { backgroundColor: '#f8f9fa' },
                },
              }}
            >
              取消
            </Button>
            <Button
              onClick={saveEdit}
              disabled={!draftCycle}
              styles={{
                root: {
                  backgroundColor: '#228be6',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontFamily: 'Noto Sans TC',
                  fontWeight: 400,
                  lineHeight: '20px',
                  '&:hover': { backgroundColor: '#1c7ed6' },
                  '&:disabled': { backgroundColor: '#e9ecef', color: '#868e96' },
                },
              }}
            >
              儲存
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Paper>
  )
}
```

- [ ] **Step 7: 型別檢查**

Run: `npx tsc -b`
Expected: 無錯誤。

- [ ] **Step 8: Lint**

Run: `npm run lint`
Expected: 零錯誤。

- [ ] **Step 9: 肉眼驗證（dev server）**

1. 在某列點「編輯」→ 跳出小 Modal，顯示該列的帳號 + 服務（唯讀），查繳週期 `Select` 預設為目前值。
2. 改成別的週期 → 點「儲存」→ Modal 關閉、右下角跳「查繳週期已更新」toast、該列「查繳週期」badge 立即變成新值。
3. 切換搜尋 / 分頁後該變更仍在；**重新整理頁面後回到原值**（確認只在記憶體）。
4. 點「編輯」再「取消」→ 不改值、Modal 關閉。

- [ ] **Step 10: 全量建置（總門檻）**

Run: `npm run build`
Expected: `tsc -b` 與 `vite build` 皆成功、無錯誤。

- [ ] **Step 11: Commit**

```bash
git add src/components/AutopassApplications.tsx
git commit -m "$(cat <<'EOF'
feat(autopass): 自動繳申請清單支援編輯查繳週期（記憶體 override）

點「編輯」開小 Modal 改查繳週期，存入 cycleOverrides 並以 useMemo 疊回，
即時生效、跳成功 toast；重新整理即重置。

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Self-Review

**1. Spec coverage：**
- §4 domain model（`BillingCycle` / `BILLING_CYCLES` / `AutopassApplication`）→ Task 1 ✅
- §5 mock 資料（全 7 服務、含雙週繳、queryData 對齊）→ Task 2 ✅
- §6 路由 + 導覽接線 → Task 3 (Steps 2–10) ✅
- §7 頁面 / 表格（shell、header 無新增鈕、搜尋、服務別篩選、動態申請資料欄、footer + 分頁）→ Task 3 ✅
- §8 編輯互動 + override map + 通知 → Task 4 ✅
- §10 驗收條件（導覽 highlight、欄位完整不遮罩、搜尋/篩選/分頁、編輯即時生效後刷新重置、lint + build）→ Task 3 Step 13 + Task 4 Steps 9–10 ✅

**2. Placeholder scan：** 無 TBD / TODO；所有 code step 皆含完整可編譯程式碼（含完整 import、樣式、handler）。✅

**3. Type consistency：**
- `BillingCycle` / `BILLING_CYCLES` 在 Task 1 定義，Task 4 import 使用，命名一致。
- `cycleOverrides: Record<string, BillingCycle>`、`draftCycle: BillingCycle | null`、`editingId: string | null` 前後一致。
- `useNotification().showSuccess(title, subtitle)` 與既有 hook 簽名一致。
- `applications` 在 Task 3 為 `mockApplications`、Task 4 改為 `useMemo` 合併版，後續所有引用（`filtered`、`editingApp`）皆讀 `applications`，一致。
- `SERVICE_META` / `SERVICE_QUERY_FIELDS` / `QUERY_FIELD_META` 取用方式與 `src/types/autopass.ts` 既有定義相符。

無發現缺口。

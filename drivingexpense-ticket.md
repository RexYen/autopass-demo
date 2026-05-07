# 通行費自動繳後台 Prototype 實作文件

> 對應 PRD：[駕駛中心] v8.x 會籍方案服務擴充 S1（Notion `349aeda402618086b0f5fc7a2815386e`）

## 1. Demo 範圍

本次 prototype 聚焦在 **PRD 第四章：自動繳管理後台功能**（4.1 – 4.6），用戶端流程（第二章）暫不實作。

| 章節 | 是否實作 | 備註 |
| --- | --- | --- |
| 4.1 查繳待辦清單 | ✅ | 卡片列表，依服務類型分 Tab |
| 4.2 Ticket 狀態機 | ✅ | 列表頁就地完成主要狀態流轉 |
| 4.3 備註功能 | ✅ | ⋮ 選單觸發（demo 為 toast） |
| 4.4 一鍵向用戶請款 | ✅ | 嵌在「回填查詢結果」Modal 裡，同步回傳結果 |
| 4.5 訂單歷程紀錄 | ✅ | 詳情頁列出多筆 invoice_order |
| 4.6 自動發信 | ✅ | 詳情頁顯示寄送紀錄 timeline |
| 4.7 對帳匯出 | 🟡 預留殼 | 空頁面、disabled 匯出按鈕 |

> Demo 中所有狀態切換都會以 `notifications` toast 模擬發信／請款結果，不接真後端。

## 2. 資訊架構（Sitemap）

```
通行費自動繳
├── 🎫 查繳任務        /autopass-tickets      ← 預設入口（非終結態）
│   └── 任務詳情      /autopass-tickets/:id
├── 📋 歷史任務        /autopass-history       ← 終結態（paid/no-fee/counter-required/unable-to-close）
└── 📤 對帳匯出       /autopass-export
```

實際以 `currentView` state 切換（沿用 `App.tsx` 模式）。Dashboard 已移除，預設 view 為查繳任務。

## 3. 工單流程概念

### 3.1 線上 vs 線下兩層

| 線上（系統做的事） | 線下（營運人員做的事） |
| --- | --- |
| 排程建票、寄信、同步請款 API、收 webhook | 拿票上資料到第三方平台查、回填查詢結果、線下代繳到主管機關後回填 |

設計上「**列表頁卡片的主 CTA**」就是觸發線下→線上回填的進入點，例如「回填查詢結果」、「確認已代繳」。詳情頁退為「看歷程／處理少數編輯動作」的角色。

### 3.2 狀態機

```
[pending-query] ──線下查 → 點「回填查詢結果」開 Modal──┐
                                                  ↓
   ┌─[1] 無需繳費 ──→ [no-fee] (終結)
   ├─[2] 需臨櫃繳費(整單) ──→ [counter-required] (終結)
   ├─[3] 查詢失敗 ──→ [query-failed]
   │     └ 系統自動寄信「請更新資料」
   │     └ 用戶更新 → 系統自動偵測 → 票自動回 [pending-query]（非終結）
   │
   ├─[4] 查到金額 ──→ Modal 填金額 ──→ 系統同步請款
   │     ├ 成功 → [invoice-success]
   │     │       └ 營運人員線下代繳 → 點「確認已代繳」 → [paid] (終結)
   │     └ 失敗 → [invoice-failed]
   │             └ 系統自動寄信「請更新付款方式」
   │             └ 用戶更新卡 → 後台人工點「重試請款」 → 同步請款 → 回到分支
   │
   └─[5] 查到 + 部分臨櫃 ──→ Modal 填(線上, 臨櫃) ──→ 同步請款線上部分
         ├ 成功 → [invoice-success]（含 counterAmount）
         │       └ 系統通知用戶「線上 X 已繳，臨櫃 Y 自繳」
         │       └ 確認已代繳線上部分 → [paid] (終結，臨櫃部分不追蹤)
         └ 失敗 → [invoice-failed]（同上路徑）
```

**關鍵點：**

- **同步請款**：請款 API 是同步回傳，沒有 `invoicing` 中介態，成功直接 `invoice-success`、失敗直接 `invoice-failed`。
- **`invoice-success` 不是 buffer**：表示「已向用戶請到款項，但營運人員還沒幫用戶代繳出去」，是個明確的人介入點。
- **`query-failed` 不是終結**：用戶更新資料後系統會自動把票推回 `pending-query`。
- **混合狀態（5）**：線上部分繳完即視為這張票結案，臨櫃部分由用戶自行處理，後台不再追蹤。
- **「標記為無法結單」**：query-failed / invoice-failed 的 ⋮ 選單，點下去直接設為 `unable-to-close` 終結，立刻移到歷史。
- **「改臨櫃處理」**：query-failed / invoice-failed 的 ⋮ 選單，點下去直接設為 `counter-required` 終結，立刻移到歷史。

### 3.3 五種查詢結果（pending-query → 回填 Modal）

| 結果 | 後續 status | 系統動作 | 後續操作 |
| --- | --- | --- | --- |
| 無需繳費 | `no-fee` | — | 終結 |
| 需臨櫃繳費（整單） | `counter-required` | 寄信引導臨櫃 | 終結 |
| 查詢失敗 | `query-failed` | 寄信「請更新資料」 | 等用戶更新 → 自動回待查詢 |
| 查到待繳費用 | `invoice-success`（成功）/ `invoice-failed`（失敗） | 同步請款 | 成功 → 線下代繳 → 確認；失敗 → 寄信 + 等重試 |
| 查到 + 部分臨櫃 | 同上，但 ticket 多 `counterAmount` 欄位 | 同上 + 通知用戶臨櫃自繳 | 同上 |

## 4. 頁面內容

### 4.1 Tickets 列表（`AutopassTickets.tsx`）

**核心設計目標：列表頁完成主要操作，詳情頁只做歷程查看與深度編輯。**

#### 結構

- **服務 Tabs（5 個）**：ETC 通行費 / 汽燃費 / 汽燃費逾期罰緩 / 交通罰緩 / 違反強制險罰緩。每個 tab 計數即時顯示。
- **搜尋**：車牌、用戶名、Ticket ID、身分證／統編。
- **狀態篩選**：依 mode（current / history）動態提供可選狀態。
- **卡片網格**：`SimpleGrid` 響應式（base 1 / md 2 / xl 3 欄），每頁 6 張。

#### 卡片資訊

| 區塊 | 欄位 |
| --- | --- |
| 上半（flex 主體） | 服務類型、狀態 Badge、用戶、（依 `SERVICE_QUERY_FIELDS` 動態）車牌／身分證／出生／車種、查繳平台外連 |
| 下半（固定釘底） | 建立時間、最後更新、主 CTA + ⋮ 選單 |

> Card 結構刻意把時間戳 + CTA 放 flex box 外，避免不同 tab 欄位數量造成 CTA 上方間距不一致（先前 fix）。

#### 主 CTA + ⋮ 選單對照表

| Status | 主 CTA | 主 CTA 行為 | ⋮ 選單（依狀態） | ⋮ 選單（通用尾巴） |
| --- | --- | --- | --- | --- |
| `pending-query` | 回填查詢結果 | 開 Modal（5 選 1） | — | 加備註 / 查看詳情 / 複製 ID |
| `query-failed` | 補寄通知信 | 開確認 Modal → 確認後寄信 | 強制改為待查詢 / 修改車籍資料 / 標記為無法結單（開確認 Modal → 確認後 `unable-to-close`，移到 history） | 加備註 / 查看詳情 / 複製 ID |
| `invoice-failed` | 重試請款 | 開確認 Modal（顯示金額／上次失敗原因）→ 確認後模擬同步請款成功 → `invoice-success` | 補寄付款通知信 / 標記為無法結單（開確認 Modal → 確認後 `unable-to-close`，移到 history） | 加備註 / 查看詳情 / 複製 ID |
| `invoice-success` | 確認已代繳 | 開確認 Modal（顯示金額／混合說明）→ 確認後 `paid` 並移到歷史 | — | 加備註 / 查看詳情 / 複製 ID |
| 終結態（paid / no-fee / counter-required / unable-to-close） | 查看詳情 | 進詳情頁 | — | 加備註 / 複製 ID |

> 終結態因為沒有業務動作，主 CTA 退回為「查看詳情」維持版面一致。

#### 「回填查詢結果」Modal

`pending-query` 卡片主 CTA 觸發。內容：
- 票上摘要（Ticket ID、服務、用戶、車牌）
- 線下查繳平台連結（`platformUrl`，外連）
- Radio 5 選 1：無需繳費 / 整單臨櫃 / 查詢失敗 / 查到金額 / 查到+部分臨櫃
- 條件式金額輸入：
  - 「查到金額」→ 1 個 `NumberInput`（線上可繳）
  - 「查到+部分臨櫃」→ 2 個 `NumberInput`（線上可繳 + 臨櫃須繳）
- 提交後即時更新對應卡片的 `status` / `amount` / `counterAmount`，並 toast 模擬請款結果

#### 「確認已代繳」Modal

`invoice-success` 卡片主 CTA 觸發。為避免誤點直接結案，加一層確認：
- 票上摘要（Ticket ID、服務、用戶）
- 強調代繳平台（`serviceMeta.platform`）
- 線上代繳金額；混合狀態並列顯示臨櫃部分（用戶自繳）並補充說明「混合單僅就線上部分結案，臨櫃部分由用戶自行處理」
- 確認後 → `paid`，toast 提示已結案；取消則保持 `invoice-success`

#### 「補寄通知信」Modal

`query-failed` 卡片主 CTA 觸發。系統第一封信已自動寄出，這是補發：
- 票上摘要 + 文案說明（「將再次寄送『請更新車籍資料』通知信」）
- 顯示上次寄送紀錄（從 `emailLogs[0]` 拉，含主旨 / 寄送時間 / 寄送結果）
- 確認後 toast 提示「已補寄通知信」；不變更 ticket status

#### 「重試請款」Modal

`invoice-failed` 卡片主 CTA 觸發。重試前展示金額與失敗背景：
- 票上摘要 + 文案說明（「將重新發起同步請款，當下回傳結果」）
- 請款金額（`amount`）
- 上次失敗原因（從最近一筆 failed `invoiceOrder.failReason` 拉，紅字強調）
- 確認後模擬同步請款成功 → `invoice-success`

#### 「標記為無法結單」Modal

`query-failed` / `invoice-failed` 卡片 ⋮ 選單觸發。屬於不可逆的終結動作，要求二次確認：
- 票上摘要（紅色標題強調危險動作）
- 紅底警示框列出三點檢核事項（多次重試、評估其他結案方式、不再進入週期）
- 顯示目前狀態 Badge
- 確認後 → `unable-to-close`（終結態），移到歷史任務；toast 紅色提示

#### Demo 用本地狀態

`AutopassTickets` 內部維持 `statusOverrides: Record<id, Partial<Ticket>>`，所有提交動作（Modal、確認已代繳、重試請款、改臨櫃、標記無法結單）都寫進這個 map，套用在從 mock 衍生的 `tickets` 上。沒有後端，重整即還原。

#### 狀態 tag 配色（沿用 STATUS_META）

| 狀態 | 色 | 業務語意 |
| --- | --- | --- |
| 待查詢 | 灰 `#495057` | 等線下去查 |
| 不需繳費 / 需臨櫃繳費 | 藍 `#1971c2` | 查完無金額 / 引導臨櫃 |
| 請款中 | 黃 `#b08000` | 同步模式下罕見 |
| 請款成功 | 綠 `#0b7c4d` | 已向用戶收款，等線下代繳 |
| 繳款成功 | 綠 `#0b7c4d` | 終結 |
| 查詢失敗 / 請款失敗 | 紅 `#c92a2a` | 例外處理 |
| 無法結單 | 紫 `#5f3dc4` | 人工放棄結案 |

### 4.2 Ticket 詳情（`AutopassTicketDetail.tsx`）

**新角色**：歷程查看與深度編輯（多筆 invoice_orders、emailLogs、notes、修改車籍）。狀態流轉以列表頁為主，詳情頁保留覆寫狀態的逃生口。

兩欄 layout：
- **左 8/12**：Title block（含 Stepper）/ failReason banner / 金額卡 / 下一步動作 / 歷史紀錄 Tabs（訂單歷程 · 備註 · 自動發信）
- **右 4/12 sticky**：Properties Sidebar（含停留時間 aging）

#### 流程訊號（Phase C）

| 訊號 | 位置 | 觸發條件 | 說明 |
| --- | --- | --- | --- |
| **生命週期 Stepper** | Title block 底 | 一律顯示 | 四階段「查詢 → 請款 → 代繳 → 結案」。當前藍色 dot、已完成綠色勾、失敗紅色 X、未到灰色、跳過虛線—（如 no-fee 直接 1→4）。狀態映射見 `getStepStatuses` |
| **failReason banner** | Title block 後（Alert）| `query-failed` / `invoice-failed` | invoice-failed 從最近一筆 failed `invoiceOrder.failReason` 拉；query-failed 從最新一筆 `notes[0].content` 拉；缺資料時顯示 fallback 文案 |
| **金額卡** | failReason 後 | `ticket.amount !== null` | 露出線上可繳金額；`counterAmount` > 0 時並排顯示「臨櫃須繳金額（用戶自繳）」 |
| **Aging** | Sidebar 狀態下方 | 一律顯示 | 依 `updatedAt` 對 `DEMO_NOW`（demo 鎖在 2026-05-07 12:00）計算停留時間。≥ 3 天變紅；其他依 hours/days/分鐘自適配 |

#### 動態顯示欄位

依服務類型動態顯示欄位（對照 `SERVICE_QUERY_FIELDS`）：

| 服務項目 | 身分證／統編 | 出生日期 | 車牌 | 車種 |
| --- | :---: | :---: | :---: | :---: |
| 汽燃費（個人） | ✓ | | ✓ | |
| 汽燃費（法人） | ✓ | | ✓ | |
| 汽燃費逾期罰緩 | ✓ | | ✓ | |
| 交通罰緩（個人） | ✓ | ✓ | | |
| 交通罰緩（法人） | ✓ | | ✓ | ✓ |
| 違反強制險罰緩 | | | ✓ | ✓ |
| ETC 通行費 | ✓ | | ✓ | |

身分證號 label 個人顯示「身分證字號」、法人顯示「法人統一編號」；出生日期、身分證號均隱碼顯示，提供 Copy ActionIcon 複製完整值。

### 4.3 對帳匯出（`AutopassExport.tsx`）

空殼頁，文案「對帳匯出功能規劃中」+ disabled 的 `匯出 CSV` 按鈕。

## 5. 資料模型（mock）

詳細型別在 `src/types/autopass.ts`，mock 資料在 `src/data/autopassMock.ts`。核心結構：

```ts
Ticket {
  id, userId, userName, plateNumber,
  serviceType, cycle,
  amount: number | null,            // 線上可請款金額
  counterAmount?: number | null,    // 臨櫃須繳金額（混合狀態才有值）
  status: TicketStatus,
  createdAt, updatedAt,
  driverInfo: UserDriverInfo,
  invoiceOrders: InvoiceOrder[],
  notes: TicketNote[],
  emailLogs: EmailLog[],
}
```

### 5.1 狀態類型（`TicketStatus`）

| Status | 中文 | Group | 是否終結 |
| --- | --- | --- | --- |
| `pending-query` | 待查詢 | 待查 | ✗ |
| `no-fee` | 不需繳費 | 查詢 | ✓ |
| `counter-required` | 需臨櫃繳費 | 查詢 | ✓ |
| `query-failed` | 查詢失敗 | 例外 | ✗（用戶更新會自動回 pending-query） |
| `invoicing` | 請款中 | 請款 | ✗（同步請款下罕見） |
| `invoice-success` | 請款成功 | 請款 | ✗（等線下代繳） |
| `invoice-failed` | 請款失敗 | 例外 | ✗ |
| `paid` | 繳款成功 | 繳款 | ✓ |
| `unable-to-close` | 無法結單 | 例外 | ✓ |

### 5.2 Mock 涵蓋

每個服務 tab 都備有四個非終結狀態示意（待查詢 / 請款失敗 / 請款成功 / 查詢失敗）；汽燃費、交通罰緩、ETC 三個 tab 額外有「法人」票各一張。混合狀態（含 `counterAmount`）目前在汽燃費逾期罰緩、交通罰緩 tab 各有一張。

## 6. 不在本次範圍

- 用戶端啟用流程（PRD 第二章）
- 真正的後端 API、權限管理、登入
- 對帳匯出實作邏輯
- 多車牌切換 UI（PRD 已說 S1 不開放）
- 訂閱權益失效時的自動繳停用流程（PRD 第五章）
- Modal「模擬扣款失敗」開關（demo 目前固定走成功路徑）
- 列表卡片上的流程訊號（stepper / failReason / aging）— 已收斂在詳情頁，列表卡片暫不重複

## 7. 後續可改點 / TODO

- [ ] 列表頁與詳情頁狀態同步（目前 list 用 `statusOverrides`、detail 用自己的 `useState`，互不可見）
- [ ] Modal 加「模擬扣款失敗」開關，讓 demo 可走 invoice-failed 分支
- [ ] 「修改車籍資料」、「加備註」做成真表單而非 toast
- [ ] 4.7 對帳匯出規格確定後接上
- [ ] 用戶端 UI（PRD 第二章）
- [ ] `DEMO_NOW` 釘在 2026-05-07，未來接真資料時改回 `new Date()`

## 8. 開發指令

```bash
npm install
npm run dev      # http://localhost:5173 或 5174
npm run lint
npm run build
```

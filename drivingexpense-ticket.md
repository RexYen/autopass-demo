# 通行費自動繳後台 Prototype 實作文件

> 對應 PRD：[駕駛中心] v8.x 會籍方案服務擴充 S1（Notion `349aeda402618086b0f5fc7a2815386e`）

## 1. Demo 範圍

本次 prototype 聚焦在 **PRD 第四章：自動繳管理後台功能**（4.1 – 4.6），用戶端流程（第二章）暫不實作。

| 章節 | 是否實作 | 備註 |
| --- | --- | --- |
| 4.1 查繳待辦清單 | ✅ | 卡片列表，依服務類型分 Tab |
| 4.2 Ticket 狀態機 | ✅ | 列表頁就地完成主要狀態流轉 |
| 4.3 備註功能 | ✅ | 詳情頁 Activity 區內的留言框 |
| 4.4 一鍵向用戶請款 | ✅ | 嵌在「回填查詢結果」Modal 的第二步，操作員可即時模擬成功 / 失敗 |
| 4.5 訂單歷程紀錄 | ✅ | 收進詳情頁 Activity 時間軸 |
| 4.6 自動發信 | ✅ | 收進詳情頁 Activity 時間軸 |
| 4.7 對帳匯出 | ❌ 未實作 | 尚無頁面與路由，規格確定後再做 |

> Demo 中所有狀態切換都會以 `notifications` toast 模擬發信／請款結果，不接真後端。

## 2. 資訊架構（Sitemap）

```
通行費自動繳
├── 🎫 查繳任務        /autopass/tickets      ← 預設入口（非終結態）
│       └─（任務詳情：右側 Drawer，無獨立 URL）
├── 📋 歷史任務        /autopass/history       ← 終結態（paid / no-fee / query-failed / invoice-failed）
├── 📝 通行費申請單     /autopass/drivingexpense-applications   ← 自動繳申請清單 + 可編輯查繳週期
├── 📤 對帳匯出       /autopass/export        ← ⚠️ 規劃中，尚未實作（無頁面、無路由）
└── 🧪 狀態 Preview   /preview                ← 前端參考用，**不掛 nav**，靠 URL 進入
```

實際以 `currentView` state 切換。任務詳情為 Drawer，無深度連結。

## 3. 工單流程概念

### 3.1 線上 vs 線下兩層

| 線上（系統做的事） | 線下（營運人員做的事） |
| --- | --- |
| 排程建票、寄信、同步請款 API、收 webhook | 拿票上資料到第三方平台查、回填查詢結果、線下代繳到主管機關後回填 |

設計上「**列表頁卡片的主 CTA**」就是觸發線下→線上回填的進入點。除了 `pending-query` 的「回填查詢結果」與 `invoice-success` 的「確認已代繳」之外，其餘狀態都直接落入歷史任務，沒有列表頁可操作的 CTA。詳情頁定位為「看歷程／加備註」。

### 3.2 狀態機

```
[pending-query] ──線下查 → 點「回填查詢結果」開 Modal──┐
                                                  ↓
   ┌─[1] 無需繳費（含整單臨櫃）──→ [no-fee] (終結)
   │     └ outcome: 'no-fee' 或 'counter-only'
   │     └ counter-only 會寄信引導用戶臨櫃辦理
   │
   ├─[2] 查詢失敗（選 reason）──→ [query-failed] (終結)
   │     └ queryFailureReason: 'data-error' 或 'etag-bound'（後者僅 ETC）
   │     └ 直接進歷史任務；若用戶之後更新資料，由系統下一週期重新產生新 ticket
   │
   └─[3] 查到金額 ──→ Modal 第二步：填金額 + 模擬請款 ──→ 顯示結果
         ├ 成功 → [invoice-success]
         │       └ outcome: 'online-full' 或 'online-mixed'
         │       └ 「請款成功」不自動寄信
         │       └ 營運人員線下代繳 → 點「確認已代繳」 → [paid] (終結)
         │             └ 此時系統才寄出「繳費完成通知信」
         └ 失敗 → [invoice-failed] (終結)
                 └ 操作員勾「幾天後重新查詢」→ X 天後系統自動產生新的 pending-query ticket
                 └ 或勾「不重新嘗試」→ 直接結案，不再追蹤
```

**關鍵點：**

- **`status` 與 `outcome` 分離**：status 是粗粒度狀態機，outcome 是回填查詢結果時的細部結果（兩種「無需繳費」、兩種「查到待繳」），詳情頁靠 outcome 標註細部語意。
- **同步請款**：請款 API 同步回傳，沒有 `invoicing` 中介態。Demo 模式下「請款結果」由 Modal 第二步的 SegmentedControl 切換，方便 UI 走兩條路徑。
- **`invoice-success` 不是 buffer**：表示「已向用戶收到款項，但營運人員還沒幫用戶代繳出去」，是個明確的人介入點。請款成功**不寄信給用戶**，避免使用者誤以為已繳完；要等營運人員「確認已代繳」進入 `paid` 才寄。
- **`query-failed` 是終結**：直接收進歷史任務。若用戶後續更新資料，由系統下一週期重新產生新 ticket（業務層處理，不在本 demo state machine 內）。
- **`invoice-failed` 是終結**：原 ticket 直接結案；若操作員選擇「X 天後重新查詢」，系統會在指定天數後產生**新**的 `pending-query` ticket（不在原 ticket 上重試）。Demo 僅以 toast 表示排程。
- **混合單（online-mixed）**：線上部分繳完即視為這張票結案，臨櫃部分由用戶自行處理，後台不再追蹤金額（不存 `counterAmount`）。

### 3.3 查詢結果分支（pending-query → 回填 Modal）

回填 Modal 的選擇路徑：

| Modal 選擇 | status | outcome / reason | 系統動作 | 後續操作 |
| --- | --- | --- | --- | --- |
| 無需繳費 → 無應繳費用 | `no-fee` | outcome `no-fee` | — | 終結 |
| 無需繳費 → 整單需臨櫃辦理 | `no-fee` | outcome `counter-only` | 寄信引導臨櫃 | 終結 |
| 查詢失敗 → 資料錯誤 | `query-failed` | reason `data-error` | — | 終結（等下一週期） |
| 查詢失敗 → eTag 已綁定（僅 ETC） | `query-failed` | reason `etag-bound` | — | 終結 |
| 查到待繳 → 全額可線上代繳（請款成功） | `invoice-success` | outcome `online-full` | 同步請款成功 | 線下代繳 → 確認已代繳 |
| 查到待繳 → 全額可線上代繳（請款失敗 + 重試）| `invoice-failed` | outcome `online-full` | 同步請款失敗、push 失敗 invoice | 終結；X 天後排程新 ticket |
| 查到待繳 → 全額可線上代繳（請款失敗 + 不重試）| `invoice-failed` | outcome `online-full` | 同上 | 終結，不再追蹤 |
| 查到待繳 → 部分需臨櫃繳費（同上三組）| `invoice-success` / `invoice-failed` | outcome `online-mixed` | 同步請款（僅線上部分）| 同上 |

兩種「查到待繳」資料層完全相同（`amount: X`），差別只在 `outcome` 與 toast 文案。

## 4. 頁面內容

### 4.1 Tickets 列表（`AutopassTickets.tsx`）

**核心設計目標：列表頁完成主要操作，詳情頁專注於歷程查看與留言。**

#### 結構

> 卡片底部 CTA 區由左至右為：**主 CTA（依狀態）｜ 查看詳情 icon button（👁，非終結態才顯示）｜ ⋮ 選單**。終結態的主 CTA 本來就是「查看詳情」，不再重複顯示獨立 icon。

- **服務 Tabs（4 個）**：ETC 通行費 / 汽燃費 / 汽燃費逾期罰緩 / 違反強制險罰緩。每個 tab 計數即時顯示。
- **搜尋**：
  - 查繳任務頁（current）：單一搜尋框，命中 Email + 該 tab 對應的查詢欄位（車牌、身分證／統編、出生年月日、車種）；Ticket ID 仍可搜尋但不寫在 placeholder 提示中。
  - 歷史任務頁（history）：搜尋欄拆成獨立輸入：**Email**（永遠顯示）+ 依當前 tab 動態出現 **車牌 / 身分證／統編 / 出生年月日**（TextInput）與 **車種**（Select，含汽車／機車／大型重型機車／拖車）。各欄位之間是 AND；切 tab 時隱藏欄位的值會被忽略但保留在 state 中。
- **狀態篩選**：依 mode（current / history）動態提供可選狀態。
- **卡片網格**：`SimpleGrid` 響應式（base 1 / md 2 / xl 3 欄），每頁 6 張。

#### 卡片資訊

| 區塊 | 欄位 |
| --- | --- |
| 頂列（兩端對齊） | 左：服務類型 / 右：狀態 Badge（放大版，`size=lg`、`radius=md`、字級 13） |
| 上半（flex 主體） | Email、（依 `SERVICE_QUERY_FIELDS` 動態）車牌／身分證／出生／車種、查繳平台外連 |
| 下半（固定釘底） | 建立時間、最後更新、主 CTA + ⋮ 選單 |

> 原本的「狀態」CardRow 已移除，Badge 改貼齊卡片右上角，視覺上更搶眼也省一列高度。

#### 主 CTA + ⋮ 選單對照表

| Status | 主 CTA | 主 CTA 行為 | ⋮ 選單 |
| --- | --- | --- | --- |
| `pending-query` | 回填查詢結果 | 開兩步 Modal（4 選 1 → 若 has-fee 進結果步驟） | 加備註 |
| `invoice-success` | 確認已代繳 | 開簡化 Modal（金額提示 + 確認）→ `paid` 並寄出繳費完成通知信 | 加備註 |
| 終結態（paid / no-fee / query-failed / invoice-failed） | 查看詳情 | 開詳情 Drawer | 加備註 |

> Note：早期版本的「補寄通知信」「重新發起請款」「補寄付款通知信」「標記為無法結單」與「複製 Ticket ID」menu item 已隨狀態機收斂全數移除，現存程式碼中沒有相關 modal / handler。

#### 「回填查詢結果」Modal

`pending-query` 卡片主 CTA 觸發。兩步驟流程：

**Step 1（input）**：
- 票上摘要（Ticket ID、服務、Email、車牌）
- 線下查繳平台連結（`platformUrl`，外連）
- Radio 三層：
  - 無需繳費 → 無應繳費用 / 需臨櫃繳費（對應 outcome `counter-only`）
  - 查詢失敗 → **失敗原因**：資料錯誤 / eTag 已綁定（後者僅 `etc-toll`）
  - 查到待繳費用 → 全額可線上代繳 / 部分需臨櫃繳費（NumberInput 填線上金額）
- 非 `has-fee` 路徑：按「送出」直接 submit + 關閉 Modal。
- `has-fee` 路徑：按「送出請款」進入 Step 2，**不**立即 submit。

**Step 2（result，僅 has-fee）**：
- 標題改為「請款結果」
- 右上 `SegmentedControl`：**成功 / 失敗**（demo 模擬請款回傳結果）
- 成功面板（綠）：金額摘要 + remit hint → 確認結案後 `status: invoice-success`
- 失敗面板（紅）：失敗原因（demo 固定「信用卡授權失敗」）+ Radio「**幾天後重新查詢**（預設，NumberInput X 天，預設 7）/ **不重新嘗試**」→ 確認結案後 `status: invoice-failed`
  - 失敗時會 push 一筆 `InvoiceOrder { status: 'failed', failReason }` 進 `invoiceOverrides`
  - 「重新嘗試」勾選時 toast 顯示「已排程 X 天後重新查詢，將於 yyyy/MM/dd 自動產生新 ticket」；demo 不真的建票
  - 「不重新嘗試」直接結案 toast
- 底部按鈕：左下「返回修改」（退回 Step 1）/ 右下「取消」「確認結案」

#### 「確認已代繳」Modal

`invoice-success` 卡片主 CTA 觸發。為避免誤點直接結案加一層確認：

- 票上摘要（Ticket ID、服務、Email）
- 強調代繳平台（`serviceMeta.platform`）
- 線上代繳金額；混合單顯示「部分需臨櫃繳費」Badge + 補充說明
- 確認後：
  - `status` 改為 `paid`
  - 寫入 `paid-v1` 的 EmailLog 到 `emailOverrides`（這裡才是寄信的時間點，請款成功時不寄）
  - toast 顯示已結案、已寄通知信

> 早期版本有繳費證明上傳模組（多檔 FileButton + 縮圖 grid + demo SVG 生成器），已隨繳費證明模組整組移除，現在只是純確認對話框。

#### Demo 用本地狀態

`AutopassTickets` 內部維持以下 override map，所有提交動作都寫進對應的 map，套用在從 mock 衍生的 `tickets` 上：

| Override | 用途 |
| --- | --- |
| `statusOverrides` | 狀態 / 金額 / outcome / queryFailureReason 變化 |
| `noteOverrides` | 新增的備註 |
| `emailOverrides` | demo 中觸發的自動信件（目前只有確認代繳的 paid 信） |
| `invoiceOverrides` | 查詢結果失敗路徑 push 進去的新 InvoiceOrder（status: failed） |

沒有後端，重整即還原。

#### 狀態 tag 配色（沿用 STATUS_META）

| 狀態 | 色 | 業務語意 |
| --- | --- | --- |
| 待查詢 | 灰 `#495057` | 等線下去查 |
| 無需繳費 | 藍 `#1971c2` | 查完無金額 / 整單臨櫃辦理（差異看 outcome） |
| 請款成功 | 綠 `#0b7c4d` | 已向用戶收款，等線下代繳 |
| 繳款成功 | 綠 `#0b7c4d` | 終結 |
| 查詢失敗 / 請款失敗 | 紅 `#c92a2a` | 例外結案（直接進歷史） |

### 4.2 Ticket 詳情（`AutopassTicketDetail.tsx`）

**定位**：右側 Drawer，**只讀為主**——查 Activity 歷程 / 加備註。所有狀態流轉動作都收回列表頁卡片的主 CTA + Modal。

**Drawer 規格**：
- 寬度 720px，從右側展開
- 整個 Drawer body 為灰底（`#f8f9fa`），卡牌之外的留白也是統一灰色
- Header sticky：左側「✕ 關閉」、右側「{當前} / {總數} + 上一張 / 下一張」按鈕
- prev/next 在 `filtered`（當前篩選條件下的全集）內巡覽，跨頁時自動翻頁

**內容區塊（由上至下）：**

1. **Hero card**（單一 Paper，兩行階層）：
   - Row 1：服務名（h3）＋狀態 Badge ＋ 右上角 `ticket.id`（mono 字體 + 外連 icon，將來導向 ticket 對應外部頁面）
   - Row 2：Email · 車牌 · 身分證／統編 · 出生年月日 · 車種（依 `SERVICE_QUERY_FIELDS` 動態，monospace 用於需要對齊的數字欄位；無 copy button）

2. **Activity 區**：單一 Paper（`radius=12 / padding=20`），內部依序為：section header → comment composer → divider → timeline。不再使用 Tabs，也不再保留早期 Tabs.List 風格的 mini 標題列。

> 早期版本的「FlowStepper（查詢→請款→代繳→結案）」、「failReason banner（紅色 Alert）」、「繳費證明 Tab + lightbox」均已移除。金額不在 Hero 顯示，要看金額看 Activity 的 invoice 卡。

#### Activity 區（ClickUp 風格時間軸）

**版面結構**：

- **Section header**：`<IconActivity>` + 「Activity」標題，不附事件計數
- **Comment composer**：包在淡灰底（`#f8f9fa`）+ 細邊框 + 圓角的容器內，內部 `Textarea` 用 `variant="unstyled"`、autosize（minRows=2，maxRows=6），送出按鈕浮在 textarea 內右下角。送出後寫進 `noteOverrides`，刷新後消失（demo 限定）
- **Divider**（淡色）：composer 與 Timeline 之間
- **Timeline**：採 Mantine `Timeline`，由新到舊排列

每則事件的主要視覺只剩 **動作（粗體深色）+ 右側時間**；早期版本「actor／角色」（系統／客服／留言者）已移除，動作即標題。

**事件類型**：

| Kind | 來源 | 標題（動作） | 副標 / 內容 |
| --- | --- | --- | --- |
| `created` | `ticket.createdAt` | `建立工單` | 服務 · cycle |
| `query-result` | **合成事件**（status !== `pending-query` 才產生） | `回填查詢結果 - <選擇項>`（e.g. 全額線上代繳／部分需臨櫃繳費／無應繳費用／整單需臨櫃辦理／查詢失敗） | 查詢失敗顯示「原因：資料錯誤 / eTag 已綁定」；有金額顯示「線上金額 NT$ X,XXX」；無應繳費用無副標 |
| `invoice` | `invoiceOrders[]` | `請款成功` / `請款失敗` / `發起請款` | 訂單 ID（mono 藍字 + 外連 icon，連到 `serviceMeta.platformUrl`） |
| `note` | `notes[]` | `加備註` | 備註內容（灰底 block） |
| `email` | `emailLogs[]` | `寄送通知信` / `通知信寄送失敗` | subject · 模板 · 觸發狀態 |

**`query-result` 是合成事件**：mock 沒記錄回填的時戳，因此推導：取第一筆 invoice 或 email 的時戳，往前推 1 分鐘，讓「回填 → 寄信／請款」的時序合理。對 `query-failed` 票會額外帶 `queryFailureReason` 進 event，副標顯示具體原因。

**`invoice` 事件樣式**：早期是厚 Card（INV-id + 狀態 Badge + 金額大字 + 失敗原因）；現在簡化為與其他事件齊高的標題列 + 訂單 ID 外連副標，狀態語意已在標題詞區分（請款成功／失敗）。金額不再顯示在這裡。`ActivityEvent` 透過 `invoiceUrl` 欄位帶上 `SERVICE_META[serviceType].platformUrl`，之後接真正的訂單頁再換目標。

#### 動態顯示欄位（沿用 `SERVICE_QUERY_FIELDS`）

| 服務項目 | 身分證／統編 | 出生日期 | 車牌 | 車種 |
| --- | :---: | :---: | :---: | :---: |
| 汽燃費（個人 / 法人） | ✓ | | ✓ | |
| 汽燃費逾期罰緩 | ✓ | | ✓ | |
| 違反強制險罰緩 | | | ✓ | ✓ |
| ETC 通行費 | ✓ | | ✓ | |

身分證號 label 個人顯示「身分證字號」、法人顯示「法人統一編號」；出生日期 mask 顯示。

### 4.3 對帳匯出（規劃中，尚未實作）

PRD 4.7 的對帳匯出**目前尚未建立任何頁面或路由**：repo 中沒有 `AutopassExport.tsx`、`App.tsx` 沒有 `/autopass/export`、側邊導航也沒有入口。規格確定後再實作，屆時預計掛在 `/autopass/export`。

### 4.4 狀態 Preview（`TicketPreview.tsx`）

**定位**：給前端人員的設計參考頁。把 6 種 `TicketStatus` 各擺一張卡，CTA 點下去能打開對應的 Modal / Drawer，方便直接對照「哪種狀態卡片，點擊進去後會出現什麼對應內容」。**不掛在側邊導航，靠 URL 進入。**

#### 進入方式

| 環境 | URL |
| --- | --- |
| 本地 | `http://localhost:5173/preview`（或 Vite 顯示的實際 port） |
| Production | `https://autopass-demo.vercel.app/preview` |

路由定義在 `src/App.tsx`：

```tsx
<Route path="/preview" element={<TicketPreview />} />
```

#### 6 種 status × CTA 對應

每張卡片底部由左至右為 **主 CTA ｜ 👁 view-detail（非終結態才出現）｜ ⋮ menu**。

| Status | 卡片主 CTA | 點擊後 | 👁 icon | ⋮ → 備註 |
| --- | --- | --- | :---: | :---: |
| `pending-query` | 回填查詢結果 | 開兩步驟 `QueryResultModal`（4 選 1 → has-fee 進結果步驟） | 開 `AutopassTicketDetail` Drawer | 開 `AddNoteModal` |
| `no-fee` | 查看詳情（終結態） | 開 Drawer | — | 開 `AddNoteModal` |
| `query-failed` | 查看詳情（終結態） | 開 Drawer | — | 開 `AddNoteModal` |
| `invoice-success` | 確認已代繳 | 開 `ConfirmPaidModal` | 開 Drawer | 開 `AddNoteModal` |
| `invoice-failed` | 查看詳情（終結態） | 開 Drawer | — | 開 `AddNoteModal` |
| `paid` | 查看詳情（終結態） | 開 Drawer | — | 開 `AddNoteModal` |

> Modal / Drawer 的視覺與真實 `AutopassTickets` 完全一致，因為 import 的是同一個元件（`TicketCard`、`QueryResultModal`、`ConfirmPaidModal`、`AddNoteModal`、`AutopassTicketDetail`）。

#### 哪些互動是 Preview 專用

Preview 頁刻意不接 `statusOverrides` / `noteOverrides` 等本地狀態機，所以 **任何 submit 都不會真的改卡片**：

| 互動 | Preview 行為 | 真實頁面行為 |
| --- | --- | --- |
| `QueryResultModal` Submit（任一分支） | Modal 自帶的 step 流程照走（含 step 2 模擬成功/失敗），結束後關閉 Modal、不動卡片 | 寫入 `statusOverrides`、`invoiceOverrides`、`emailOverrides`，卡片狀態流轉 |
| `ConfirmPaidModal` 「確認已代繳」 | toast「Preview，未實際改動 ticket 狀態」+ 關閉 Modal | `status → paid` + 寫 paid-v1 EmailLog + toast |
| `AddNoteModal` 「新增備註」 | toast「已新增備註（Preview）」+ 關閉 Modal | 寫進 `noteOverrides`，Activity Timeline 多一筆 |
| Drawer 內 Activity 留言 | 同 `AddNoteModal`（共用 handler） | 同 `AddNoteModal` |

> 對「請款結果」step 2 的成功 / 失敗模擬：Modal 內部 state 會跑完整流程（顯示綠/紅面板、retry 選項），最後送出時 Preview 也只是 noop close。看 UI 走分支用的，不要期待結果回寫卡片。

#### Fixture 結構

所有 demo 卡的資料在 `src/components/TicketPreview.tsx` 內的 `SECTIONS: PreviewSection[]`，每個 entry 是 `{ status, ticket }`。`ticket` 透過 `makeTicket(overrides)` 產生，預設用同一組 `T-PREVIEW`／`preview@example.com`／`ABC-1234`／`A123456789`，再依需要 override。

#### 如何新增 / 調整 case

**新增一個 status fixture**（或新狀態 enum 上線後補卡片）：

1. 確認 `src/types/autopass.ts` 的 `TicketStatus` 有新的字串、`STATUS_META` 有對應 label / 配色，必要時更新 `TERMINAL_STATUSES`。
2. 在 `TicketPreview.tsx` 的 `SECTIONS` 加一筆：

```tsx
{
  status: '新狀態' as TicketStatus,
  ticket: makeTicket({
    id: 'T-PREVIEW-07',
    serviceType: 'etc-toll',
    status: '新狀態' as TicketStatus,
    // 視需要設 amount / outcome / queryFailureReason 等
  }),
},
```

3. 若該狀態的卡片需要新的主 CTA，更新 `TicketCard.tsx` 的 `buildCardActionConfig`（switch 加一個 case）。

**新增一個 Modal**（流程上多一個操作員介入點）：

1. 在 `src/components/TicketModals.tsx` 新增並 `export` 一個 `XxxModal` 元件，介面遵循 `{ ticket, opened, onClose, onSubmit }` 模式。
2. `TicketCard.tsx`：
   - `TicketCardCallbacks` 新增對應 callback，例如 `onOpenXxxModal: (id: string) => void`。
   - `buildCardActionConfig` 對應的 `case` 把主 CTA 指過去。
3. `AutopassTickets.tsx`：
   - 加 state（如 `xxxModalTicketId`）、open / close / submit handler，handler 寫進對應 override map。
   - render `<XxxModal ... />`。
4. `TicketPreview.tsx`：
   - 加 state（如 `xxxModalId`）、open callback、close + noop submit handler（toast 提示「Preview，未實際改動」即可）。
   - render `<XxxModal ... />`。

**只想換 demo 資料**（換 email / 車牌 / 法人 etc.）：直接改 `makeTicket(overrides)` 的 overrides 即可。

> 設計原則：Preview 頁不維護自己的卡片狀態機，所有元件都從 `AutopassTickets` 共用。維護的時候只要把新元件加到 `TicketCard` / `TicketModals` / `TicketPreview` 三處對應位置，視覺與真實頁面就會自動同步，不會漂移。

## 5. 資料模型（mock）

詳細型別在 `src/types/autopass.ts`，mock 資料在 `src/data/autopassMock.ts`。核心結構：

```ts
Ticket {
  id, userId, userEmail, plateNumber,
  serviceType, cycle,
  amount: number | null,                  // 線上可請款金額
  status: TicketStatus,
  outcome?: TicketOutcomeKind,            // 查詢結果的細部 outcome（不影響 status，只標註）
  queryFailureReason?: QueryFailureReason,// 查詢失敗的具體原因
  createdAt, updatedAt,
  driverInfo: UserDriverInfo,
  invoiceOrders: InvoiceOrder[],
  notes: TicketNote[],
  emailLogs: EmailLog[],
}
```

### 5.1 狀態（`TicketStatus`）

| Status | 中文 | Group | 是否終結 |
| --- | --- | --- | --- |
| `pending-query` | 待查詢 | 待查 | ✗ |
| `no-fee` | 無需繳費（含整單臨櫃，差異看 outcome）| 查詢 | ✓ |
| `query-failed` | 查詢失敗 | 例外 | ✓ |
| `invoice-success` | 請款成功 | 請款 | ✗（等線下代繳） |
| `invoice-failed` | 請款失敗 | 例外 | ✓ |
| `paid` | 繳款成功 | 繳款 | ✓ |

### 5.2 細部 outcome（`TicketOutcomeKind`）

| Outcome | 中文 | 對應 Status |
| --- | --- | --- |
| `no-fee` | 無應繳費用 | `no-fee` |
| `counter-only` | 整單需臨櫃辦理 | `no-fee` |
| `online-full` | 全額線上代繳 | `invoice-success` / `invoice-failed` / `paid` |
| `online-mixed` | 部分需臨櫃繳費 | `invoice-success` / `invoice-failed` / `paid` |

> outcome 只在詳情 Activity 的 `query-result` 事件中標註，不影響列表 Badge。

### 5.3 查詢失敗原因（`QueryFailureReason`）

| Reason | 中文 | 適用範圍 |
| --- | --- | --- |
| `data-error` | 資料錯誤 | 全部服務（共用） |
| `etag-bound` | eTag 已綁定 | 僅 `etc-toll` |

回填 Modal 在「查詢失敗」分支下要求選擇原因；`etag-bound` 只在 ticket 為 `etc-toll` 時才出現於選項清單。

### 5.4 Mock 涵蓋

每個服務 tab 都備有四個非終結狀態示意（待查詢 / 請款成功 / 請款失敗 / 查詢失敗）；汽燃費、ETC 兩個 tab 額外有「法人」票各一張（分別是 `fuel-fee-corporate` 與 `etc-toll`）。混合 outcome（`online-mixed`）目前 mock 無示意資料。歷史任務涵蓋 `paid` / `no-fee`（`no-fee`）/ `no-fee`（`counter-only`）/ `query-failed`（其中一張 ETC 用 `etag-bound`）/ `invoice-failed` 等示意。

## 6. 不在本次範圍

- 用戶端啟用流程（PRD 第二章）
- 真正的後端 API、權限管理、登入
- 對帳匯出實作邏輯
- 多車牌切換 UI（PRD 已說 S1 不開放）
- 訂閱權益失效時的自動繳停用流程（PRD 第五章）
- ticket.id 外連的目標頁面（連結結構先做好，目標頁稍後）
- 「重新查詢」排程實際建票（demo 僅 toast；正式環境由 backend cron 處理）

## 7. 後續可改點 / TODO

- [ ] 4.7 對帳匯出規格確定後實作（目前完全沒有頁面/路由）
- [ ] 用戶端 UI（PRD 第二章）
- [ ] Hero 右上 ticket.id 外連的對應頁面
- [ ] `invoice-failed` 重新查詢的排程資訊是否要記在 ticket 上（目前僅 toast）

## 8. 開發指令

```bash
npm install
npm run dev      # http://localhost:5173 或 5174
npm run lint
npm run build
```

## 9. 部署

部署於 Vercel：https://autopass-demo.vercel.app

`vercel.json` 設定：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> **rewrites 必要**：本專案使用 `BrowserRouter`，網址會是真實 path（如 `/autopass/tickets`）。沒有 catch-all rewrite 的話，refresh 帶 path 的網址會直接 404。靜態 asset（`/assets/*` 等）會在 rewrite 之前被命中，不受影響。

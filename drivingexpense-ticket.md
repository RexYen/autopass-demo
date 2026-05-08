# 通行費自動繳後台 Prototype 實作文件

> 對應 PRD：[駕駛中心] v8.x 會籍方案服務擴充 S1（Notion `349aeda402618086b0f5fc7a2815386e`）

## 1. Demo 範圍

本次 prototype 聚焦在 **PRD 第四章：自動繳管理後台功能**（4.1 – 4.6），用戶端流程（第二章）暫不實作。

| 章節 | 是否實作 | 備註 |
| --- | --- | --- |
| 4.1 查繳待辦清單 | ✅ | 卡片列表，依服務類型分 Tab |
| 4.2 Ticket 狀態機 | ✅ | 列表頁就地完成主要狀態流轉 |
| 4.3 備註功能 | ✅ | 詳情頁 Activity tab 內的留言框 |
| 4.4 一鍵向用戶請款 | ✅ | 嵌在「回填查詢結果」Modal 裡，同步回傳結果 |
| 4.5 訂單歷程紀錄 | ✅ | 收進詳情頁 Activity 時間軸（不再是獨立 tab） |
| 4.6 自動發信 | ✅ | 收進詳情頁 Activity 時間軸（不再是獨立 tab） |
| 4.7 對帳匯出 | 🟡 預留殼 | 空頁面、disabled 匯出按鈕 |

> Demo 中所有狀態切換都會以 `notifications` toast 模擬發信／請款結果，不接真後端。

## 2. 資訊架構（Sitemap）

```
通行費自動繳
├── 🎫 查繳任務        /autopass/tickets      ← 預設入口（非終結態）
│       └─（任務詳情：右側 Drawer，無獨立 URL）
├── 📋 歷史任務        /autopass/history       ← 終結態（paid/no-fee/unable-to-close）
└── 📤 對帳匯出       /autopass/export
```

實際以 `currentView` state 切換。任務詳情為 Drawer，無深度連結。

## 3. 工單流程概念

### 3.1 線上 vs 線下兩層

| 線上（系統做的事） | 線下（營運人員做的事） |
| --- | --- |
| 排程建票、寄信、同步請款 API、收 webhook | 拿票上資料到第三方平台查、回填查詢結果、線下代繳到主管機關後回填 |

設計上「**列表頁卡片的主 CTA**」就是觸發線下→線上回填的進入點，例如「回填查詢結果」、「確認已代繳」。詳情頁退為「看歷程／加備註」的角色。

### 3.2 狀態機

```
[pending-query] ──線下查 → 點「回填查詢結果」開 Modal──┐
                                                  ↓
   ┌─[1] 無需繳費（含整單臨櫃）──→ [no-fee] (終結)
   │     └ outcome: 'no-fee' 或 'counter-only'
   │     └ counter-only 會寄信引導用戶臨櫃辦理
   │
   ├─[2] 查詢失敗 ──→ [query-failed]
   │     └ 系統自動寄信「請更新資料」
   │     └ 用戶更新 → 系統自動偵測 → 票自動回 [pending-query]（非終結）
   │
   └─[3] 查到金額 ──→ Modal 填線上金額 ──→ 系統同步請款
         ├ 成功 → [invoice-success]
         │       └ outcome: 'online-full' 或 'online-mixed'
         │       └ 「請款成功」不自動寄信
         │       └ 營運人員線下代繳 → 點「確認已代繳」 → [paid] (終結)
         │             └ 此時系統才寄出「繳費完成通知信」
         └ 失敗 → [invoice-failed]
                 └ 系統自動寄信「請更新付款方式」
                 └ 後台人工點「重新發起請款」 → 新填金額 → 同步請款 → 回到分支
```

**關鍵點：**

- **`status` 與 `outcome` 分離**：status 是粗粒度狀態機，outcome 是回填查詢結果時的細部結果（兩種「無需繳費」、兩種「查到待繳」），詳情頁靠 outcome 標註細部語意。
- **同步請款**：請款 API 同步回傳，沒有 `invoicing` 中介態。成功直接 `invoice-success`、失敗直接 `invoice-failed`。
- **`invoice-success` 不是 buffer**：表示「已向用戶請到款項，但營運人員還沒幫用戶代繳出去」，是個明確的人介入點。請款成功**不寄信給用戶**，避免使用者誤以為已繳完；要等營運人員「確認已代繳」進入 `paid` 才寄。
- **`query-failed` 不是終結**：用戶更新資料後系統會自動把票推回 `pending-query`。
- **混合單（online-mixed）**：線上部分繳完即視為這張票結案，臨櫃部分由用戶自行處理，後台不再追蹤金額（不存 `counterAmount`）。
- **「重新發起請款」**：系統無法對同筆訂單 retry，每次點都是建立**一筆新請款**（新金額由營運人員填寫，舊的失敗訂單留在歷程中）。
- **「標記為無法結單」**：query-failed / invoice-failed 的 ⋮ 選單，點下去直接設為 `unable-to-close` 終結，立刻移到歷史。

### 3.3 四種查詢結果（pending-query → 回填 Modal）

回填 Modal 的選擇路徑：

| Modal 選擇 | status | outcome | 系統動作 | 後續操作 |
| --- | --- | --- | --- | --- |
| 無需繳費 → 無應繳費用 | `no-fee` | `no-fee` | — | 終結 |
| 無需繳費 → 整單需臨櫃辦理 | `no-fee` | `counter-only` | 寄信引導臨櫃 | 終結 |
| 查詢失敗 | `query-failed` | — | 寄信「請更新資料」 | 等用戶更新 → 自動回 pending-query |
| 查到待繳費用 → 全額可線上代繳 | `invoice-success` / `invoice-failed` | `online-full` | 同步請款 | 成功 → 線下代繳 → 確認；失敗 → 等重新發起 |
| 查到待繳費用 → 部分需臨櫃自繳 | `invoice-success` / `invoice-failed` | `online-mixed` | 同步請款（僅線上部分）+ 通知用戶臨櫃自繳 | 同上 |

兩種「查到待繳」資料層完全相同（`amount: X`），差別只在 `outcome` 與 toast 文案。

## 4. 頁面內容

### 4.1 Tickets 列表（`AutopassTickets.tsx`）

**核心設計目標：列表頁完成主要操作，詳情頁專注於歷程查看與留言。**

#### 結構

> 卡片底部 CTA 區由左至右為：**主 CTA（依狀態）｜ 查看詳情 icon button（👁，非終結態才顯示）｜ ⋮ 選單**。終結態的主 CTA 本來就是「查看詳情」，不再重複顯示獨立 icon。

- **服務 Tabs（5 個）**：ETC 通行費 / 汽燃費 / 汽燃費逾期罰緩 / 交通罰緩 / 違反強制險罰緩。每個 tab 計數即時顯示。
- **搜尋**：車牌、用戶名、Ticket ID、身分證／統編。
- **狀態篩選**：依 mode（current / history）動態提供可選狀態。
- **卡片網格**：`SimpleGrid` 響應式（base 1 / md 2 / xl 3 欄），每頁 6 張。

#### 卡片資訊

| 區塊 | 欄位 |
| --- | --- |
| 上半（flex 主體） | 服務類型、狀態 Badge、用戶、（依 `SERVICE_QUERY_FIELDS` 動態）車牌／身分證／出生／車種、查繳平台外連 |
| 下半（固定釘底） | 建立時間、最後更新、主 CTA + ⋮ 選單 |

#### 主 CTA + ⋮ 選單對照表

| Status | 主 CTA | 主 CTA 行為 | ⋮ 選單（依狀態） | ⋮ 選單（通用尾巴） |
| --- | --- | --- | --- | --- |
| `pending-query` | 回填查詢結果 | 開 Modal（4 選 1） | — | 加備註 / 複製 ID |
| `query-failed` | 補寄通知信 | 開確認 Modal → 確認後寄信 | 標記為無法結單（開確認 Modal → 確認後 `unable-to-close`，移到 history） | 加備註 / 複製 ID |
| `invoice-failed` | 重新發起請款 | 開 Modal（重填金額）→ 確認後建立新 invoice → `invoice-success` | 補寄付款通知信 / 標記為無法結單 | 加備註 / 複製 ID |
| `invoice-success` | 確認已代繳 | 開 Modal（金額提示 + 繳費證明上傳）→ 確認後 `paid` 並寄出繳費完成通知信 | — | 加備註 / 複製 ID |
| 終結態（paid / no-fee / unable-to-close） | 查看詳情 | 開詳情 Drawer | — | 加備註 / 複製 ID |

#### 「回填查詢結果」Modal

`pending-query` 卡片主 CTA 觸發。內容：
- 票上摘要（Ticket ID、服務、用戶、車牌）
- 線下查繳平台連結（`platformUrl`，外連）
- Radio 三層（外層 4 選 1，前兩項各有 2 個 sub-radio）：
  - 無需繳費 → 無應繳費用 / 整單需臨櫃辦理
  - 查詢失敗
  - 查到待繳費用 → 全額可線上代繳 / 部分需臨櫃自繳（NumberInput 填線上金額）
- 提交時同時寫入 `status` + `outcome` + `amount`，並 toast 模擬請款結果

#### 「確認已代繳」Modal

`invoice-success` 卡片主 CTA 觸發。為避免誤點直接結案，加一層確認，並要求上傳繳費證明：
- 票上摘要（Ticket ID、服務、用戶）
- 強調代繳平台（`serviceMeta.platform`）
- 線上代繳金額；混合單顯示「部分需臨櫃自繳」Badge + 補充說明（不再顯示臨櫃金額）
- **繳費證明截圖（必填，至少 1 張）**：`FileButton` 多選 `image/*`，3 欄 grid 顯示縮圖、檔名 chip、左上角刪除 ✕
- **「插入示意圖」按鈕（demo 限定）**：點一下動態生成 2 張帶本票資訊的 SVG 截圖（平台名、金額、單號、時間）；正式環境應拿掉
- 提交時：
  - 將 File 轉 data URI（demo），存入 `proofOverrides`
  - 寫入 `paid-v1` 的 EmailLog 到 `emailOverrides`（這裡才是寄信的時間點，請款成功時不寄）
  - status 改為 `paid`
  - toast 顯示已結案、已寄通知信、已存 N 張證明

#### 「補寄通知信」Modal

`query-failed` 卡片主 CTA 觸發。系統第一封信已自動寄出，這是補發：
- 票上摘要 + 文案說明
- 顯示上次寄送紀錄（從 `emailLogs[0]` 拉）
- 確認後 toast；不變更 ticket status

#### 「重新發起請款」Modal

`invoice-failed` 卡片主 CTA 觸發。**系統無法對同筆訂單重試**，需重新填寫金額並建立一筆新請款訂單：
- 票上摘要 + 文案說明（「系統無法對同筆訂單重試，將以新填寫的金額向用戶建立一筆新請款」）
- `NumberInput` 預設帶入 `ticket.amount`，營運人員可改寫
- 確認後：
  - 將新金額寫入 `ticket.amount`、status 改為 `invoice-success`
  - 在 `invoiceOverrides` 推一筆新的 `InvoiceOrder`（status: success、note: '重新發起請款'）
  - 舊的 failed invoice 保留在歷程中，Activity 會看到「請款失敗 → 新請款成功」時序

#### 「標記為無法結單」Modal

`query-failed` / `invoice-failed` 卡片 ⋮ 選單觸發。屬於不可逆的終結動作，要求二次確認：
- 票上摘要（紅色標題強調危險動作）
- 紅底警示框列出三點檢核事項
- 顯示目前狀態 Badge
- 確認後 → `unable-to-close`（終結態），移到歷史任務

#### Demo 用本地狀態

`AutopassTickets` 內部維持以下 override map，所有提交動作都寫進對應的 map，套用在從 mock 衍生的 `tickets` 上：

| Override | 用途 |
| --- | --- |
| `statusOverrides` | 狀態 / 金額 / outcome 變化 |
| `noteOverrides` | 新增的備註 |
| `proofOverrides` | 上傳的繳費證明（data URI） |
| `emailOverrides` | demo 中觸發的自動信件（目前只有確認代繳的 paid 信） |
| `invoiceOverrides` | 重新發起請款新建的 InvoiceOrder |

沒有後端，重整即還原。

#### 狀態 tag 配色（沿用 STATUS_META）

| 狀態 | 色 | 業務語意 |
| --- | --- | --- |
| 待查詢 | 灰 `#495057` | 等線下去查 |
| 無需繳費 | 藍 `#1971c2` | 查完無金額 / 整單臨櫃辦理（差異看 outcome） |
| 請款成功 | 綠 `#0b7c4d` | 已向用戶收款，等線下代繳 |
| 繳款成功 | 綠 `#0b7c4d` | 終結 |
| 查詢失敗 / 請款失敗 | 紅 `#c92a2a` | 例外處理 |
| 無法結單 | 紫 `#5f3dc4` | 人工放棄結案 |

### 4.2 Ticket 詳情（`AutopassTicketDetail.tsx`）

**定位**：右側 Drawer，**只讀為主**——查 Activity 歷程 / 加備註 / 看繳費證明。所有狀態流轉動作都收回列表頁卡片的主 CTA + Modal。

**Drawer 規格**：
- 寬度 720px，從右側展開
- 整個 Drawer body 為灰底（`#f8f9fa`），卡牌之外的留白也是統一灰色
- Header sticky：左側「✕ 關閉」、右側「{當前} / {總數} + 上一張 / 下一張」按鈕
- prev/next 在 `filtered`（當前篩選條件下的全集）內巡覽，跨頁時自動翻頁

**內容區塊（由上至下）：**

1. **Hero card**（單一 Paper，三行階層）：
   - Row 1：服務名（h3）＋狀態 Badge ＋ 右上角 `ticket.id`（mono 字體 + 外連 icon，將來導向 ticket 對應外部頁面）
   - Row 2：用戶 · 車牌 · 身分證／統編 · 出生年月日 · 車種（依 `SERVICE_QUERY_FIELDS` 動態，monospace 用於需要對齊的數字欄位；無 copy button）
   - Row 3：FlowStepper 全寬

2. **failReason banner**（紅色 Alert，僅 `query-failed` / `invoice-failed`，文字壓縮）

3. **Tabs（兩個）**：
   - **Activity**（預設）：詳情頁的核心，見下節
   - **繳費證明**：縮圖 grid，點擊放大 lightbox

> 原本的「次要 Properties」區塊已移除（識別欄位上移到 Row 2）；金額不在 Hero 顯示，要看金額看 Activity 的 invoice 卡。

#### Activity Tab（ClickUp 風格時間軸）

採用 Mantine `Timeline` 元件，由新到舊排列。事件種類：

| Kind | 來源 | actor | 顯示重點 |
| --- | --- | --- | --- |
| `created` | `ticket.createdAt` | 系統 | 服務 · cycle |
| `query-result` | **合成事件**（status !== `pending-query` 才產生） | 客服 | outcome label（或「查詢失敗」），含線上金額 |
| `invoice` | `invoiceOrders[]` | 系統 | INV-id · 金額大字 · Badge（請款中／成功／失敗）；卡片樣式（厚） |
| `note` | `notes[]` | 留言者 | 內容（灰底 block） |
| `email` | `emailLogs[]` | 系統 | subject · 模板 · 觸發狀態 |

**`query-result` 是合成事件**：mock 沒記錄回填的時戳，因此推導：取第一筆 invoice 或 email 的時戳，往前推 1 分鐘。讓「回填 → 寄信／請款」的時序合理。

**Comment input**：Activity 上方有 Textarea（minRows=2，autosize 上限 6 行，padding 較鬆），送出按鈕浮在 textarea 內右下角。送出後寫進 `noteOverrides`，刷新後消失（demo 限定）。

**Invoice 事件樣式**：原本「訂單歷程」tab 已合併進 Activity；為了保留訂單對帳的可讀性，invoice 事件採較厚的 card layout——左側 INV-id (mono blue) + 狀態 Badge，右側金額大字，下方接 note / failReason。

#### 動態顯示欄位（沿用 `SERVICE_QUERY_FIELDS`）

| 服務項目 | 身分證／統編 | 出生日期 | 車牌 | 車種 |
| --- | :---: | :---: | :---: | :---: |
| 汽燃費（個人 / 法人） | ✓ | | ✓ | |
| 汽燃費逾期罰緩 | ✓ | | ✓ | |
| 交通罰緩（個人） | ✓ | ✓ | | |
| 交通罰緩（法人） | ✓ | | ✓ | ✓ |
| 違反強制險罰緩 | | | ✓ | ✓ |
| ETC 通行費 | ✓ | | ✓ | |

身分證號 label 個人顯示「身分證字號」、法人顯示「法人統一編號」；出生日期 mask 顯示。

### 4.3 對帳匯出（`AutopassExport.tsx`）

空殼頁，文案「對帳匯出功能規劃中」+ disabled 的 `匯出 CSV` 按鈕。

## 5. 資料模型（mock）

詳細型別在 `src/types/autopass.ts`，mock 資料在 `src/data/autopassMock.ts`。核心結構：

```ts
Ticket {
  id, userId, userName, plateNumber,
  serviceType, cycle,
  amount: number | null,            // 線上可請款金額
  status: TicketStatus,
  outcome?: TicketOutcomeKind,      // 查詢結果的細部 outcome（不影響 status，只標註）
  createdAt, updatedAt,
  driverInfo: UserDriverInfo,
  invoiceOrders: InvoiceOrder[],
  notes: TicketNote[],
  emailLogs: EmailLog[],
  paymentProofs?: string[],         // 繳費證明截圖（demo 用 data URI；正式環境為雲儲存 URL）
}
```

### 5.1 狀態（`TicketStatus`）

| Status | 中文 | Group | 是否終結 |
| --- | --- | --- | --- |
| `pending-query` | 待查詢 | 待查 | ✗ |
| `no-fee` | 無需繳費（含整單臨櫃，差異看 outcome）| 查詢 | ✓ |
| `query-failed` | 查詢失敗 | 例外 | ✗（用戶更新會自動回 pending-query） |
| `invoice-success` | 請款成功 | 請款 | ✗（等線下代繳） |
| `invoice-failed` | 請款失敗 | 例外 | ✗ |
| `paid` | 繳款成功 | 繳款 | ✓ |
| `unable-to-close` | 無法結單 | 例外 | ✓ |

### 5.2 細部 outcome（`TicketOutcomeKind`）

| Outcome | 中文 | 對應 Status |
| --- | --- | --- |
| `no-fee` | 無應繳費用 | `no-fee` |
| `counter-only` | 整單需臨櫃辦理 | `no-fee` |
| `online-full` | 全額線上代繳 | `invoice-success` / `invoice-failed` / `paid` |
| `online-mixed` | 部分需臨櫃自繳 | `invoice-success` / `invoice-failed` / `paid` |

> outcome 只在詳情 Activity 的 `query-result` 事件中標註，不影響列表 Badge。

### 5.3 Mock 涵蓋

每個服務 tab 都備有四個非終結狀態示意（待查詢 / 請款失敗 / 請款成功 / 查詢失敗）；汽燃費、交通罰緩、ETC 三個 tab 額外有「法人」票各一張。混合 outcome（`online-mixed`）目前在汽燃費逾期罰緩、交通罰緩 tab 各有一張。歷史任務有 `paid` / `no-fee` (`no-fee`) / `no-fee` (`counter-only`) / `unable-to-close` 各一張。

## 6. 不在本次範圍

- 用戶端啟用流程（PRD 第二章）
- 真正的後端 API、權限管理、登入
- 對帳匯出實作邏輯
- 多車牌切換 UI（PRD 已說 S1 不開放）
- 訂閱權益失效時的自動繳停用流程（PRD 第五章）
- Modal「模擬扣款失敗」開關（demo 目前固定走成功路徑）
- 列表卡片上的流程訊號（stepper / failReason）— 已收斂在詳情頁，列表卡片暫不重複
- ticket.id 外連的目標頁面（連結結構先做好，目標頁稍後）

## 7. 後續可改點 / TODO

- [ ] Modal 加「模擬扣款失敗」開關，讓 demo 可走 invoice-failed 分支
- [ ] 「修改車籍資料」做成真表單而非 toast
- [ ] 4.7 對帳匯出規格確定後接上
- [ ] 用戶端 UI（PRD 第二章）
- [ ] Hero 右上 ticket.id 外連的對應頁面
- [ ] FlowStepper 是否需要更細粒度（目前是粗粒度的 4 階節點）

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

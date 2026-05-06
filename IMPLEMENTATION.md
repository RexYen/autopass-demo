# 通行費自動繳後台 Prototype 實作文件

> 對應 PRD：[駕駛中心] v8.x 會籍方案服務擴充 S1（Notion `349aeda402618086b0f5fc7a2815386e`）

## 1. Demo 範圍

本次 prototype 聚焦在 **PRD 第四章：自動繳管理後台功能**（4.1 – 4.6），用戶端流程（第二章）暫不實作。

| 章節 | 是否實作 | 備註 |
| --- | --- | --- |
| 4.1 查繳待辦清單 | ✅ | 列表頁 + Dashboard 統計 |
| 4.2 Ticket 狀態機 | ✅ | 詳情頁推進、允許跳階／回退 |
| 4.3 備註功能 | ✅ | 任務內多筆留言、不可編輯 |
| 4.4 一鍵向用戶請款 | ✅ | 內嵌 modal，僅輸入金額 |
| 4.5 訂單歷程紀錄 | ✅ | 詳情頁列出多筆 invoice_order |
| 4.6 自動發信 | ✅ | 詳情頁顯示寄送紀錄 timeline |
| 4.7 對帳匯出 | 🟡 預留殼 | 空頁面、disabled 匯出按鈕 |

> **暫不處理**：跳階／回退時是否重複發信的策略（PM 待決定）。Demo 中所有狀態切換都會新增一筆發信紀錄。

## 2. 資訊架構（Sitemap）

```
通行費自動繳
├── 📊 Dashboard       /autopass-dashboard
├── 🎫 查繳任務        /autopass-tickets
│   └── 任務詳情      /autopass-tickets/:id
└── 📤 對帳匯出       /autopass-export
```

實際以 `currentView` state 切換（沿用既有 `App.tsx` 模式）。

## 3. 頁面內容

### 3.1 Dashboard（`AutopassDashboard.tsx`）

- **今日重點待辦**：4 張統計卡（待查詢 / 待請款 / 待繳款 / 已完成）
- **需要關注**：請款失敗、查詢失敗 → 點擊跳到列表頁並套用篩選
- **本週服務排程**：純資訊，列出本週會自動產出的服務 Ticket（罰單週三、ETC 每月 10 號等）

### 3.2 Tickets 列表（`AutopassTickets.tsx`）

- **Tabs**：「現在」/「過去」（過去 = 繳款成功 / 不需繳 / 需臨櫃 / 無法結單）
- **搜尋**：車牌、用戶、Ticket ID
- **篩選**：狀態、服務類型、週期（狀態選單依目前 tab 動態切換）
- **欄位**：服務 / 用戶 / 車牌 / 週期 / 狀態 tag / 操作（→ 詳情）
- **狀態 tag 配色**
  | 狀態 | 色 |
  | --- | --- |
  | 待查詢 | 灰 `#868e96` |
  | 不需繳 / 需臨櫃 / 需線上 | 藍 `#228be6` |
  | 請款中 / 請款成功 | 黃 `#fab005` / 綠 `#12b886` |
  | 繳款成功 | 綠 `#12b886` |
  | 查詢失敗 / 請款失敗 / 無法結單 | 紅 `#fa5252` |

### 3.3 Ticket 詳情（`AutopassTicketDetail.tsx`）

ClickUp-style 兩欄 layout：左側主內容（操作 + 歷史），右側 sticky properties sidebar（所有 metadata + 可複製欄位）。

**頂部工具列**：← 返回列表（左）｜ ⋯ menu「覆寫狀態」（右）

**主內容欄（左 8/12）**
1. **Title block**：Ticket ID / 服務+週期（H2）/ 狀態 Badge / 「前往 街口或遠通電收」外連 button
2. **請款中 banner**（僅 `invoicing` 狀態顯示）：提醒等待車麻吉回判
3. **下一步動作**（淺藍色強調卡）：依當前狀態給對應按鈕
   - 待查詢 / 需線上：`無待繳` / `需臨櫃` / `建立請款` / `查詢失敗`
   - 請款中：`標記請款成功` / `標記請款失敗`
   - 請款成功：`標記繳款成功`
   - 請款失敗：`重新建立請款` / `標記為無法結單`
   - 查詢失敗：`重新查詢` / `標記為無法結單`
   - terminal：顯示已結束 + 提示用 ⋯ menu 回退
   - 每個按鈕下方顯示「將寄送 XX 通知信」hint
4. **歷史紀錄 Tabs**：訂單歷程 / 備註 / 自動發信（含筆數）— 預設訂單歷程 tab

**Properties Sidebar（右 4/12, sticky）— 詳細資訊**
- 狀態（Badge）
- 用戶
- 車牌（複製）
- 身分證／統編（複製，*隱碼）
- 出生年月日（複製，*隱碼，僅個人）
- 車種
- 車主名稱（僅當與用戶名不同，例：法人）
- 查繳平台 + 週期
- 建立時間 / 最後更新

### 3.4 對帳匯出（`AutopassExport.tsx`）

空殼頁，文案「對帳匯出功能規劃中」+ disabled 的 `匯出 CSV` 按鈕。

## 4. 資料模型（mock）

詳細型別在 `src/types/autopass.ts`，mock 資料在 `src/data/autopassMock.ts`。核心結構：

```ts
Ticket {
  id, userId, userName, plateNumber,
  serviceType, cycle, amount, status,
  createdAt, updatedAt,
  invoiceOrders: InvoiceOrder[],
  notes: TicketNote[],
  emailLogs: EmailLog[],
}
```

> Mock 資料覆蓋了所有 7 種服務、所有 10 種狀態，方便驗證 UI。

## 5. 不在本次範圍

- 用戶端啟用流程（PRD 第二章）
- 真正的後端 API、權限管理、登入
- 對帳匯出實作邏輯
- 多車牌切換 UI（PRD 已說 S1 不開放）
- 訂閱權益失效時的自動繳停用流程（PRD 第五章）

## 6. 後續可改點 / TODO

- [ ] 4.7 對帳匯出規格確定後接上
- [ ] 跳階／回退時的發信策略與 UI 提示
- [ ] Dashboard 的時間軸（目前是純列表）
- [ ] 一鍵請款 modal 是否要顯示車麻吉 invoice_id 預覽
- [ ] 用戶端 UI（PRD 第二章）

## 7. 開發指令

```bash
npm install
npm run dev      # http://localhost:5173 或 5174
npm run lint
npm run build
```

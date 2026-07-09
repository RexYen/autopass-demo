export type ServiceType =
  | 'fuel-fee-personal'
  | 'fuel-fee-corporate'
  | 'fuel-fee-overdue'
  | 'compulsory-insurance-fine'
  | 'etc-toll'

export type ServiceCategory = '規費' | '罰單' | '通行費'

export const SERVICE_META: Record<
  ServiceType,
  {
    label: string
    category: ServiceCategory
    cycleHint: string // 開徵週期提示（PRD 第三章）；目前無 UI 消費端，保留作資料參考
    platform: string
    platformUrl: string
  }
> = {
  'fuel-fee-personal': {
    label: '汽燃費',
    category: '規費',
    cycleHint: '每年 7/10',
    platform: '街口支付',
    platformUrl: 'https://www.jkopay.com/',
  },
  'fuel-fee-corporate': {
    label: '汽燃費',
    category: '規費',
    cycleHint: '每季 3/10、6/10、9/10、12/10',
    platform: '街口支付',
    platformUrl: 'https://www.jkopay.com/',
  },
  'fuel-fee-overdue': {
    label: '汽燃費逾期罰鍰',
    category: '罰單',
    cycleHint: '每週三',
    platform: '街口支付',
    platformUrl: 'https://www.jkopay.com/',
  },
  'compulsory-insurance-fine': {
    label: '違反強制險罰鍰',
    category: '罰單',
    cycleHint: '每週三',
    platform: '街口支付',
    platformUrl: 'https://www.jkopay.com/',
  },
  'etc-toll': {
    label: 'ETC 通行費',
    category: '通行費',
    cycleHint: '每月 10 號',
    platform: '遠通電收',
    platformUrl: 'https://www.fetc.net.tw/',
  },
}

export type QueryField = 'idNumber' | 'plateNumber' | 'birthDate' | 'vehicleType'

export const QUERY_FIELD_META: Record<QueryField, { label: string }> = {
  idNumber: { label: '證件號碼／統編' },
  plateNumber: { label: '車牌號碼' },
  birthDate: { label: '出生年月日' },
  vehicleType: { label: '車種' },
}

// 對照 PRD 第三章查繳週期表
export const SERVICE_QUERY_FIELDS: Record<ServiceType, QueryField[]> = {
  'fuel-fee-personal': ['idNumber', 'plateNumber'],
  'fuel-fee-corporate': ['idNumber', 'plateNumber'],
  'fuel-fee-overdue': ['idNumber', 'plateNumber'],
  'compulsory-insurance-fine': ['plateNumber', 'vehicleType'],
  'etc-toll': ['idNumber', 'plateNumber'],
}

export type TicketStatus =
  | 'pending-query'      // 待查詢
  | 'no-fee'             // 不需繳費（含整單臨櫃，差異記在 outcome）
  | 'query-failed'       // 查詢失敗
  | 'invoice-success'    // 請款成功
  | 'invoice-failed'     // 請款失敗
  | 'paid'               // 繳款成功

// 已結案狀態（歷史任務頁顯示這些；查繳任務頁排除）
export const TERMINAL_STATUSES: TicketStatus[] = [
  'paid',
  'no-fee',
  'query-failed',
  'invoice-failed',
]

// group 僅為狀態機分類註記（對照 spec 5.1），無 UI 消費端
export const STATUS_META: Record<
  TicketStatus,
  { label: string; group: '待查' | '查詢' | '請款' | '繳款' | '例外'; color: string; bg: string }
> = {
  'pending-query':       { label: '待查詢',     group: '待查', color: '#495057', bg: 'rgba(134,142,150,0.15)' },
  'no-fee':              { label: '無需繳費',   group: '查詢', color: '#1971c2', bg: 'rgba(34,139,230,0.12)' },
  'query-failed':        { label: '查詢失敗',   group: '例外', color: '#c92a2a', bg: 'rgba(250,82,82,0.12)' },
  'invoice-success':     { label: '請款成功',   group: '請款', color: '#0b7c4d', bg: 'rgba(18,184,134,0.15)' },
  'invoice-failed':      { label: '請款失敗',   group: '例外', color: '#c92a2a', bg: 'rgba(250,82,82,0.12)' },
  'paid':                { label: '繳款成功',   group: '繳款', color: '#0b7c4d', bg: 'rgba(18,184,134,0.18)' },
}

// 查詢結果回填後的細部 outcome（不影響主 status，只在詳情中標註）
export type TicketOutcomeKind =
  | 'no-fee'        // 平台查到 0 元，無應繳費用
  | 'counter-only'  // 整單需臨櫃辦理
  | 'online-full'   // 全額線上代繳
  | 'online-mixed'  // 部分需臨櫃繳費（混合單，臨櫃部分由用戶自繳）

export const OUTCOME_META: Record<TicketOutcomeKind, { label: string }> = {
  'no-fee':       { label: '無應繳費用' },
  'counter-only': { label: '整單需臨櫃辦理' },
  'online-full':  { label: '全額線上代繳' },
  'online-mixed': { label: '部分需臨櫃繳費' },
}

// 查詢失敗的細部原因
export type QueryFailureReason =
  | 'data-error'   // 資料錯誤（共用）
  | 'etag-bound'   // eTag 已綁定（僅 ETC 通行費）

export const QUERY_FAILURE_REASON_META: Record<
  QueryFailureReason,
  { label: string; description: string }
> = {
  'data-error': {
    label: '資料錯誤',
    description: '車籍／個資比對失敗，需用戶更新資料後下一週期重產 ticket',
  },
  'etag-bound': {
    label: 'eTag 已綁定',
    description: '該車已綁定其他 eTag 帳戶，無法代繳，僅出現在 ETC 通行費',
  },
}

export interface InvoiceOrder {
  id: string                   // INV-xxx
  amount: number
  note?: string
  createdAt: string            // ISO
  status: 'pending' | 'success' | 'failed'
  failReason?: string
}

export interface TicketNote {
  id: string
  author: string               // e.g. "Zoe"
  content: string
  createdAt: string
}

export interface EmailLog {
  id: string
  triggerStatus: TicketStatus
  template: string             // 對應 4.6 模板名
  subject: string
  sentAt: string
  status: 'sent' | 'failed'
}

export type VehicleType = '汽車' | '機車' | '大型重型機車' | '拖車'
export type OwnerType = '個人' | '法人'

export interface UserDriverInfo {
  fullName: string
  idNumber: string             // 證件號碼 (個人，身分證或居留證) 或統一編號 (法人)
  birthDate?: string           // YYYY/MM/DD（法人不需要）
  vehicleType: VehicleType
  ownerType: OwnerType
}

export interface Ticket {
  id: string                   // T-xxx
  userId: string
  userEmail: string
  plateNumber: string
  serviceType: ServiceType
  cycle: string                // e.g. "2026/05"
  amount: number | null        // 線上可請款金額
  status: TicketStatus
  outcome?: TicketOutcomeKind  // 查詢結果回填後的細部 outcome
  queryFailureReason?: QueryFailureReason  // 查詢失敗時的具體原因
  createdAt: string
  updatedAt: string
  driverInfo: UserDriverInfo
  invoiceOrders: InvoiceOrder[]
  notes: TicketNote[]
  emailLogs: EmailLog[]
}

// ── 自動繳申請（營運後台）──────────────────────────────
// 查繳「頻率」設定；所有申請皆有值，僅 ETC 通行費開放編輯（PRD v9.1.1 §2.5，預設每月兩次）。
// 與 Ticket.cycle（週期實例字串，如 "2026/W18"）是不同概念，不可混用。
export type BillingCycle = '每月兩次' | '每週'

export const BILLING_CYCLES: BillingCycle[] = ['每月兩次', '每週']

// 一筆自動繳「申請」：用戶替某服務開通自動繳，後端再依 billingCycle 週期性產生查繳 ticket。
// 車牌／證件號碼／車種／查繳週期為每筆申請的固定資料（必有值，UI 不出現「—」）。
export interface AutopassApplication {
  id: string                   // AP-xxx
  userEmail: string            // 駕駛中心帳號
  serviceType: ServiceType     // 申請服務 → SERVICE_META[serviceType].label
  plateNumber: string          // 車牌號碼
  idNumber: string             // 證件號碼／統編（個人身分證或法人統編）
  vehicleType: VehicleType     // 車種
  appliedAt: string            // 申請時間（ISO 字串）
  billingCycle: BillingCycle   // 查繳週期；僅 etc-toll 開放編輯
}

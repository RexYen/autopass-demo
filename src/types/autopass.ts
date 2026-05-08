export type ServiceType =
  | 'fuel-fee-personal'
  | 'fuel-fee-corporate'
  | 'fuel-fee-overdue'
  | 'traffic-fine-personal'
  | 'traffic-fine-corporate'
  | 'compulsory-insurance-fine'
  | 'etc-toll'

export type ServiceCategory = '規費' | '罰單' | '通行費'

export const SERVICE_META: Record<
  ServiceType,
  {
    label: string
    category: ServiceCategory
    cycleHint: string
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
    label: '汽燃費逾期罰緩',
    category: '罰單',
    cycleHint: '每週三',
    platform: '街口支付',
    platformUrl: 'https://www.jkopay.com/',
  },
  'traffic-fine-personal': {
    label: '交通罰緩',
    category: '罰單',
    cycleHint: '每週三',
    platform: '街口支付',
    platformUrl: 'https://www.jkopay.com/',
  },
  'traffic-fine-corporate': {
    label: '交通罰緩',
    category: '罰單',
    cycleHint: '每週三',
    platform: '街口支付',
    platformUrl: 'https://www.jkopay.com/',
  },
  'compulsory-insurance-fine': {
    label: '違反強制險罰緩',
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

export type QueryField = 'idNumber' | 'plateNumber' | 'birthDate' | 'vehicleType' | 'fullName'

export const QUERY_FIELD_META: Record<QueryField, { label: string; mask: 'id' | 'date' | 'none' }> = {
  idNumber: { label: '身分證／統編', mask: 'id' },
  plateNumber: { label: '車牌號碼', mask: 'none' },
  birthDate: { label: '出生年月日', mask: 'date' },
  vehicleType: { label: '車種', mask: 'none' },
  fullName: { label: '車主名稱', mask: 'none' },
}

// 對照 PRD 第三章查繳週期表
export const SERVICE_QUERY_FIELDS: Record<ServiceType, QueryField[]> = {
  'fuel-fee-personal': ['idNumber', 'plateNumber'],
  'fuel-fee-corporate': ['idNumber', 'plateNumber'],
  'fuel-fee-overdue': ['idNumber', 'plateNumber'],
  'traffic-fine-personal': ['idNumber', 'birthDate'],
  'traffic-fine-corporate': ['idNumber', 'plateNumber', 'vehicleType'],
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
  | 'unable-to-close'    // 無法結單

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
  'unable-to-close':     { label: '無法結單',   group: '例外', color: '#5f3dc4', bg: 'rgba(173,58,204,0.12)' },
}

// 查詢結果回填後的細部 outcome（不影響主 status，只在詳情中標註）
export type TicketOutcomeKind =
  | 'no-fee'        // 平台查到 0 元，無應繳費用
  | 'counter-only'  // 整單需臨櫃辦理
  | 'online-full'   // 全額線上代繳
  | 'online-mixed'  // 部分需臨櫃自繳（混合單，臨櫃部分由用戶自繳）

export const OUTCOME_META: Record<TicketOutcomeKind, { label: string }> = {
  'no-fee':       { label: '無應繳費用' },
  'counter-only': { label: '整單需臨櫃辦理' },
  'online-full':  { label: '全額線上代繳' },
  'online-mixed': { label: '部分需臨櫃自繳' },
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
  triggerStatus: TicketStatus | 'service-activated'
  template: string             // 對應 4.6 模板名
  subject: string
  sentAt: string
  status: 'sent' | 'failed'
}

export type VehicleType = '汽車' | '機車' | '大型重型機車' | '拖車'
export type OwnerType = '個人' | '法人'

export interface UserDriverInfo {
  fullName: string
  idNumber: string             // 身分證 (個人) 或統一編號 (法人)
  birthDate?: string           // YYYY/MM/DD（法人不需要）
  vehicleType: VehicleType
  ownerType: OwnerType
}

export interface Ticket {
  id: string                   // T-xxx
  userId: string
  userName: string
  plateNumber: string
  serviceType: ServiceType
  cycle: string                // e.g. "2026/05"
  amount: number | null        // 線上可請款金額
  status: TicketStatus
  outcome?: TicketOutcomeKind  // 查詢結果回填後的細部 outcome
  createdAt: string
  updatedAt: string
  driverInfo: UserDriverInfo
  invoiceOrders: InvoiceOrder[]
  notes: TicketNote[]
  emailLogs: EmailLog[]
  paymentProofs?: string[]     // 繳費證明截圖（demo 用 data URI；正式為雲儲存 URL）
}

export interface UpcomingSchedule {
  date: string                 // YYYY-MM-DD
  weekday: string
  serviceLabel: string
  category: ServiceCategory
  estimatedCount: number
  produced: boolean
}

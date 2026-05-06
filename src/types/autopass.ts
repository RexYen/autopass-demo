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
  | 'no-fee'             // 不需繳
  | 'counter-required'   // 需臨櫃繳費
  | 'query-failed'       // 查詢失敗
  | 'invoicing'          // 請款中
  | 'invoice-success'    // 請款成功
  | 'invoice-failed'     // 請款失敗
  | 'paid'               // 繳款成功
  | 'unable-to-close'    // 無法結單

export const STATUS_META: Record<
  TicketStatus,
  { label: string; group: '待查' | '查詢' | '請款' | '繳款' | '例外'; color: string; bg: string }
> = {
  'pending-query':       { label: '待查詢',     group: '待查', color: '#495057', bg: 'rgba(134,142,150,0.15)' },
  'no-fee':              { label: '不需繳費',   group: '查詢', color: '#1971c2', bg: 'rgba(34,139,230,0.12)' },
  'counter-required':    { label: '需臨櫃繳費', group: '查詢', color: '#1971c2', bg: 'rgba(34,139,230,0.12)' },
  'query-failed':        { label: '查詢失敗',   group: '例外', color: '#c92a2a', bg: 'rgba(250,82,82,0.12)' },
  'invoicing':           { label: '請款中',     group: '請款', color: '#b08000', bg: 'rgba(250,176,5,0.18)' },
  'invoice-success':     { label: '請款成功',   group: '請款', color: '#0b7c4d', bg: 'rgba(18,184,134,0.15)' },
  'invoice-failed':      { label: '請款失敗',   group: '例外', color: '#c92a2a', bg: 'rgba(250,82,82,0.12)' },
  'paid':                { label: '繳款成功',   group: '繳款', color: '#0b7c4d', bg: 'rgba(18,184,134,0.18)' },
  'unable-to-close':     { label: '無法結單',   group: '例外', color: '#5f3dc4', bg: 'rgba(173,58,204,0.12)' },
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
  amount: number | null
  status: TicketStatus
  createdAt: string
  updatedAt: string
  driverInfo: UserDriverInfo
  invoiceOrders: InvoiceOrder[]
  notes: TicketNote[]
  emailLogs: EmailLog[]
}

export interface UpcomingSchedule {
  date: string                 // YYYY-MM-DD
  weekday: string
  serviceLabel: string
  category: ServiceCategory
  estimatedCount: number
  produced: boolean
}

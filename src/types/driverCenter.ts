// 駕駛中心域型別 — 對應 PRD [駕駛中心] v9.0 行照、駕照、保單資料上傳「4.9 後臺顯示」。
// 後台以「帳號 × 證件類型」為一組呈現上傳資料，供營運／審核人員檢視與審核。

export type DriverDocType = 'driver-license' | 'vehicle-license' | 'insurance'

export const DRIVER_DOC_TYPES: DriverDocType[] = [
  'driver-license',
  'vehicle-license',
  'insurance',
]

export const DRIVER_DOC_META: Record<DriverDocType, { label: string }> = {
  'driver-license': { label: '駕駛執照' },
  'vehicle-license': { label: '行車執照' },
  insurance: { label: '車輛保單' },
}

// 審核狀態：待審核 / 審核成功 / 審核失敗（審核失敗時必填備註）
export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export const REVIEW_STATUS_META: Record<
  ReviewStatus,
  { label: string; color: string; bg: string }
> = {
  pending: { label: '待審核', color: '#495057', bg: 'rgba(134,142,150,0.15)' },
  approved: { label: '審核成功', color: '#0b7c4d', bg: 'rgba(18,184,134,0.15)' },
  rejected: { label: '審核失敗', color: '#c92a2a', bg: 'rgba(250,82,82,0.12)' },
}

export interface DriverDocFile {
  id: string
  label: string // 正面 / 反面 / 保單文件
  fileName: string // 顯示用檔名，如「正面.jpg」
  kind: 'image' | 'pdf'
  url: string // demo 以 SVG data URI 佔位；正式版為上傳檔案的短時效連結
}

// 一筆證件上傳：駕照／行照為正＋反面一組，保單為單一文件
export interface DriverDocUpload {
  id: string // DU-xxx
  userEmail: string // 駕駛中心 Email 帳號
  docType: DriverDocType
  uploadedAt: string // ISO；列表以 YYYY-MM-DD hh:mm:ss 顯示
  reviewStatus: ReviewStatus
  reviewNote?: string // 審核失敗時必填
  reviewedAt?: string
  files: DriverDocFile[]
}

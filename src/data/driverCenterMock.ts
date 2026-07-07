import type {
  DriverDocFile,
  DriverDocType,
  DriverDocUpload,
} from '../types/driverCenter'

// 純 demo 用 mock 資料。證件影像以 SVG data URI 佔位（正式版為用戶上傳的照片／PDF），
// Email 沿用通行費申請單 mock 的帳號，方便 demo 時對照同一批用戶。

const svgDataUri = (svg: string): string =>
  `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

// 證件卡佔位圖（駕照／行照的正、反面）
const cardImage = (title: string, corner: string, accent: string): string =>
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="840" height="520" viewBox="0 0 840 520">
  <rect width="840" height="520" rx="24" fill="#f1f3f5"/>
  <rect x="24" y="24" width="792" height="472" rx="16" fill="#ffffff" stroke="#dee2e6" stroke-width="2"/>
  <rect x="26" y="26" width="788" height="92" rx="14" fill="${accent}"/>
  <text x="64" y="84" font-family="Noto Sans TC, sans-serif" font-size="34" font-weight="700" fill="#ffffff">${title}</text>
  <rect x="64" y="156" width="200" height="248" rx="12" fill="#e9ecef"/>
  <circle cx="164" cy="238" r="42" fill="#ced4da"/>
  <rect x="104" y="292" width="120" height="90" rx="45" fill="#ced4da"/>
  <rect x="312" y="168" width="360" height="22" rx="11" fill="#dee2e6"/>
  <rect x="312" y="222" width="440" height="22" rx="11" fill="#e9ecef"/>
  <rect x="312" y="276" width="400" height="22" rx="11" fill="#e9ecef"/>
  <rect x="312" y="330" width="300" height="22" rx="11" fill="#e9ecef"/>
  <rect x="312" y="384" width="360" height="22" rx="11" fill="#e9ecef"/>
  <text x="420" y="286" font-family="Noto Sans TC, sans-serif" font-size="64" font-weight="700" fill="#adb5bd" opacity="0.35" transform="rotate(-18 420 286)">示意樣本 SAMPLE</text>
  <text x="752" y="468" font-family="Noto Sans TC, sans-serif" font-size="24" font-weight="500" fill="#868e96" text-anchor="end">${corner}</text>
</svg>`)

// A4 文件佔位頁（保單 PDF）
const pdfPageImage = (title: string): string =>
  svgDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="905" viewBox="0 0 640 905">
  <rect width="640" height="905" fill="#ffffff"/>
  <text x="56" y="88" font-family="Noto Sans TC, sans-serif" font-size="30" font-weight="700" fill="#343a40">${title}</text>
  <rect x="56" y="120" width="528" height="3" fill="#dee2e6"/>
  <rect x="56" y="168" width="420" height="16" rx="8" fill="#e9ecef"/>
  <rect x="56" y="208" width="528" height="16" rx="8" fill="#e9ecef"/>
  <rect x="56" y="248" width="480" height="16" rx="8" fill="#e9ecef"/>
  <rect x="56" y="288" width="528" height="16" rx="8" fill="#e9ecef"/>
  <rect x="56" y="328" width="360" height="16" rx="8" fill="#e9ecef"/>
  <rect x="56" y="400" width="528" height="180" rx="8" fill="#f8f9fa" stroke="#dee2e6"/>
  <rect x="56" y="620" width="500" height="16" rx="8" fill="#e9ecef"/>
  <rect x="56" y="660" width="528" height="16" rx="8" fill="#e9ecef"/>
  <rect x="56" y="700" width="440" height="16" rx="8" fill="#e9ecef"/>
  <text x="320" y="480" font-family="Noto Sans TC, sans-serif" font-size="52" font-weight="700" fill="#adb5bd" opacity="0.35" text-anchor="middle" transform="rotate(-18 320 480)">示意樣本 SAMPLE</text>
</svg>`)

const DOC_ACCENT: Record<DriverDocType, string> = {
  'driver-license': '#5c7cfa',
  'vehicle-license': '#12b886',
  insurance: '#fab005',
}

// 駕照／行照：正＋反面一組
const licenseFiles = (uploadId: string, docType: DriverDocType): DriverDocFile[] => {
  const docLabel = docType === 'driver-license' ? '駕駛執照' : '行車執照'
  return [
    {
      id: `${uploadId}-front`,
      label: '正面',
      fileName: '正面.jpg',
      kind: 'image',
      url: cardImage(docLabel, '正面', DOC_ACCENT[docType]),
    },
    {
      id: `${uploadId}-back`,
      label: '反面',
      fileName: '反面.jpg',
      kind: 'image',
      url: cardImage(docLabel, '反面', DOC_ACCENT[docType]),
    },
  ]
}

export const mockDriverDocUploads: DriverDocUpload[] = [
  // ── 駕駛執照 ──────────────────────────────────────────
  {
    id: 'DU-001',
    userEmail: 'abc@123.com',
    docType: 'driver-license',
    uploadedAt: '2026-07-06T18:50:21',
    reviewStatus: 'pending',
    files: licenseFiles('DU-001', 'driver-license'),
  },
  {
    id: 'DU-002',
    userEmail: 'xyz@gmail.com',
    docType: 'driver-license',
    uploadedAt: '2026-07-05T09:12:47',
    reviewStatus: 'pending',
    files: licenseFiles('DU-002', 'driver-license'),
  },
  {
    id: 'DU-003',
    userEmail: 'fff@gmail.com',
    docType: 'driver-license',
    uploadedAt: '2026-07-03T21:04:05',
    reviewStatus: 'approved',
    reviewedAt: '2026-07-04T10:30:12',
    files: licenseFiles('DU-003', 'driver-license'),
  },
  {
    id: 'DU-004',
    userEmail: 'late.payer@hotmail.com',
    docType: 'driver-license',
    uploadedAt: '2026-07-01T08:45:33',
    reviewStatus: 'rejected',
    reviewedAt: '2026-07-01T14:22:08',
    reviewNote: '反面照片反光，管轄編號無法辨識，需通知用戶重新拍攝上傳。',
    files: licenseFiles('DU-004', 'driver-license'),
  },
  // ── 行車執照 ──────────────────────────────────────────
  {
    id: 'DU-005',
    userEmail: 'abc@123.com',
    docType: 'vehicle-license',
    uploadedAt: '2026-07-06T18:53:40',
    reviewStatus: 'pending',
    files: licenseFiles('DU-005', 'vehicle-license'),
  },
  {
    id: 'DU-006',
    userEmail: 'rider01@gmail.com',
    docType: 'vehicle-license',
    uploadedAt: '2026-07-04T12:38:59',
    reviewStatus: 'approved',
    reviewedAt: '2026-07-05T09:02:44',
    files: licenseFiles('DU-006', 'vehicle-license'),
  },
  {
    id: 'DU-007',
    userEmail: 'second.car@gmail.com',
    docType: 'vehicle-license',
    uploadedAt: '2026-07-02T23:11:16',
    reviewStatus: 'rejected',
    reviewedAt: '2026-07-03T11:40:27',
    reviewNote: '上傳的是保養單據非行照，需通知用戶重新上傳正確證件。',
    files: licenseFiles('DU-007', 'vehicle-license'),
  },
  {
    id: 'DU-008',
    userEmail: 'fleet@logistics.com.tw',
    docType: 'vehicle-license',
    uploadedAt: '2026-06-30T16:27:50',
    reviewStatus: 'pending',
    files: licenseFiles('DU-008', 'vehicle-license'),
  },
  // ── 車輛保單（M1 App 端未開放上傳；後台先支援檢視）─────
  {
    id: 'DU-009',
    userEmail: 'fff@gmail.com',
    docType: 'insurance',
    uploadedAt: '2026-07-05T20:19:02',
    reviewStatus: 'pending',
    files: [
      {
        id: 'DU-009-doc',
        label: '保單文件',
        fileName: '車險要保書.pdf',
        kind: 'pdf',
        url: pdfPageImage('車險要保書'),
      },
    ],
  },
  {
    id: 'DU-010',
    userEmail: 'fleet@logistics.com.tw',
    docType: 'insurance',
    uploadedAt: '2026-07-01T10:05:36',
    reviewStatus: 'approved',
    reviewedAt: '2026-07-02T15:48:19',
    files: [
      {
        id: 'DU-010-doc',
        label: '保單文件',
        fileName: '車險報價單.jpg',
        kind: 'image',
        url: cardImage('車險報價單', '第 1 頁', DOC_ACCENT.insurance),
      },
    ],
  },
]

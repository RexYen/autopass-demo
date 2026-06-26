import type { AutopassApplication } from '../types/autopass'

// 純 demo 用 mock 資料；涵蓋全部 5 種 serviceType、個人與法人、各種查繳週期（含雙週繳）。
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

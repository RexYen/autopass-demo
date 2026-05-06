// 將敏感欄位以 * 隱碼，僅供顯示。原始值仍在資料層，複製按鈕會送出原始值。

export function maskId(value: string): string {
  // 個人身分證 A123456789 → A12*****89
  // 統一編號 12345678 → 12****78
  if (!value) return ''
  if (value.length <= 4) return value
  const head = value.slice(0, value.length === 10 ? 3 : 2)
  const tail = value.slice(-2)
  return `${head}${'*'.repeat(value.length - head.length - tail.length)}${tail}`
}

export function maskDate(value: string): string {
  // 1990/05/12 → 1990/**/**
  if (!value) return ''
  const m = value.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/)
  if (!m) return value
  return `${m[1]}/**/**`
}

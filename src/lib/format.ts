export function formatRate(v: number | null): string {
  if (v === null) return '—'
  return `${v.toFixed(1)}%`
}

export function formatNum(v: number | null, digits = 1): string {
  if (v === null) return '—'
  return v.toLocaleString('ja-JP', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })
}

export function formatYen(v: number | null): string {
  if (v === null) return '—'
  const sign = v > 0 ? '+' : ''
  return `${sign}${Math.round(v).toLocaleString('ja-JP')}円`
}

export function rateTone(rate: number | null): string {
  if (rate === null) return 'muted'
  if (rate >= 110) return 'hot'
  if (rate >= 100) return 'good'
  if (rate >= 95) return 'fair'
  return 'cold'
}

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

export function formatCorrectionPp(v: number | null): string {
  if (v === null) return '—'
  const sign = v > 0 ? '+' : ''
  return `${sign}${v.toFixed(1)}pt`
}

/** 分表示（60分以上は○時間○分） */
export function formatMinutes(v: number | null): string {
  if (v === null || !Number.isFinite(v)) return '—'
  if (v < 0) return '0分'
  const total = Math.round(v)
  if (total < 60) return `${total}分`
  const h = Math.floor(total / 60)
  const m = total % 60
  return m === 0 ? `${h}時間` : `${h}時間${m}分`
}

export function rateTone(rate: number | null): string {
  if (rate === null) return 'muted'
  if (rate >= 110) return 'hot'
  if (rate >= 100) return 'good'
  if (rate >= 95) return 'fair'
  return 'cold'
}

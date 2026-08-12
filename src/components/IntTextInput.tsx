import type { InputHTMLAttributes } from 'react'

type Props = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange' | 'onBlur' | 'inputMode'
> & {
  value: string
  onChange: (text: string) => void
  /** 差枚など。default false */
  allowNegative?: boolean
  /** 0 のとき表示を空にする。default true */
  blankZero?: boolean
}

/** 空欄は fallback（通常 0） */
export function parseIntText(text: string, fallback = 0): number {
  const t = text.trim()
  if (t === '' || t === '-') return fallback
  const n = Number(t)
  if (!Number.isFinite(n)) return fallback
  return Math.trunc(n)
}

/**
 * キーボード入力向けの整数フィールド。
 * スピナーなし。空欄や 0 は表示を空のままにできる。
 */
export default function IntTextInput({
  value,
  onChange,
  allowNegative = false,
  blankZero = true,
  min,
  max,
  ...rest
}: Props) {
  return (
    <input
      {...rest}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      enterKeyHint="done"
      value={value}
      onChange={(e) => {
        const raw = e.target.value
        if (raw === '') {
          onChange('')
          return
        }
        if (allowNegative && raw === '-') {
          onChange('-')
          return
        }
        const re = allowNegative ? /^-?\d+$/ : /^\d+$/
        if (re.test(raw)) onChange(raw)
      }}
      onBlur={() => {
        const t = value.trim()
        if (t === '' || t === '-') {
          onChange('')
          return
        }
        let n = Number(t)
        if (!Number.isFinite(n)) {
          onChange('')
          return
        }
        n = Math.trunc(n)
        if (typeof min === 'number' && Number.isFinite(min) && n < min) n = min
        if (typeof max === 'number' && Number.isFinite(max) && n > max) n = max
        if (blankZero && n === 0) {
          onChange('')
          return
        }
        onChange(String(n))
      }}
    />
  )
}

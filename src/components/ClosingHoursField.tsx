import {
  CLOSING_HOURS_OPTIONS,
  closingHoursLabel,
  type ClosingHours,
} from '../lib/closingCorrection'

type Props = {
  value: ClosingHours
  onChange: (v: ClosingHours) => void
}

export default function ClosingHoursField({ value, onChange }: Props) {
  return (
    <label className="field">
      <span>閉店までの時間</span>
      <select
        value={String(value)}
        onChange={(e) => onChange(Number(e.target.value) as ClosingHours)}
      >
        {CLOSING_HOURS_OPTIONS.map((h) => (
          <option key={h} value={h}>
            {closingHoursLabel(h)}
            {h === 1 ? '（うちはじめ目安・約650G）' : ''}
          </option>
        ))}
      </select>
    </label>
  )
}

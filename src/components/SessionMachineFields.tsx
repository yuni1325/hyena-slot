import type { FieldDef } from '../sessions/registry'

type Props = {
  fields: FieldDef[]
  values: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
}

export default function SessionMachineFields({
  fields,
  values,
  onChange,
}: Props) {
  const set = (key: string, value: unknown) => {
    onChange({ ...values, [key]: value })
  }

  return (
    <div className="form-grid session-fields">
      {fields.map((f) => {
        if (f.type === 'boolean') {
          return (
            <label key={f.key} className="field field-check">
              <span>{f.label}</span>
              <input
                type="checkbox"
                checked={Boolean(values[f.key])}
                onChange={(e) => set(f.key, e.target.checked)}
              />
            </label>
          )
        }
        if (f.type === 'select') {
          return (
            <label key={f.key} className="field">
              <span>{f.label}</span>
              <select
                value={String(values[f.key] ?? '')}
                onChange={(e) => set(f.key, e.target.value)}
              >
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          )
        }
        const n = values[f.key]
        return (
          <label key={f.key} className="field">
            <span>{f.label}</span>
            <input
              type="number"
              inputMode="numeric"
              min={f.min}
              max={f.max}
              step={f.step ?? 1}
              value={typeof n === 'number' ? n : Number(n) || 0}
              onChange={(e) => {
                const v = Number(e.target.value)
                set(f.key, Number.isFinite(v) ? v : 0)
              }}
            />
          </label>
        )
      })}
    </div>
  )
}

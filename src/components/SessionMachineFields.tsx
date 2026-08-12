import { useEffect, useState } from 'react'
import IntTextInput, { parseIntText } from './IntTextInput'
import type { FieldDef } from '../sessions/registry'

type Props = {
  fields: FieldDef[]
  values: Record<string, unknown>
  onChange: (next: Record<string, unknown>) => void
}

function NumberField({
  field,
  value,
  onCommit,
}: {
  field: Extract<FieldDef, { type: 'number' }>
  value: unknown
  onCommit: (n: number) => void
}) {
  const num =
    typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : 0
  const [text, setText] = useState(() => (num === 0 ? '' : String(num)))

  useEffect(() => {
    setText(num === 0 ? '' : String(num))
  }, [num])

  return (
    <label className="field">
      <span>{field.label}</span>
      <IntTextInput
        min={field.min}
        max={field.max}
        value={text}
        onChange={(t) => {
          setText(t)
          onCommit(parseIntText(t, 0))
        }}
      />
    </label>
  )
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
        return (
          <NumberField
            key={f.key}
            field={f}
            value={values[f.key]}
            onCommit={(n) => set(f.key, n)}
          />
        )
      })}
    </div>
  )
}

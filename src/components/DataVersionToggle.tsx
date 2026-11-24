import {
  DATA_VERSION_PREF_LABEL,
  type DataVersionPref,
} from '../sessions/dataVersion'

/** 期待出玉率の基準（最新データ／旧データ）の切り替え */
export default function DataVersionToggle({
  value,
  onChange,
  note,
}: {
  value: DataVersionPref
  onChange: (v: DataVersionPref) => void
  note?: string
}) {
  return (
    <div className="version-toggle-wrap">
      <div className="version-toggle" role="group" aria-label="期待値の基準">
        <span className="version-toggle-label">期待値の基準</span>
        {(['latest', 'legacy'] as DataVersionPref[]).map((v) => (
          <button
            key={v}
            type="button"
            className={value === v ? 'is-on' : ''}
            aria-pressed={value === v}
            onClick={() => onChange(v)}
          >
            {DATA_VERSION_PREF_LABEL[v]}
          </button>
        ))}
      </div>
      {note && <p className="version-toggle-note">{note}</p>}
    </div>
  )
}

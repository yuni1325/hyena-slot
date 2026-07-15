import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { machines, type ModeResult } from '../machines'
import { formatNum, formatRate, rateTone } from '../lib/format'

const MAX_ABESHI = 1536

export default function HokutoTensei2Page() {
  const machine = machines.find((m) => m.id === 'hokuto-tensei2')!
  const [abeshiText, setAbeshiText] = useState('0')
  const [phase, setPhase] = useState(machine.phases?.[0]?.id ?? 'afterAt')
  const [shutter, setShutter] = useState(false)
  const shutterOn = Boolean(machine.hasShutterOption && shutter)

  const currentAbeshi = useMemo(() => {
    const n = Number(abeshiText)
    if (!Number.isFinite(n) || n < 0) return 0
    return Math.min(MAX_ABESHI, Math.floor(n))
  }, [abeshiText])

  const results: ModeResult[] = useMemo(
    () => machine.calculate({ currentAbeshi, phase, shutter: shutterOn }),
    [machine, currentAbeshi, phase, shutterOn],
  )

  const premises = useMemo(
    () => machine.premises({ phase, shutter: shutterOn }),
    [machine, phase, shutterOn],
  )

  const showStay = !shutterOn && results.some((r) => r.stayProbability != null)

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden />
      <header className="hero">
        <p className="brand">
          <Link to="/" className="brand-link">
            HYENA SLOT
          </Link>
        </p>
        <h1 className="machine-name">{machine.name}</h1>
        <p className="tagline">あべし数からモード別の期待値をその場で確認</p>
      </header>

      <main className="panel">
        {machine.phases && machine.phases.length > 0 && (
          <label className="field">
            <span>状況</span>
            <select value={phase} onChange={(e) => setPhase(e.target.value)}>
              {machine.phases.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        )}

        {machine.hasShutterOption && (
          <label className="field">
            <span>シャッター判別</span>
            <select
              value={shutter ? 'on' : 'off'}
              onChange={(e) => setShutter(e.target.value === 'on')}
            >
              <option value="off">なし</option>
              <option value="on">あり（896以内混合）</option>
            </select>
          </label>
        )}

        <label className="field abeshi-field">
          <span>現在のあべし数</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={MAX_ABESHI}
            value={abeshiText}
            onChange={(e) => setAbeshiText(e.target.value)}
            onBlur={() => setAbeshiText(String(currentAbeshi))}
          />
        </label>

        <section
          className={`results ${showStay ? 'with-stay' : ''}`}
          aria-label="計算結果"
        >
          <div className="results-head">
            <span>{shutterOn ? '条件' : 'モード'}</span>
            {showStay && <span>滞在率</span>}
            <span>期待出玉率</span>
            <span>平均G</span>
            <span>平均投資</span>
          </div>
          {results.map((r) => (
            <div
              key={r.modeId}
              className={`result-row tone-${rateTone(r.expectedPayoutRate)}${
                r.modeId === 'blend' ? ' is-blend' : ''
              }`}
            >
              <span className="mode">{r.modeLabel}</span>
              {showStay && (
                <span className="stay">
                  {r.modeId === 'blend'
                    ? '加重'
                    : formatRate(r.stayProbability)}
                </span>
              )}
              <span className="rate">{formatRate(r.expectedPayoutRate)}</span>
              <span>{formatNum(r.avgGames, 1)}G</span>
              <span>{formatNum(r.avgInvestment, 1)}枚</span>
            </div>
          ))}
        </section>

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">{machine.settingNote}</p>
          <ul>
            {premises.map((p) => (
              <li key={p.label}>
                <div className="premise-top">
                  <strong>{p.label}</strong>
                  <span className="premise-value">{p.value}</span>
                  {p.derived && <span className="badge">自前算出</span>}
                </div>
                <p className="premise-basis">{p.basis}</p>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}

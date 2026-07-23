import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BackToHomeButton from '../components/BackToHomeButton'
import ClosingCorrectionRows from '../components/ClosingCorrectionRows'
import ClosingHoursField from '../components/ClosingHoursField'
import {
  applyClosingCorrection,
  DEFAULT_CLOSING_HOURS,
  type ClosingHours,
} from '../lib/closingCorrection'
import {
  formatCorrectionPp,
  formatNum,
  formatRate,
  formatYen,
  rateTone,
} from '../lib/format'
import {
  buildMonkeyPremises,
  calculateMonkey,
  clampCycle,
  effectiveMaxCycle,
  resolveMode,
} from '../machines/monkey-turn-v/calc'
import {
  MODE_LABEL,
  PREMISES,
  type MonkeyMode,
} from '../machines/monkey-turn-v/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

const MODE_OPTIONS: { id: MonkeyMode; label: string }[] = [
  { id: 'unknown', label: '不明（通常Aとして計算）' },
  { id: 'A', label: '通常A（最大6周期）' },
  { id: 'B', label: '通常B（最大3周期）' },
  { id: 'heaven', label: '天国（1周期）' },
]

export default function MonkeyTurnVPage() {
  const [actualText, setActualText] = useState('307')
  const [displayText, setDisplayText] = useState('0')
  const [cycleText, setCycleText] = useState('2')
  const [mode, setMode] = useState<MonkeyMode>('unknown')
  const [shortened, setShortened] = useState(false)
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const actualGames = useMemo(() => parseIntSafe(actualText), [actualText])
  const displayGames = useMemo(() => parseIntSafe(displayText), [displayText])
  const rawCycle = useMemo(() => {
    const n = parseIntSafe(cycleText, 1)
    return Math.min(6, Math.max(1, n))
  }, [cycleText])

  const resolvedMode = useMemo(() => resolveMode(mode), [mode])
  const maxCycle = useMemo(
    () => effectiveMaxCycle(mode, shortened),
    [mode, shortened],
  )

  const cycle = useMemo(
    () => clampCycle(rawCycle, actualGames, mode, shortened),
    [rawCycle, actualGames, mode, shortened],
  )

  useEffect(() => {
    if (cycle !== rawCycle) setCycleText(String(cycle))
  }, [cycle, rawCycle])

  const cycleOptions = useMemo(() => {
    const list: number[] = []
    for (let c = 1; c <= maxCycle; c++) list.push(c)
    return list
  }, [maxCycle])

  const input = useMemo(
    () => ({ actualGames, displayGames, cycle, mode, shortened }),
    [actualGames, displayGames, cycle, mode, shortened],
  )

  const result = useMemo(() => calculateMonkey(input), [input])
  const premises = useMemo(() => buildMonkeyPremises(input), [input])

  const closing = useMemo(
    () =>
      applyClosingCorrection({
        hoursUntilClose: closingHours,
        avgGamesToHit: result.avgGames,
        expectedWinMedals: result.expectedWinMedals,
        pureIncPerGame: PREMISES.pureInc,
        rawPayoutRate: result.expectedPayoutRate,
      }),
    [closingHours, result],
  )

  const modeRows = useMemo(
    () =>
      result.byMode.map((row) => {
        const c = applyClosingCorrection({
          hoursUntilClose: closingHours,
          avgGamesToHit: row.avgGames,
          expectedWinMedals: result.expectedWinMedals,
          pureIncPerGame: PREMISES.pureInc,
          rawPayoutRate: row.expectedPayoutRate,
        })
        return { ...row, closedRate: c.correctedPayoutRate }
      }),
    [closingHours, result],
  )

  const refModes = useMemo(
    () => modeRows.filter((r) => r.id === 'B' || r.id === 'heaven'),
    [modeRows],
  )

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden />
      <header className="hero">
        <BackToHomeButton />
        <p className="brand">
          <Link to="/" className="brand-link">
            HYENA SLOT
          </Link>
        </p>
        <h1 className="machine-name">スマスロモンキーターンⅤ</h1>
        <p className="tagline">
          実G・表示G・周期・モード・短縮から天井狙いの期待値を確認
        </p>
      </header>

      <main className="panel">
        <label className="field">
          <span>実G数</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            value={actualText}
            onChange={(e) => setActualText(e.target.value)}
            onBlur={() => setActualText(String(actualGames))}
          />
        </label>
        <p className="inline-note">
          データカウンター等の実G（AT間）。web情報表の打ち出しG。
        </p>

        <label className="field">
          <span>表示G数</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={666}
            value={displayText}
            onChange={(e) => setDisplayText(e.target.value)}
            onBlur={() => setDisplayText(String(displayGames))}
          />
        </label>
        <p className="inline-note">
          液晶の当該周期内G。1周期目はハード天井222（平均到達≈80G）。2〜5周期は上限666、6周期は444。
        </p>

        <label className="field">
          <span>モード</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as MonkeyMode)}
          >
            {MODE_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <p className="inline-note">
          主表示は{MODE_LABEL[resolvedMode]}
          {mode === 'unknown' ? '（不明のためA）' : ''}
          。B・天国は下部に参考表示。
        </p>

        <label className="field">
          <span>現在周期</span>
          <select
            value={String(cycle)}
            onChange={(e) => setCycleText(e.target.value)}
          >
            {cycleOptions.map((c) => (
              <option key={c} value={c}>
                {c}周期目
              </option>
            ))}
          </select>
        </label>

        {maxCycle < 6 && (
          <p className="inline-note">
            選択可能: 1〜{maxCycle}周期目
            {shortened ? '（短縮時は最大4）' : ''}
            {resolvedMode === 'B' ? '（モードBは最大3）' : ''}
            {resolvedMode === 'heaven' ? '（天国は1周期天井）' : ''}
          </p>
        )}

        <label className="field">
          <span>短縮天井</span>
          <select
            value={shortened ? 'on' : 'off'}
            onChange={(e) => setShortened(e.target.value === 'on')}
          >
            <option value="off">なし（795G / 最大6周期）</option>
            <option value="on">あり（495G / 最大4周期）</option>
          </select>
        </label>

        <ClosingHoursField value={closingHours} onChange={setClosingHours} />

        <section className="results" aria-label="計算結果">
          <div className="results-head results-head-kaba">
            <span>項目</span>
            <span>値</span>
          </div>
          <ClosingCorrectionRows
            closing={closing}
            bonusLabel="AT"
            machineId="monkey-turn-v"
            pureIncPerGame={PREMISES.pureInc}
          />
          <div className="result-row result-row-kaba">
            <span className="mode">初当たり（AT）期待獲得出玉</span>
            <span>{formatNum(result.expectedWinMedals, 1)}枚</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">主計算モード</span>
            <span>{MODE_LABEL[result.resolvedMode]}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">web情報表ベース</span>
            <span>{formatRate(result.tablePayoutRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">周期・表示G補正</span>
            <span>{formatCorrectionPp(result.cycleCorrectionPp)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均G（補正後）</span>
            <span>{formatNum(result.avgGames, 1)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均投資（補正後）</span>
            <span>{formatNum(result.avgInvestment, 1)}枚</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">web情報表・平均G</span>
            <span>{formatNum(result.tableAvgGames, 1)}G</span>
          </div>
          {result.modelGamesToAt != null && (
            <div className="result-row result-row-kaba">
              <span className="mode">周期モデル・AT期待G</span>
              <span>{formatNum(result.modelGamesToAt, 1)}G</span>
            </div>
          )}
          <div className="result-row result-row-kaba">
            <span className="mode">G数天井残り</span>
            <span>{formatNum(result.remainingByG, 0)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">当該周期・表示G残り</span>
            <span>{formatNum(result.remainingInCycleDisplay, 0)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">web情報表・等価期待値</span>
            <span>{formatYen(result.tableYenEv)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">web情報表・平均投資</span>
            <span>
              {result.tableInvestYen == null
                ? '—'
                : `${Math.round(result.tableInvestYen).toLocaleString('ja-JP')}円`}
            </span>
          </div>
        </section>

        <h2 className="results-section-title">
          参考・モードB／天国（閉店補正後）
        </h2>
        <p className="inline-note">
          実G・表示G・周期は同じ条件で、モードだけ変えた場合の出玉率。主表示は
          {MODE_LABEL[result.resolvedMode]}。
        </p>
        <section className="results" aria-label="モード別参考">
          <div className="results-head results-head-scenario">
            <span>モード</span>
            <span>出玉率</span>
            <span>平均G</span>
            <span>周期残</span>
          </div>
          {refModes.map((r) => (
            <div
              key={r.id}
              className={`result-row result-row-scenario tone-${rateTone(r.closedRate)}`}
            >
              <span className="mode">{r.label}</span>
              <span className="rate">{formatRate(r.closedRate)}</span>
              <span>{formatNum(r.avgGames, 1)}G</span>
              <span>{formatNum(r.remainingInCycleDisplay, 0)}G</span>
            </div>
          ))}
        </section>

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">
            設定1固定・AT終了でヤメ／出玉率＝web情報表＋周期・表示G補正→閉店補正。モード不明は通常A。
          </p>
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
          <p className="footnote">
            1周期目は表示Gハード222・平均80G。周期AT率（◎○△）とG数天井の競合を近似。ライバルモード等は未入力。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

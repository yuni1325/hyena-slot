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
import { formatNum, formatRate, formatYen } from '../lib/format'
import {
  buildValvrave2Premises,
  calculateValvrave2,
} from '../machines/valvrave2/calc'
import {
  PERIOD_MODE_IDS,
  PERIOD_MODE_LABEL,
  PREMISES,
  effectiveMaxCycle,
  type PeriodMode,
} from '../machines/valvrave2/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

const MODE_OPTIONS: { id: PeriodMode; label: string }[] = [
  { id: 'unknown', label: '不明（通常Aとして周期計算）' },
  ...PERIOD_MODE_IDS.map((id) => ({ id, label: PERIOD_MODE_LABEL[id] })),
]

export default function Valvrave2Page() {
  const [actualText, setActualText] = useState('540')
  const [czText, setCzText] = useState('200')
  const [cycleText, setCycleText] = useState('1')
  const [mode, setMode] = useState<PeriodMode>('unknown')
  const [shortened, setShortened] = useState(false)
  const [kessenText, setKessenText] = useState('0')
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const actualGames = useMemo(() => parseIntSafe(actualText), [actualText])
  const czGames = useMemo(() => parseIntSafe(czText), [czText])
  const rawCycle = useMemo(() => {
    const n = parseIntSafe(cycleText, 1)
    return Math.min(6, Math.max(1, n))
  }, [cycleText])
  const kessenThrough = useMemo(() => {
    const n = parseIntSafe(kessenText)
    return Math.min(PREMISES.kessenThroughMax, n)
  }, [kessenText])

  const maxCycle = useMemo(
    () => effectiveMaxCycle(mode, shortened),
    [mode, shortened],
  )
  const cycle = useMemo(
    () => Math.min(maxCycle, Math.max(1, rawCycle)),
    [maxCycle, rawCycle],
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
    () => ({
      actualGames,
      czGames,
      cycle,
      mode,
      shortened,
      kessenThrough,
    }),
    [actualGames, czGames, cycle, mode, shortened, kessenThrough],
  )

  const result = useMemo(() => calculateValvrave2(input), [input])
  const premises = useMemo(() => buildValvrave2Premises(input), [input])

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

  const primaryLabel =
    result.primaryPath === 'bonus'
      ? 'ボーナス間表が有利'
      : result.primaryPath === 'cz'
        ? 'CZ999経路が有利'
        : result.primaryPath === 'cycle'
          ? '周期天井経路が有利'
          : '—'

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
        <h1 className="machine-name">Lパチスロ 革命機ヴァルヴレイヴ2</h1>
        <p className="tagline">
          実Gのボーナス間天井を主軸に、CZ999・周期・決戦スルーも比較
        </p>
      </header>

      <main className="panel">
        <label className="field">
          <span>実G数（ボーナス&AT間）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={1600}
            value={actualText}
            onChange={(e) => setActualText(e.target.value)}
            onBlur={() => setActualText(String(actualGames))}
          />
        </label>
        <p className="inline-note">
          データカウンターの実G。通常天井
          {PREMISES.bonusCeilingG.normal}G／短縮時
          {PREMISES.bonusCeilingG.shortened}G。
        </p>

        <label className="field">
          <span>CZ間G</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={1200}
            value={czText}
            onChange={(e) => setCzText(e.target.value)}
            onBlur={() => setCzText(String(czGames))}
          />
        </label>
        <p className="inline-note">
          CZ間天井{PREMISES.czCeilingG}G用。成功は約
          {(PREMISES.czSuccessRate * 100).toFixed(0)}%（非保証）。
        </p>

        <label className="field">
          <span>周期モード</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as PeriodMode)}
          >
            {MODE_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

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

        <label className="field">
          <span>短縮天井（設定変更）</span>
          <select
            value={shortened ? 'on' : 'off'}
            onChange={(e) => setShortened(e.target.value === 'on')}
          >
            <option value="off">なし（1500G／最大6周期）</option>
            <option value="on">あり（1000G／最大3周期）</option>
          </select>
        </label>

        <label className="field">
          <span>決戦ボーナス連続スルー</span>
          <select
            value={String(kessenThrough)}
            onChange={(e) => setKessenText(e.target.value)}
          >
            {Array.from({ length: PREMISES.kessenThroughMax + 1 }, (_, i) => (
              <option key={i} value={i}>
                {i}回
                {i >= PREMISES.kessenThroughMax
                  ? '（次回革命ボーナス濃厚）'
                  : ''}
              </option>
            ))}
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
            machineId="valvrave2"
            pureIncPerGame={PREMISES.pureInc}
          />
          <div className="result-row result-row-kaba">
            <span className="mode">主経路</span>
            <span>{primaryLabel}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">ボーナス間表の出玉率</span>
            <span>{formatRate(result.bonusPayoutRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ999経路の出玉率</span>
            <span>{formatRate(result.czPayoutRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">周期天井経路の出玉率</span>
            <span>{formatRate(result.cyclePayoutRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">初当たり期待獲得出玉（主経路）</span>
            <span>{formatNum(result.expectedWinMedals, 1)}枚</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">web情報表・等価期待値</span>
            <span>{formatYen(result.yenEv)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">web情報表・平均投資</span>
            <span>
              {result.investYen == null
                ? '—'
                : `${Math.round(result.investYen).toLocaleString('ja-JP')}円`}
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">天井到達率（ボーナス間表）</span>
            <span>
              {result.reachRate == null
                ? '—'
                : `${result.reachRate.toFixed(2)}%`}
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均G（主経路）</span>
            <span>{formatNum(result.avgGames, 1)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均投資（主経路）</span>
            <span>{formatNum(result.avgInvestment, 1)}枚</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">ボーナス間天井残り</span>
            <span>{formatNum(result.bonusRemaining, 0)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ間天井残り</span>
            <span>{formatNum(result.czRemaining, 0)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">周期天井までの目安G</span>
            <span>{formatNum(result.cycleRemainingEst, 0)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ経路・期待G</span>
            <span>{formatNum(result.czAvgGames, 1)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">周期経路・期待G</span>
            <span>{formatNum(result.cycleAvgGames, 1)}G</span>
          </div>
        </section>

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">
            設定1固定・出玉率＝ボーナス間表／CZ999／周期の高い方→閉店補正。表は暫定版。
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
            等価で約550Gからプラス、狙い目目安は約750G（web情報・通常）。短縮時は約400G。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

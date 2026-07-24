import { useMemo, useState } from 'react'
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
  buildValvravePremises,
  calculateValvrave,
} from '../machines/valvrave/calc'
import {
  CZ_MODE_IDS,
  CZ_MODE_LABEL,
  PREMISES,
  type CzMode,
} from '../machines/valvrave/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

const MODE_OPTIONS: { id: CzMode; label: string }[] = [
  { id: 'unknown', label: '不明（CZ残はモードA想定）' },
  ...CZ_MODE_IDS.map((id) => ({ id, label: CZ_MODE_LABEL[id] })),
]

export default function ValvravePage() {
  const [actualText, setActualText] = useState('520')
  const [displayText, setDisplayText] = useState('200')
  const [czMode, setCzMode] = useState<CzMode>('unknown')
  const [throughText, setThroughText] = useState('0')
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const actualGames = useMemo(() => parseIntSafe(actualText), [actualText])
  const displayGames = useMemo(() => parseIntSafe(displayText), [displayText])
  const throughCount = useMemo(() => {
    const n = parseIntSafe(throughText)
    return Math.min(PREMISES.czThroughMax, n)
  }, [throughText])

  const input = useMemo(
    () => ({ actualGames, displayGames, czMode, throughCount }),
    [actualGames, displayGames, czMode, throughCount],
  )

  const result = useMemo(() => calculateValvrave(input), [input])
  const premises = useMemo(() => buildValvravePremises(input), [input])

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
      : result.primaryPath === 'through'
        ? 'CZスルー経路が有利'
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
        <h1 className="machine-name">パチスロ 革命機ヴァルヴレイヴ</h1>
        <p className="tagline">
          実Gのボーナス間天井を主軸に、CZモード・スルーも確認
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
          データカウンター等の実G。天井は約{PREMISES.bonusCeilingG}
          G+α。出玉率はこの表が主軸。
        </p>

        <label className="field">
          <span>表示G数（CZ間）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={1200}
            value={displayText}
            onChange={(e) => setDisplayText(e.target.value)}
            onBlur={() => setDisplayText(String(displayGames))}
          />
        </label>
        <p className="inline-note">
          液晶左下の加算G。CZ残りの参考表示用（CZ間の出玉率表は未使用）。
        </p>

        <label className="field">
          <span>CZモード</span>
          <select
            value={czMode}
            onChange={(e) => setCzMode(e.target.value as CzMode)}
          >
            {MODE_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>CZスルー回数</span>
          <select
            value={String(throughCount)}
            onChange={(e) => setThroughText(e.target.value)}
          >
            {Array.from({ length: PREMISES.czThroughMax + 1 }, (_, i) => (
              <option key={i} value={i}>
                {i}回
                {i >= PREMISES.czThroughMax ? '（次回CZ成功確定）' : ''}
              </option>
            ))}
          </select>
        </label>
        <p className="inline-note">
          最大{PREMISES.czThroughMax}
          スルーで次回CZ成功確定。成功率
          {(PREMISES.czSuccessRate * 100).toFixed(0)}
          %・CZ間隔≈1/{PREMISES.czHitDenom}
          でスルー経路を近似し、ボーナス間表と比較。
        </p>

        <ClosingHoursField value={closingHours} onChange={setClosingHours} />

        <section className="results" aria-label="計算結果">
          <div className="results-head results-head-kaba">
            <span>項目</span>
            <span>値</span>
          </div>
          <ClosingCorrectionRows
            closing={closing}
            bonusLabel="AT"
            machineId="valvrave"
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
            <span className="mode">CZスルー経路の出玉率</span>
            <span>{formatRate(result.throughPayoutRate)}</span>
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
            <span>
              {formatNum(result.czRemaining, 0)}G（
              {CZ_MODE_LABEL[result.resolvedCzMode]}）
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">成功までの期待CZ回数</span>
            <span>{formatNum(result.expectedCzAttempts, 2)}回</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">スルー経路・期待G</span>
            <span>{formatNum(result.throughAvgGames, 1)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZスルー残り</span>
            <span>
              {result.throughCeilingReady
                ? '次回CZ成功確定'
                : `あと${result.throughRemaining}回で確定枠`}
            </span>
          </div>
        </section>

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">
            設定1固定・出玉率＝ボーナス間表とCZスルー近似の高い方→閉店補正。
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
            等価で約550Gからプラス、狙い目目安は約700G（web情報）。打ち出しは実Gを確認。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

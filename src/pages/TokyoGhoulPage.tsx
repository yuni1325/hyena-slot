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
  buildGhoulPremises,
  calculateGhoul,
} from '../machines/tokyo-ghoul/calc'
import {
  CZ_CEILING_LABEL,
  PREMISES,
  type CzCeilingKind,
} from '../machines/tokyo-ghoul/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

const CZ_OPTIONS: CzCeilingKind[] = [
  'normal600',
  'modeC500',
  'heavenPrep300',
  'heaven100',
  'reset200',
]

export default function TokyoGhoulPage() {
  const [actualText, setActualText] = useState('0')
  const [displayText, setDisplayText] = useState('0')
  const [czCeiling, setCzCeiling] = useState<CzCeilingKind>('normal600')
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const actualGames = useMemo(() => parseIntSafe(actualText), [actualText])
  const displayGames = useMemo(() => parseIntSafe(displayText), [displayText])

  const input = useMemo(
    () => ({ actualGames, displayGames, czCeiling }),
    [actualGames, displayGames, czCeiling],
  )

  const result = useMemo(() => calculateGhoul(input), [input])
  const premises = useMemo(() => buildGhoulPremises(input), [input])

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
    result.primaryPath === 'at'
      ? 'AT間（実G）が有利'
      : result.primaryPath === 'cz'
        ? 'CZ間（表示G）が有利'
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
        <h1 className="machine-name">L 東京喰種</h1>
        <p className="tagline">
          実GのAT天井と表示GのCZ天井、両方の距離から期待値を確認
        </p>
      </header>

      <main className="panel">
        <label className="field">
          <span>実G数（AT間）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={1300}
            value={actualText}
            onChange={(e) => setActualText(e.target.value)}
            onBlur={() => setActualText(String(actualGames))}
          />
        </label>
        <p className="inline-note">
          データカウンター等の実ゲーム数。スイカ加算は含まない。AT間天井1200G+α。
        </p>

        <label className="field">
          <span>表示G数（CZ間）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={700}
            value={displayText}
            onChange={(e) => setDisplayText(e.target.value)}
            onBlur={() => setDisplayText(String(displayGames))}
          />
        </label>
        <p className="inline-note">
          液晶の加算G（スイカ加算込み）。CZ間天井はモードで変動。
        </p>

        <label className="field">
          <span>CZ間天井（モード）</span>
          <select
            value={czCeiling}
            onChange={(e) => setCzCeiling(e.target.value as CzCeilingKind)}
          >
            {CZ_OPTIONS.map((id) => (
              <option key={id} value={id}>
                {CZ_CEILING_LABEL[id]}
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
            machineId="tokyo-ghoul"
            pureIncPerGame={PREMISES.pureInc}
          />
          <div className="result-row result-row-kaba">
            <span className="mode">初当たり（AT）期待獲得出玉</span>
            <span>{formatNum(result.expectedWinMedals, 1)}枚</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">採用経路</span>
            <span>{primaryLabel}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">AT間・出玉率（実G）</span>
            <span>{formatRate(result.atPayoutRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ間・出玉率（表示G）</span>
            <span>{formatRate(result.czPayoutRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">AT天井まで（実G）</span>
            <span>
              {result.atRemaining == null
                ? '—'
                : `${formatNum(result.atRemaining, 0)}G / ${result.atCeilingG}G`}
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ天井まで（表示G）</span>
            <span>
              {result.czRemaining == null
                ? '—'
                : `${formatNum(result.czRemaining, 0)}G / ${result.czCeilingG}G`}
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均G（採用経路）</span>
            <span>{formatNum(result.avgGames, 1)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均投資（採用経路）</span>
            <span>{formatNum(result.avgInvestment, 1)}枚</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">AT間・等価期待値</span>
            <span>{formatYen(result.atYenEv)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ間・等価期待値</span>
            <span>{formatYen(result.czYenEv)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">AT間・平均投資</span>
            <span>
              {result.atInvestYen == null
                ? '—'
                : `${Math.round(result.atInvestYen).toLocaleString('ja-JP')}円`}
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ間・平均投資</span>
            <span>
              {result.czInvestYen == null
                ? '—'
                : `${Math.round(result.czInvestYen).toLocaleString('ja-JP')}円`}
            </span>
          </div>
        </section>

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">
            設定1固定・AT/CZ終了即ヤメ／出玉率＝両経路の高い方→閉店補正
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
            実GはAT間1200G、表示GはCZ間（モード別）。通常C・天国系は専用表がないため、天井までの残りGが同じ通常600表の位置で近似（ゾーン優遇は未反映でやや保守）。スイカ加算はweb情報表側でも未考慮。出玉率は閉店余裕でさらに保守補正。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

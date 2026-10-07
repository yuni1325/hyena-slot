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
import { formatNum, formatYen } from '../lib/format'
import {
  buildLycorecoPremises,
  calculateLycoreco,
} from '../machines/lycoreco/calc'
import {
  PREMISES,
  SITUATION_CEILING,
  SITUATION_IDS,
  SITUATION_LABEL,
  type Situation,
} from '../machines/lycoreco/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

export default function LycorecoPage() {
  const [actualText, setActualText] = useState('400')
  const [situation, setSituation] = useState<Situation>('normal')
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const actualGames = useMemo(() => parseIntSafe(actualText), [actualText])
  const input = useMemo(
    () => ({ actualGames, situation }),
    [actualGames, situation],
  )
  const result = useMemo(() => calculateLycoreco(input), [input])
  const premises = useMemo(() => buildLycorecoPremises(input), [input])

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
        <h1 className="machine-name">スマスロ リコリス・リコイル</h1>
        <p className="tagline">AT間の実Gと前回状況から天井期待値を確認</p>
      </header>

      <main className="panel">
        <label className="field">
          <span>前回の状況</span>
          <select
            value={situation}
            onChange={(e) => setSituation(e.target.value as Situation)}
          >
            {SITUATION_IDS.map((id) => (
              <option key={id} value={id}>
                {SITUATION_LABEL[id]}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>実G数（AT間）</span>
          <input
            type="text"
            inputMode="numeric"
            value={actualText}
            onChange={(e) => {
              const v = e.target.value
              if (v === '' || /^\d+$/.test(v)) setActualText(v)
            }}
            onBlur={() =>
              setActualText(actualGames === 0 ? '' : String(actualGames))
            }
          />
        </label>
        <p className="inline-note">
          データカウンター想定の実G。天井 {SITUATION_CEILING[situation]}G+α。
          CZ間天井 {PREMISES.czCeiling.normal}G（短縮時
          {PREMISES.czCeiling.shortened}G）は別枠で到達しやすくなる要素。
        </p>
        <p className="inline-note">{PREMISES.zoneHint}</p>

        <ClosingHoursField value={closingHours} onChange={setClosingHours} />

        <section className="results" aria-label="計算結果">
          <div className="results-head results-head-kaba">
            <span>項目</span>
            <span>値</span>
          </div>
          <ClosingCorrectionRows
            closing={closing}
            bonusLabel="AT"
            machineId="lycoreco"
            pureIncPerGame={PREMISES.pureInc}
          />
          <div className="result-row result-row-kaba">
            <span className="mode">初当たり等価獲得（モデル）</span>
            <span>{formatNum(result.expectedWinMedals, 1)}枚</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">等価期待値</span>
            <span>{formatYen(result.yenEv)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均投資</span>
            <span>
              {result.investYen == null
                ? '—'
                : `${Math.round(result.investYen).toLocaleString('ja-JP')}円`}
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">天井到達率</span>
            <span>
              {result.reachRate == null
                ? '—'
                : `${result.reachRate.toFixed(2)}%`}
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均G</span>
            <span>{formatNum(result.avgGames, 1)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">天井残り</span>
            <span>{formatNum(result.remaining, 0)}G</span>
          </div>
        </section>

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">
            設定1固定。G数別の期待値表が未公開のため、公開出玉率2点に合わせた自前モデルで補間→閉店補正。
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
            通常は約300Gで損益分岐、狙い目は400G〜（106.1%）。リセット・駆け抜け後は約170G〜、上位CZ失敗後は0Gから。上位ラッシュ後の100G+αは捨てない。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

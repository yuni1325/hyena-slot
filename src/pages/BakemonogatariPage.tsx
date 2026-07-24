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
  buildBakePremises,
  calculateBake,
} from '../machines/bakemonogatari/calc'
import { PREMISES } from '../machines/bakemonogatari/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

export default function BakemonogatariPage() {
  const [actualText, setActualText] = useState('400')
  const [shortened, setShortened] = useState(false)
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const actualGames = useMemo(() => parseIntSafe(actualText), [actualText])
  const input = useMemo(
    () => ({ actualGames, shortened }),
    [actualGames, shortened],
  )
  const result = useMemo(() => calculateBake(input), [input])
  const premises = useMemo(() => buildBakePremises(input), [input])

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
        <h1 className="machine-name">スマスロ 化物語</h1>
        <p className="tagline">
          AT後の実Gとリセット有無からゲーム数天井の期待値を確認
        </p>
      </header>

      <main className="panel">
        <label className="field">
          <span>実G数（AT後）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={1100}
            value={actualText}
            onChange={(e) => setActualText(e.target.value)}
            onBlur={() => setActualText(String(actualGames))}
          />
        </label>
        <p className="inline-note">
          「夢の時間ヲ終わラセルな」抜け後の実G。通常天井
          {PREMISES.ceilingG.normal}G／短縮時
          {PREMISES.ceilingG.shortened}G。
        </p>

        <label className="field">
          <span>短縮天井（設定変更）</span>
          <select
            value={shortened ? 'on' : 'off'}
            onChange={(e) => setShortened(e.target.value === 'on')}
          >
            <option value="off">なし（AT後・1000G）</option>
            <option value="on">あり（設定変更・600G）</option>
          </select>
        </label>
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
            machineId="bakemonogatari"
            pureIncPerGame={PREMISES.pureInc}
          />
          <div className="result-row result-row-kaba">
            <span className="mode">初当たり（AT）期待獲得出玉</span>
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
            <span className="mode">天井到達率</span>
            <span>
              {result.reachRate == null
                ? '—'
                : `${result.reachRate.toFixed(2)}%`}
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均G（表）</span>
            <span>{formatNum(result.avgGames, 1)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均投資（表）</span>
            <span>{formatNum(result.avgInvestment, 1)}枚</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">天井残り</span>
            <span>{formatNum(result.remaining, 0)}G</span>
          </div>
        </section>

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">
            設定1固定・出玉率＝web情報ゲーム数天井表→閉店補正。ゾーン・解呪連は表平均込み。
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
            等価で約400Gからプラス、狙い目目安は約600G（AT後）。短縮時は約250G。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

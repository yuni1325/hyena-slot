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
  buildMagirecoPremises,
  calculateMagireco,
} from '../machines/magireco/calc'
import { PREMISES } from '../machines/magireco/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

export default function MagirecoPage() {
  const [actualText, setActualText] = useState('350')
  const [shortened, setShortened] = useState(false)
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const actualGames = useMemo(() => parseIntSafe(actualText), [actualText])
  const input = useMemo(
    () => ({ actualGames, shortened }),
    [actualGames, shortened],
  )
  const result = useMemo(() => calculateMagireco(input), [input])
  const premises = useMemo(() => buildMagirecoPremises(input), [input])

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
        <h1 className="machine-name">スマスロ マギアレコード</h1>
        <p className="tagline">
          ボーナス間の実Gとリセット有無から天井期待値を確認
        </p>
      </header>

      <main className="panel">
        <label className="field">
          <span>実G数（ボーナス間）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={700}
            value={actualText}
            onChange={(e) => setActualText(e.target.value)}
            onBlur={() => setActualText(String(actualGames))}
          />
        </label>
        <p className="inline-note">
          データカウンター想定の実G。通常天井 約
          {PREMISES.ceilingG.normal}G（
          {PREMISES.ceilingPt.normal}pt+α）／短縮時 約
          {PREMISES.ceilingG.shortened}G（最大
          {PREMISES.ceilingPt.shortened}pt+α）。1G≒1.5pt換算。
        </p>

        <label className="field">
          <span>短縮天井（設定変更）</span>
          <select
            value={shortened ? 'on' : 'off'}
            onChange={(e) => setShortened(e.target.value === 'on')}
          >
            <option value="off">
              なし（通常・約{PREMISES.ceilingG.normal}G）
            </option>
            <option value="on">
              あり（設定変更・約{PREMISES.ceilingG.shortened}G）
            </option>
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
            machineId="magireco"
            pureIncPerGame={PREMISES.pureInc}
          />
          <div className="result-row result-row-kaba">
            <span className="mode">初当たり期待獲得出玉</span>
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
            設定1固定・出玉率＝web情報天井表→閉店補正。魔法少女モード・穢れは未反映。
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
            等価で約250Gからプラス、狙い目目安は約350G（通常）。短縮時は約200G。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

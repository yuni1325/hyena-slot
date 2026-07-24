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
  buildEnen2Premises,
  calculateEnen2,
} from '../machines/enen2/calc'
import {
  ENEN_MODE_IDS,
  ENEN_MODE_LABEL,
  PREMISES,
  type EnenMode,
} from '../machines/enen2/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

const MODE_OPTIONS: { id: EnenMode; label: string }[] = [
  { id: 'unknown', label: '不明（ボーナス間表のみ）' },
  ...ENEN_MODE_IDS.map((id) => ({ id, label: ENEN_MODE_LABEL[id] })),
]

export default function Enen2Page() {
  const [actualText, setActualText] = useState('310')
  const [mode, setMode] = useState<EnenMode>('unknown')
  const [shortened, setShortened] = useState(false)
  const [trapText, setTrapText] = useState('0')
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const actualGames = useMemo(() => parseIntSafe(actualText), [actualText])
  const trapThrough = useMemo(() => {
    const n = parseIntSafe(trapText)
    return Math.min(PREMISES.trapThroughMax, n)
  }, [trapText])

  const input = useMemo(
    () => ({ actualGames, mode, shortened, trapThrough }),
    [actualGames, mode, shortened, trapThrough],
  )

  const result = useMemo(() => calculateEnen2(input), [input])
  const premises = useMemo(() => buildEnen2Premises(input), [input])

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
      : result.primaryPath === 'mode'
        ? 'モード天井経路が有利'
        : result.primaryPath === 'trap'
          ? '伝導者スルー（SP）経路が有利'
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
        <h1 className="machine-name">Lパチスロ 炎炎ノ消防隊2</h1>
        <p className="tagline">
          実Gのボーナス間天井を主軸に、モード天井・伝導者スルーも比較
        </p>
      </header>

      <main className="panel">
        <label className="field">
          <span>実G数（ボーナス間）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={900}
            value={actualText}
            onChange={(e) => setActualText(e.target.value)}
            onBlur={() => setActualText(String(actualGames))}
          />
        </label>
        <p className="inline-note">
          通常天井{PREMISES.bonusCeilingG.normal}G／短縮時
          {PREMISES.bonusCeilingG.shortened}G。ゾーン目安は88・250・350・450・650・750G。
        </p>

        <label className="field">
          <span>モード</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as EnenMode)}
          >
            {MODE_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
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
            <option value="off">なし（850G）</option>
            <option value="on">あり（650G）</option>
          </select>
        </label>

        <label className="field">
          <span>伝導者の罠スルー</span>
          <select
            value={String(trapThrough)}
            onChange={(e) => setTrapText(e.target.value)}
          >
            {Array.from({ length: PREMISES.trapThroughMax + 1 }, (_, i) => (
              <option key={i} value={i}>
                {i}回
                {i >= PREMISES.trapThroughMax
                  ? '（次回SPボーナス濃厚）'
                  : ''}
              </option>
            ))}
          </select>
        </label>
        <p className="inline-note">
          5スルー後の次回ボーナスはSP濃厚。成功率約
          {(PREMISES.trapSuccessRate * 100).toFixed(0)}%。炎炎ループ間天井（
          {PREMISES.loopCeilingG.normal}G）は表なしのため参考表示のみ。
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
            machineId="enen2"
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
            <span className="mode">モード天井経路の出玉率</span>
            <span>{formatRate(result.modePayoutRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">伝導者スルー（SP）経路</span>
            <span>{formatRate(result.trapPayoutRate)}</span>
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
            <span className="mode">モード天井残り</span>
            <span>
              {formatNum(result.modeRemaining, 0)}G（
              {ENEN_MODE_LABEL[result.resolvedMode]}）
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">伝導者スルー</span>
            <span>
              {result.trapThroughReady
                ? '次回SPボーナス濃厚'
                : `あと${result.trapRemaining}回で確定枠`}
            </span>
          </div>
        </section>

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">
            設定1固定・出玉率＝ボーナス間表／モード写像／伝導者SPの高い方→閉店補正。
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
            等価で約350Gからプラス、狙い目目安は約500G（web情報・通常）。短縮時は約350G。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

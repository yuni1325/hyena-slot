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
} from '../lib/format'
import {
  buildKabaneriPremises,
  calculateKabaneri,
  clampCycleToDisplay,
  cycleBoundsForDisplay,
} from '../machines/kabaneri-unato/calc'
import { PREMISES } from '../machines/kabaneri-unato/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

export default function KabaneriUnatoPage() {
  const [displayText, setDisplayText] = useState('0')
  const [cycleText, setCycleText] = useState('1')
  const [shortened, setShortened] = useState(false)
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const displayGames = useMemo(() => parseIntSafe(displayText), [displayText])
  const rawCycle = useMemo(() => {
    const n = parseIntSafe(cycleText, 1)
    return Math.min(6, Math.max(1, n))
  }, [cycleText])

  const { minCycle, maxCycle } = useMemo(
    () => cycleBoundsForDisplay(displayGames, shortened),
    [displayGames, shortened],
  )

  const cycleOptions = useMemo(() => {
    const list: number[] = []
    for (let c = minCycle; c <= maxCycle; c++) list.push(c)
    return list
  }, [minCycle, maxCycle])

  const cycle = useMemo(
    () => clampCycleToDisplay(rawCycle, displayGames, shortened),
    [rawCycle, displayGames, shortened],
  )

  useEffect(() => {
    if (cycle !== rawCycle) setCycleText(String(cycle))
  }, [cycle, rawCycle])

  const input = useMemo(
    () => ({ displayGames, cycle, shortened }),
    [displayGames, cycle, shortened],
  )

  const result = useMemo(() => calculateKabaneri(input), [input])
  const premises = useMemo(() => buildKabaneriPremises(input), [input])

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

  const cycleHint =
    minCycle > 1
      ? `選択可能: ${minCycle}〜${maxCycle}周期目（表示${displayGames >= 300 ? '300' : '150'}G以上は${minCycle}周期目以降／150G→2周期・300G→3周期へ強制）`
      : shortened
        ? `選択可能: ${minCycle}〜${maxCycle}周期目（短縮時は最大4周期）`
        : null

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
        <h1 className="machine-name">スマスロ甲鉄城のカバネリ 海門決戦</h1>
        <p className="tagline">表示G・周期・短縮から天井狙いの期待値を確認</p>
      </header>

      <main className="panel">
        <label className="field">
          <span>表示G数</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            value={displayText}
            onChange={(e) => setDisplayText(e.target.value)}
            onBlur={() => setDisplayText(String(displayGames))}
          />
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

        {cycleHint && <p className="inline-note">{cycleHint}</p>}

        <label className="field">
          <span>短縮天井</span>
          <select
            value={shortened ? 'on' : 'off'}
            onChange={(e) => setShortened(e.target.value === 'on')}
          >
            <option value="off">なし（996G / 6周期）</option>
            <option value="on">あり（596G / 4周期）</option>
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
            bonusLabel="ST"
            machineId="kabaneri-unato"
            pureIncPerGame={PREMISES.pureInc}
          />
          <div className="result-row result-row-kaba">
            <span className="mode">初当たり（ST）期待獲得出玉</span>
            <span>{formatNum(result.expectedWinMedals, 1)}枚</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">web情報表ベース</span>
            <span>{formatRate(result.tablePayoutRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">周期補正</span>
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
          <div className="result-row result-row-kaba">
            <span className="mode">周期モデル・ST期待G</span>
            <span>{formatNum(result.modelGamesToSt, 1)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">G数天井残り</span>
            <span>{formatNum(result.remainingByG, 0)}G</span>
          </div>
          {result.remainingToCycleG != null && (
            <div className="result-row result-row-kaba">
              <span className="mode">
                周期規定Gまで（{cycle === 1 ? '150' : cycle === 2 ? '300' : '—'}
                ）
              </span>
              <span>{formatNum(result.remainingToCycleG, 0)}G</span>
            </div>
          )}
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

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">
            設定1固定・ST終了でヤメ／出玉率＝web情報表＋周期補正→閉店補正
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
            期待出玉率＝web情報表ベース＋周期補正を、閉店までの余裕で保守補正。分子は表準拠の約603枚。周期モデル差は50%だけ反映。規定G直前の周期当選は減衰。BIG:REG=1:1（REGはST約20%）。天井到達時のみエピソード＝ST確定。表示Gは150/300で周期下限を強制（低Gの高周期はポイント先行として許可）。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

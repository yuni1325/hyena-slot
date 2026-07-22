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
  buildOtome5Premises,
  calculateOtome5,
  clampCycle,
  effectiveMaxCycle,
  type Otome5ScenarioResult,
} from '../machines/otome5/calc'
import { PREMISES } from '../machines/otome5/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

export default function Otome5Page() {
  const [actualText, setActualText] = useState('0')
  const [displayText, setDisplayText] = useState('0')
  const [cycleText, setCycleText] = useState('1')
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

  const maxCycle = useMemo(() => effectiveMaxCycle(shortened), [shortened])

  const cycle = useMemo(
    () => clampCycle(rawCycle, shortened),
    [rawCycle, shortened],
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
    () => ({ actualGames, displayGames, cycle, shortened }),
    [actualGames, displayGames, cycle, shortened],
  )

  const result = useMemo(() => calculateOtome5(input), [input])
  const premises = useMemo(() => buildOtome5Premises(input), [input])

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

  const withClosing = useMemo(() => {
    const mapRow = (s: Otome5ScenarioResult) => {
      const c = applyClosingCorrection({
        hoursUntilClose: closingHours,
        avgGamesToHit: s.avgGames,
        expectedWinMedals: result.expectedWinMedals,
        pureIncPerGame: PREMISES.pureInc,
        rawPayoutRate: s.expectedPayoutRate,
      })
      return {
        ...s,
        closedRate: c.correctedPayoutRate,
      }
    }
    return {
      byTable: result.byTable.map(mapRow),
      byMode: result.byMode.map(mapRow),
    }
  }, [closingHours, result])

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
        <h1 className="machine-name">
          L戦国乙女5 業火を穿つ宿焔の双刃
        </h1>
        <p className="tagline">
          実G・表示G・周期から天井狙いの期待値を確認
        </p>
      </header>

      <main className="panel">
        <label className="field">
          <span>実G数</span>
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
          AT間の実ゲーム数。強カワチャンスによる加算は含まない（天井カウント対象）。
        </p>

        <label className="field">
          <span>表示G数</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={550}
            value={displayText}
            onChange={(e) => setDisplayText(e.target.value)}
            onBlur={() => setDisplayText(String(displayGames))}
          />
        </label>
        <p className="inline-note">
          液晶左部の当該周期内ゲーム数（加算込み）。1周期最大500G+α。
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
        {shortened && (
          <p className="inline-note">
            選択可能: 1〜{maxCycle}周期目（短縮時は最大4）
          </p>
        )}

        <label className="field">
          <span>短縮天井</span>
          <select
            value={shortened ? 'on' : 'off'}
            onChange={(e) => setShortened(e.target.value === 'on')}
          >
            <option value="off">なし（実G999 / 最大6周期）</option>
            <option value="on">あり（実G650 / 最大4周期）</option>
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
            machineId="otome5"
            pureIncPerGame={PREMISES.pureInc}
          />
          <div className="result-row result-row-kaba">
            <span className="mode">初当たり（AT）期待獲得出玉</span>
            <span>{formatNum(result.expectedWinMedals, 1)}枚</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">なな徹表ベース</span>
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
            <span className="mode">なな徹表・平均G</span>
            <span>{formatNum(result.tableAvgGames, 1)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">周期モデル・AT期待G</span>
            <span>{formatNum(result.modelGamesToAt, 1)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">実G天井残り</span>
            <span>{formatNum(result.remainingByG, 0)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">当該周期・表示G残り目安</span>
            <span>{formatNum(result.remainingInCycleDisplay, 0)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">なな徹表・等価期待値</span>
            <span>{formatYen(result.tableYenEv)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">なな徹表・平均投資</span>
            <span>
              {result.tableInvestYen == null
                ? '—'
                : `${Math.round(result.tableInvestYen).toLocaleString('ja-JP')}円`}
            </span>
          </div>
        </section>

        <h2 className="results-section-title">周期テーブル別（閉店補正後）</h2>
        <p className="inline-note">
          1周期目は引き戻し確定で残りを計算。天井周期のみテーブル差。現在周期がテーブル天井超なら到達不可。
        </p>
        <section className="results" aria-label="周期テーブル別">
          <div className="results-head results-head-scenario">
            <span>テーブル</span>
            <span>出玉率</span>
            <span>平均G</span>
            <span>周期天井</span>
          </div>
          {withClosing.byTable.map((r) => (
            <div
              key={r.id}
              className={`result-row result-row-scenario tone-${rateTone(r.closedRate)}`}
            >
              <span className="mode">{r.label}</span>
              <span className="rate">{formatRate(r.closedRate)}</span>
              <span>{formatNum(r.avgGames, 1)}G</span>
              <span>{r.maxCycle}周期</span>
            </div>
          ))}
        </section>

        <h2 className="results-section-title">周期モード別（閉店補正後）</h2>
        <p className="inline-note">
          当該周期残り＝モード上限−表示G。以降周期は同モード平均到達で継続想定。
        </p>
        <section className="results" aria-label="周期モード別">
          <div className="results-head results-head-scenario">
            <span>モード</span>
            <span>出玉率</span>
            <span>平均G</span>
            <span>周期残り</span>
          </div>
          {withClosing.byMode.map((r) => (
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
            設定1固定・AT終了即ヤメ／出玉率＝なな徹表＋周期補正→閉店補正（暫定表）
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
            1周期目の主表示・テーブル別は引き戻し確定（最大200G）。モード別一覧は各モード仮定の内訳。なな徹期待値は暫定版。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

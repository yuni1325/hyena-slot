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
import {
  formatNum,
  formatRate,
  formatYen,
  rateTone,
} from '../lib/format'
import {
  buildYoshimunePremises,
  calculateYoshimune,
} from '../machines/shinuchi-yoshimune/calc'
import {
  CZ_MODE_IDS,
  CZ_MODE_LABEL,
  CZ_MODE_MAX_CYCLE,
  PREMISES,
  SITUATION_LABEL,
  type CzModeId,
  type Situation,
} from '../machines/shinuchi-yoshimune/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

export default function ShinuchiYoshimunePage() {
  const [atText, setAtText] = useState('447')
  const [czText, setCzText] = useState('0')
  const [cycleText, setCycleText] = useState('1')
  const [situation, setSituation] = useState<Situation>('normal')
  const [czMode, setCzMode] = useState<CzModeId>('A')
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const atGames = useMemo(() => parseIntSafe(atText), [atText])
  const czGames = useMemo(() => parseIntSafe(czText), [czText])
  const cycle = useMemo(() => Math.max(1, parseIntSafe(cycleText, 1)), [cycleText])

  const input = useMemo(
    () => ({ atGames, czGames, cycle, situation, czMode }),
    [atGames, czGames, cycle, situation, czMode],
  )

  const result = useMemo(() => calculateYoshimune(input), [input])
  const premises = useMemo(() => buildYoshimunePremises(input), [input])

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
          avgGamesToHit: row.avgGamesToAtViaCz,
          expectedWinMedals: result.expectedWinMedals,
          pureIncPerGame: PREMISES.pureInc,
          rawPayoutRate: row.czPayoutRate,
        })
        return { ...row, closedRate: c.correctedPayoutRate }
      }),
    [closingHours, result],
  )

  const primaryLabel =
    result.primaryPath === 'at'
      ? 'AT間が有利'
      : result.primaryPath === 'cz'
        ? 'CZ／周期経由が有利'
        : '—'

  const maxCycleForMode = CZ_MODE_MAX_CYCLE[czMode]

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
        <h1 className="machine-name">真打 吉宗</h1>
        <p className="tagline">
          AT間G・CZ間G・周期・モード・状況から期待値を確認
        </p>
      </header>

      <main className="panel">
        <label className="field">
          <span>現在のG数（AT間）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={1600}
            value={atText}
            onChange={(e) => setAtText(e.target.value)}
            onBlur={() => setAtText(String(atGames))}
          />
        </label>
        <p className="inline-note">
          通常1500G／リセット1000G／真BIG後700GでAT。
        </p>

        <label className="field">
          <span>現在のG数（CZ間）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={1100}
            value={czText}
            onChange={(e) => setCzText(e.target.value)}
            onBlur={() => setCzText(String(czGames))}
          />
        </label>
        <p className="inline-note">CZ間1000GでCZ。周期天井との近い方で近似。</p>

        <label className="field">
          <span>現在周期</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={6}
            value={cycleText}
            onChange={(e) => setCycleText(e.target.value)}
            onBlur={() =>
              setCycleText(
                String(Math.min(maxCycleForMode, Math.max(1, cycle))),
              )
            }
          />
        </label>

        <label className="field">
          <span>CZモード</span>
          <select
            value={czMode}
            onChange={(e) => setCzMode(e.target.value as CzModeId)}
          >
            {CZ_MODE_IDS.map((id) => (
              <option key={id} value={id}>
                {CZ_MODE_LABEL[id]}
              </option>
            ))}
          </select>
        </label>
        <p className="inline-note">
          不明時は通常A想定。通常Cは周期到達でAT直撃。下にモード別一覧あり。
        </p>

        <label className="field">
          <span>状況</span>
          <select
            value={situation}
            onChange={(e) => setSituation(e.target.value as Situation)}
          >
            {(Object.keys(SITUATION_LABEL) as Situation[]).map((id) => (
              <option key={id} value={id}>
                {SITUATION_LABEL[id]}
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
            machineId="shinuchi-yoshimune"
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
            <span className="mode">AT間・出玉率（補正前）</span>
            <span>{formatRate(result.atPayoutRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ／周期・出玉率（補正前）</span>
            <span>{formatRate(result.czPayoutRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">AT間・等価期待値</span>
            <span>{formatYen(result.atYenEv)}</span>
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
            <span className="mode">AT間・天井到達率</span>
            <span>{formatRate(result.atReachRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">AT天井まで</span>
            <span>
              {formatNum(result.atRemaining, 0)}G / {result.atCeilingG}G
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ間天井まで</span>
            <span>
              {formatNum(result.czGamesRemaining, 0)}G /{' '}
              {result.czGamesCeilingG}G
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">周期天井まで</span>
            <span>
              残り{formatNum(result.cycleRemaining, 0)}周期（最大
              {result.maxCycle}）
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZまで（近い方・目安G）</span>
            <span>{formatNum(result.czEffectiveRemaining, 0)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均G（採用経路）</span>
            <span>{formatNum(result.avgGames, 1)}G</span>
          </div>
        </section>

        <h2 className="results-section-title">
          モード別・CZ／周期経由（閉店補正後）
        </h2>
        <p className="inline-note">
          周期・CZ間G固定でモードだけ変えた内訳。1周期≈
          {PREMISES.avgGamesPerCycle}G目安。通常Cは到達でAT直撃。
        </p>
        <section className="results" aria-label="モード別">
          <div className="results-head results-head-scenario">
            <span>モード</span>
            <span>出玉率</span>
            <span>平均G</span>
            <span>周期残</span>
          </div>
          {modeRows.map((r) => (
            <div
              key={r.id}
              className={`result-row result-row-scenario tone-${rateTone(r.closedRate)}`}
            >
              <span className="mode">{r.label}</span>
              <span className="rate">{formatRate(r.closedRate)}</span>
              <span>{formatNum(r.avgGamesToAtViaCz, 1)}G</span>
              <span>{formatNum(r.cycleRemaining, 0)}</span>
            </div>
          ))}
        </section>

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">
            設定1固定・AT表とCZ/周期近似の高い方→閉店補正。夜回りptは未入力。
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
            狙い目目安（web情報・等価）: 通常650G〜／リセット350G〜／真BIG後200G〜。周期は5周期目〜。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

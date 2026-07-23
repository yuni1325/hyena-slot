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
  buildKokakuPremises,
  calculateKokaku,
} from '../machines/kokaku/calc'
import {
  PREMISES,
  SITUATION_LABEL,
  ZEN_MODE_IDS_NORMAL,
  ZEN_MODE_LABEL,
  type Situation,
  type ZenModeId,
} from '../machines/kokaku/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

export default function KokakuPage() {
  const [atText, setAtText] = useState('219')
  const [displayText, setDisplayText] = useState('0')
  const [situation, setSituation] = useState<Situation>('normal')
  const [zenMode, setZenMode] = useState<ZenModeId>('A')
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const atGames = useMemo(() => parseIntSafe(atText), [atText])
  const displayGames = useMemo(() => parseIntSafe(displayText), [displayText])

  const input = useMemo(
    () => ({ atGames, displayGames, situation, zenMode }),
    [atGames, displayGames, situation, zenMode],
  )

  const result = useMemo(() => calculateKokaku(input), [input])
  const premises = useMemo(() => buildKokakuPremises(input), [input])

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
        ? 'CZ経由（表示G）が有利'
        : '—'

  const modeSelectDisabled = situation !== 'normal'

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
        <h1 className="machine-name">スマスロ 攻殻機動隊</h1>
        <p className="tagline">
          AT間G・表示G・殲滅モード・状況から期待値を確認
        </p>
      </header>

      <main className="panel">
        <label className="field">
          <span>現在のG数（AT間）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={1100}
            value={atText}
            onChange={(e) => setAtText(e.target.value)}
            onBlur={() => setAtText(String(atGames))}
          />
        </label>
        <p className="inline-note">
          データカウンター想定。通常999G／リセット699GでAT。
        </p>

        <label className="field">
          <span>表示G数（CZ間・液晶左下）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={600}
            value={displayText}
            onChange={(e) => setDisplayText(e.target.value)}
            onBlur={() => setDisplayText(String(displayGames))}
          />
        </label>
        <p className="inline-note">
          殲滅モード別のCZ天井まで。到達で殲滅ZONE→CZ。
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

        <label className="field">
          <span>殲滅モード</span>
          <select
            value={zenMode}
            disabled={modeSelectDisabled}
            onChange={(e) => setZenMode(e.target.value as ZenModeId)}
          >
            {ZEN_MODE_IDS_NORMAL.map((id) => (
              <option key={id} value={id}>
                {ZEN_MODE_LABEL[id]}
              </option>
            ))}
          </select>
        </label>
        <p className="inline-note">
          {modeSelectDisabled
            ? 'リセット／白の境界失敗時はCZ天井が状況側で固定されます。モード不明時は通常A想定＋下のモード別一覧。'
            : '不明時は通常A想定。下にモード別一覧あり。'}
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
            machineId="kokaku"
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
            <span className="mode">CZ経由・出玉率（補正前）</span>
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
            <span className="mode">CZ天井まで</span>
            <span>
              {formatNum(result.czRemaining, 0)}G / {result.czCeilingG}G
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均G（採用経路）</span>
            <span>{formatNum(result.avgGames, 1)}G</span>
          </div>
        </section>

        {situation === 'normal' && (
          <>
            <h2 className="results-section-title">
              モード別・CZ経由（閉店補正後）
            </h2>
            <p className="inline-note">
              表示G固定で殲滅モードだけ変えた内訳。CZ平均1/238＋S.A.M.成功率52.6%。
            </p>
            <section className="results" aria-label="モード別">
              <div className="results-head results-head-scenario">
                <span>モード</span>
                <span>出玉率</span>
                <span>平均G</span>
                <span>CZ残り</span>
              </div>
              {modeRows.map((r) => (
                <div
                  key={r.id}
                  className={`result-row result-row-scenario tone-${rateTone(r.closedRate)}`}
                >
                  <span className="mode">{r.label}</span>
                  <span className="rate">{formatRate(r.closedRate)}</span>
                  <span>{formatNum(r.avgGamesToAtViaCz, 1)}G</span>
                  <span>{formatNum(r.displayRemaining, 0)}G</span>
                </div>
              ))}
            </section>
          </>
        )}

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">
            設定1固定・AT表とCZ近似の高い方→閉店補正。殲滅ポイントは未入力。
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
            狙い目目安（web情報・等価）: 通常450G〜／リセット150G〜。AT後は通常D約50%。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

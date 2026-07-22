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
import { buildSao2Premises, calculateSao2 } from '../machines/sao2/calc'
import {
  CZ_MODE_IDS,
  CZ_MODE_LABEL,
  PREMISES,
  type CzModeId,
} from '../machines/sao2/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

export default function Sao2Page() {
  const [atText, setAtText] = useState('0')
  const [czText, setCzText] = useState('0')
  const [displayText, setDisplayText] = useState('0')
  const [czMode, setCzMode] = useState<CzModeId>('A')
  const [czShortened, setCzShortened] = useState(false)
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const atGames = useMemo(() => parseIntSafe(atText), [atText])
  const czGames = useMemo(() => parseIntSafe(czText), [czText])
  const displayGames = useMemo(() => parseIntSafe(displayText), [displayText])

  const input = useMemo(
    () => ({
      atGames,
      czGames,
      displayGames,
      czMode,
      czShortened,
    }),
    [atGames, czGames, displayGames, czMode, czShortened],
  )

  const result = useMemo(() => calculateSao2(input), [input])
  const premises = useMemo(() => buildSao2Premises(input), [input])

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
      ? 'AT間（実G）が有利'
      : result.primaryPath === 'cz'
        ? 'CZ経由（実G/表示G）が有利'
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
        <h1 className="machine-name">スロット ソードアート・オンラインⅡ</h1>
        <p className="tagline">
          AT間実GとCZ間（実G・表示G・モード）から期待値を確認
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
            value={atText}
            onChange={(e) => setAtText(e.target.value)}
            onBlur={() => setAtText(String(atGames))}
          />
        </label>
        <p className="inline-note">AT間天井1200G+α。なな徹表の打ち出しG。</p>

        <label className="field">
          <span>実G数（CZ間）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={600}
            value={czText}
            onChange={(e) => setCzText(e.target.value)}
            onBlur={() => setCzText(String(czGames))}
          />
        </label>
        <p className="inline-note">
          CZ間の実ゲーム数。通常499G+α／短縮256G+αでCZ。
        </p>

        <label className="field">
          <span>表示G数（液晶）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={900}
            value={displayText}
            onChange={(e) => setDisplayText(e.target.value)}
            onBlur={() => setDisplayText(String(displayGames))}
          />
        </label>
        <p className="inline-note">
          液晶の加算G。モード別天井（A/B800・C650・D350・天国100）。
        </p>

        <label className="field">
          <span>内部モード（液晶CZ天井）</span>
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

        <label className="field">
          <span>CZ間実G短縮</span>
          <select
            value={czShortened ? 'on' : 'off'}
            onChange={(e) => setCzShortened(e.target.value === 'on')}
          >
            <option value="off">なし（499G+α）</option>
            <option value="on">あり（256G+α・設定変更／初回上位CZ失敗後など）</option>
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
            machineId="sao2"
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
            <span className="mode">AT天井まで</span>
            <span>
              {formatNum(result.atRemaining, 0)}G / {result.atCeilingG}G
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ実G天井まで</span>
            <span>
              {formatNum(result.czActualRemaining, 0)}G /{' '}
              {result.czActualCeilingG}G
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ液晶天井まで</span>
            <span>
              {formatNum(result.czDisplayRemaining, 0)}G /{' '}
              {result.czDisplayCeilingG}G
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZまで（近い方）</span>
            <span>{formatNum(result.czEffectiveRemaining, 0)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均G（採用経路）</span>
            <span>{formatNum(result.avgGames, 1)}G</span>
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
        </section>

        <h2 className="results-section-title">モード別・CZ経由（閉店補正後）</h2>
        <p className="inline-note">
          液晶天井だけ変えた内訳。平均CZ1/238.4と天井の競合＋成功率55%。失敗後はフル天井リセット。
        </p>
        <section className="results" aria-label="モード別">
          <div className="results-head results-head-scenario">
            <span>モード</span>
            <span>出玉率</span>
            <span>平均G</span>
            <span>液晶残り</span>
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

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">
            設定1固定・AT終了即ヤメ／AT間表とCZ近似の高い方→閉店補正
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
            なな徹AT間表はCZ天井・モード未考慮の暫定版。CZ経路は公表CZ確率で途中当選を平均化し、シューティングチャージやバレット個数は個別には見ていない。天国まで転落なし。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

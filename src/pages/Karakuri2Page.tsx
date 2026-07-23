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
  buildKarakuri2Premises,
  calculateKarakuri2,
} from '../machines/karakuri2/calc'
import {
  MODE_IDS,
  MODE_LABEL,
  PREMISES,
  SITUATION_LABEL,
  type ModeId,
  type Situation,
} from '../machines/karakuri2/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

function primaryPathLabel(
  path: ReturnType<typeof calculateKarakuri2>['primaryPath'],
): string {
  switch (path) {
    case 'czActual':
      return 'CZ実G天井が有利'
    case 'display':
      return '液晶＋モードが有利'
    case 'through':
      return 'CZスルー天井が有利'
    case 'at':
      return 'AT天井が有利'
    default:
      return '—'
  }
}

export default function Karakuri2Page() {
  const [actualText, setActualText] = useState('314')
  const [displayText, setDisplayText] = useState('0')
  const [throughText, setThroughText] = useState('0')
  const [situation, setSituation] = useState<Situation>('normal')
  const [mode, setMode] = useState<ModeId>('A')
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const actualGames = useMemo(() => parseIntSafe(actualText), [actualText])
  const displayGames = useMemo(() => parseIntSafe(displayText), [displayText])
  const throughCount = useMemo(
    () => Math.min(4, parseIntSafe(throughText)),
    [throughText],
  )

  const input = useMemo(
    () => ({ actualGames, displayGames, situation, mode, throughCount }),
    [actualGames, displayGames, situation, mode, throughCount],
  )

  const result = useMemo(() => calculateKarakuri2(input), [input])
  const premises = useMemo(() => buildKarakuri2Premises(input), [input])

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
          avgGamesToHit: row.avgGames,
          expectedWinMedals:
            row.id === 'C' || row.id === 'D'
              ? PREMISES.atWinMedals
              : PREMISES.czWinMedals,
          pureIncPerGame: PREMISES.pureInc,
          rawPayoutRate: row.payoutRate,
        })
        return { ...row, closedRate: c.correctedPayoutRate }
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
        <h1 className="machine-name">Lからくりサーカス2</h1>
        <p className="tagline">
          実G・表示G・モード・スルー・状況から期待値を確認
        </p>
      </header>

      <main className="panel">
        <label className="field">
          <span>現在の実G数</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={2500}
            value={actualText}
            onChange={(e) => setActualText(e.target.value)}
            onBlur={() => setActualText(String(actualGames))}
          />
        </label>
        <p className="inline-note">
          CZ実天井{PREMISES.czActualCeiling}G／AT天井{PREMISES.atCeiling}
          Gの軸。web情報表の主入力。
        </p>

        <label className="field">
          <span>現在の表示G数（液晶）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={1200}
            value={displayText}
            onChange={(e) => setDisplayText(e.target.value)}
            onBlur={() => setDisplayText(String(displayGames))}
          />
        </label>
        <p className="inline-note">
          モード別液晶天井との残り。実G残りとの近い方でCZ到達を近似。
        </p>

        <label className="field">
          <span>内部モード</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as ModeId)}
          >
            {MODE_IDS.map((id) => (
              <option key={id} value={id}>
                {MODE_LABEL[id]}
              </option>
            ))}
          </select>
        </label>
        <p className="inline-note">
          不明時は通常A想定。Cは到達AT、Dは劇場ジャッジ≈47%。下にモード別一覧あり。
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
        <p className="inline-note">リセット時は液晶CZ天井500G。</p>

        <label className="field">
          <span>CZスルー回数（女神）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={4}
            value={throughText}
            onChange={(e) => setThroughText(e.target.value)}
            onBlur={() => setThroughText(String(throughCount))}
          />
        </label>
        <p className="inline-note">
          4連続スルー後の5回目がAT＋激情ジャッジ。0〜4。
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
            machineId="karakuri2"
            pureIncPerGame={PREMISES.pureInc}
          />
          <div className="result-row result-row-kaba">
            <span className="mode">初当たり期待獲得出玉</span>
            <span>{formatNum(result.expectedWinMedals, 1)}枚</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">採用経路</span>
            <span>{primaryPathLabel(result.primaryPath)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ実G・出玉率（補正前）</span>
            <span>{formatRate(result.czActualPayoutRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">液晶＋モード・出玉率（補正前）</span>
            <span>{formatRate(result.displayPayoutRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">スルー天井・出玉率（補正前）</span>
            <span>{formatRate(result.throughPayoutRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">AT天井・出玉率（補正前）</span>
            <span>{formatRate(result.atPayoutRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ実G・等価期待値</span>
            <span>{formatYen(result.czActualYenEv)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">AT天井・等価期待値</span>
            <span>{formatYen(result.atYenEv)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ実G・平均投資</span>
            <span>
              {result.czActualInvestYen == null
                ? '—'
                : `${Math.round(result.czActualInvestYen).toLocaleString('ja-JP')}円`}
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">AT天井・平均投資</span>
            <span>
              {result.atInvestYen == null
                ? '—'
                : `${Math.round(result.atInvestYen).toLocaleString('ja-JP')}円`}
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ実G・天井到達率</span>
            <span>{formatRate(result.czActualReachRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">AT天井・天井到達率</span>
            <span>{formatRate(result.atReachRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">CZ実天井まで</span>
            <span>
              {formatNum(result.actualCzRemaining, 0)}G /{' '}
              {PREMISES.czActualCeiling}G
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">液晶天井まで</span>
            <span>
              {formatNum(result.displayRemaining, 0)}G /{' '}
              {result.displayCeilingG}G
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">AT天井まで</span>
            <span>
              {formatNum(result.atRemaining, 0)}G / {PREMISES.atCeiling}G
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">スルー天井まで</span>
            <span>あと{result.throughHitsNeeded}回のCZ</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均G（採用経路）</span>
            <span>{formatNum(result.avgGames, 1)}G</span>
          </div>
        </section>

        <h2 className="results-section-title">
          モード別・液晶経由（閉店補正後）
        </h2>
        <p className="inline-note">
          実G・表示G・スルー固定でモードだけ変えた内訳。女神CZ成功≈
          {(PREMISES.czSuccessGoddess * 100).toFixed(0)}%。
        </p>
        <section className="results" aria-label="モード別">
          <div className="results-head results-head-scenario">
            <span>モード</span>
            <span>出玉率</span>
            <span>平均G</span>
            <span>液晶残</span>
          </div>
          {modeRows.map((r) => (
            <div
              key={r.id}
              className={`result-row result-row-scenario tone-${rateTone(r.closedRate)}`}
            >
              <span className="mode">{r.label}</span>
              <span className="rate">{formatRate(r.closedRate)}</span>
              <span>{formatNum(r.avgGames, 1)}G</span>
              <span>{formatNum(r.displayRemaining, 0)}G</span>
            </div>
          ))}
        </section>

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">
            設定1固定。CZ実G表／液晶モード近似／スルー近似／AT天井表の高い方→閉店補正。
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
            狙い目目安（web情報・等価）: CZ実440G〜／液晶≈800G〜／スルー3連続〜／AT1500G〜。表は暫定版。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

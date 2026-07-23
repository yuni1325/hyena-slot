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
  buildMillionGodPremises,
  calculateMillionGod,
} from '../machines/million-god/calc'
import {
  PHASE_LABEL,
  PREMISES,
  type Phase,
} from '../machines/million-god/data'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

export default function MillionGodPage() {
  const [gamesText, setGamesText] = useState('325')
  const [phase, setPhase] = useState<Phase>('normal')
  const [closingHours, setClosingHours] = useState<ClosingHours>(
    DEFAULT_CLOSING_HOURS,
  )

  const games = useMemo(() => parseIntSafe(gamesText), [gamesText])
  const input = useMemo(() => ({ games, phase }), [games, phase])
  const result = useMemo(() => calculateMillionGod(input), [input])
  const premises = useMemo(() => buildMillionGodPremises(input), [input])

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
        <h1 className="machine-name">スマスロ ミリオンゴッド-神々の軌跡-</h1>
        <p className="tagline">
          GG間の現在Gとリセット有無から天井期待値を確認
        </p>
      </header>

      <main className="panel">
        <label className="field">
          <span>現在のG数（GG間）</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={1500}
            value={gamesText}
            onChange={(e) => setGamesText(e.target.value)}
            onBlur={() => setGamesText(String(games))}
          />
        </label>
        <p className="inline-note">
          通常天井1480G+α。リセット時は510／1000／1480のいずれかに短縮。
        </p>

        <label className="field">
          <span>状況</span>
          <select
            value={phase}
            onChange={(e) => setPhase(e.target.value as Phase)}
          >
            <option value="normal">{PHASE_LABEL.normal}</option>
            <option value="reset">{PHASE_LABEL.reset}</option>
          </select>
        </label>
        <p className="inline-note">
          リセット表は打ち出しGで天井振り分けをベイズ更新した暫定値（510G超で一度落ちる）。
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
            machineId="million-god"
            pureIncPerGame={PREMISES.pureInc}
          />
          <div className="result-row result-row-kaba">
            <span className="mode">初当たり（GG）期待獲得出玉</span>
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
            <span>{formatRate(result.reachRate)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">天井まで</span>
            <span>
              {formatNum(result.remaining, 0)}G / {result.ceilingG}G
              {phase === 'reset' ? '（最深）' : ''}
            </span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均G（打ち出し〜初当）</span>
            <span>{formatNum(result.avgGames, 1)}G</span>
          </div>
        </section>

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">
            設定1固定・web情報暫定表→閉店補正。モード・裏天国は未考慮。
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
            狙い目目安（web情報）: 通常・等価550G〜／リセット・等価150G〜。天国・裏天国示唆時は続行推奨。
          </p>
        </section>
        <BackToHomeButton footer />
      </main>
    </div>
  )
}

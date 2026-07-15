import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  buildKabaneriPremises,
  calculateKabaneri,
} from '../machines/kabaneri-unato/calc'
import { formatNum, formatRate, formatYen, formatCorrectionPp, rateTone } from '../lib/format'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

export default function KabaneriUnatoPage() {
  const [displayText, setDisplayText] = useState('0')
  const [cycleText, setCycleText] = useState('1')
  const [shortened, setShortened] = useState(false)

  const displayGames = useMemo(() => parseIntSafe(displayText), [displayText])
  const cycle = useMemo(() => {
    const n = parseIntSafe(cycleText, 1)
    return Math.min(6, Math.max(1, n))
  }, [cycleText])

  const input = useMemo(
    () => ({ displayGames, cycle, shortened }),
    [displayGames, cycle, shortened],
  )

  const result = useMemo(() => calculateKabaneri(input), [input])
  const premises = useMemo(() => buildKabaneriPremises(input), [input])

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden />
      <header className="hero">
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
            {[1, 2, 3, 4, 5, 6].map((c) => (
              <option key={c} value={c}>
                {c}周期目
              </option>
            ))}
          </select>
        </label>

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

        <section className="results" aria-label="計算結果">
          <div className="results-head results-head-kaba">
            <span>項目</span>
            <span>値</span>
          </div>
          <div
            className={`result-row result-row-kaba is-blend tone-${rateTone(result.expectedPayoutRate)}`}
          >
            <span className="mode">期待出玉率</span>
            <span className="rate">
              {formatRate(result.expectedPayoutRate)}
            </span>
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

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">
            設定1固定・ST終了でヤメ／出玉率＝なな徹表＋周期補正
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
            期待出玉率＝なな徹表ベース＋周期補正。分子は表準拠の約603枚。周期モデル差は50%だけ反映。規定G直前の周期当選は減衰。BIG:REG=1:1（REGはST約20%）。天井到達時のみエピソード＝ST確定。
          </p>
        </section>
      </main>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  buildKabaneriPremises,
  calculateKabaneri,
} from '../machines/kabaneri-unato/calc'
import { formatNum, formatRate, formatYen, rateTone } from '../lib/format'

function parseIntSafe(text: string, fallback = 0): number {
  const n = Number(text)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

export default function KabaneriUnatoPage() {
  const [displayText, setDisplayText] = useState('0')
  const [actualText, setActualText] = useState('0')
  const [cycleText, setCycleText] = useState('1')
  const [shortened, setShortened] = useState(false)

  const displayGames = useMemo(() => parseIntSafe(displayText), [displayText])
  const actualGames = useMemo(() => parseIntSafe(actualText), [actualText])
  const cycle = useMemo(() => {
    const n = parseIntSafe(cycleText, 1)
    return Math.min(6, Math.max(1, n))
  }, [cycleText])

  const input = useMemo(
    () => ({ displayGames, actualGames, cycle, shortened }),
    [displayGames, actualGames, cycle, shortened],
  )

  const result = useMemo(() => calculateKabaneri(input), [input])
  const premises = useMemo(() => buildKabaneriPremises(input), [input])

  const lag = displayGames - actualGames

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
        <p className="tagline">実G・周期・短縮から天井狙いの期待値を確認</p>
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

        <label className="field abeshi-field">
          <span>実G数</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            max={999}
            value={actualText}
            onChange={(e) => setActualText(e.target.value)}
            onBlur={() => setActualText(String(actualGames))}
          />
        </label>

        {lag !== 0 && (
          <p className="inline-note">
            表示と実Gの差: {lag > 0 ? '+' : ''}
            {lag}G（計算は実Gを主軸）
          </p>
        )}

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
            <span className="mode">平均G（有効残り）</span>
            <span>{formatNum(result.avgGames, 1)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">平均投資</span>
            <span>{formatNum(result.avgInvestment, 1)}枚</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">G数天井残り</span>
            <span>{formatNum(result.remainingByG, 0)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">周期モデル期待残り</span>
            <span>{formatNum(result.remainingByCycle, 1)}G</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">なな徹表・等価期待値（参考）</span>
            <span>{formatYen(result.tableYenEv)}</span>
          </div>
          <div className="result-row result-row-kaba">
            <span className="mode">なな徹表・平均投資（参考）</span>
            <span>
              {result.tableInvestYen == null
                ? '—'
                : `${Math.round(result.tableInvestYen).toLocaleString('ja-JP')}円`}
            </span>
          </div>
        </section>

        <section className="premises" aria-label="計算前提条件">
          <h2>計算に使った条件</h2>
          <p className="premises-note">設定1固定・天井ハイエナ想定</p>
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
            出玉率＝ST平均獲得 ÷ 有効残りGの平均投資。有効残り＝min(G数天井残り,
            周期モデル)。なな徹表は周期未考慮の参考値。
          </p>
        </section>
      </main>
    </div>
  )
}

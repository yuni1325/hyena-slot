import { Link } from 'react-router-dom'
import { RANKING, type RankTier } from '../data/hyenaRanking'

function tierClass(tier: RankTier): string {
  return `rank-tier rank-tier-${tier.toLowerCase()}`
}

export default function HomePage() {
  return (
    <div className="app">
      <div className="bg-grid" aria-hidden />
      <header className="hero">
        <p className="back-home-wrap">
          <Link to="/" className="back-home">
            ← 稼働記録（カレンダー）へ
          </Link>
        </p>
        <p className="brand">
          <Link to="/" className="brand-link">
            HYENA SLOT
          </Link>
        </p>
        <h1 className="machine-name">ハイエナ適性ランキング</h1>
        <p className="tagline">
          参考：日常の通常天井ハイエナ向けに総合採点 — タップで機種ごとの期待値計算へ
        </p>
      </header>

      <main className="panel">
        <ol className="rank-list">
          {RANKING.map((r) => (
            <li key={r.machineId} className="rank-card">
              <Link to={r.path} className="rank-card-link">
                <div className="rank-card-top">
                  <span className="rank-num">{r.rank}</span>
                  <span className={tierClass(r.tier)}>{r.tier}</span>
                  <span className="rank-name">{r.name}</span>
                  <span className="rank-score">{r.score.toFixed(1)}</span>
                </div>
                <div className="rank-card-meta">
                  <span>BE {r.beLabel}</span>
                  <span>
                    狙い目 {r.aimLabel}（{r.aimRate.toFixed(1)}%）
                  </span>
                  <span>天井 {r.ceilingLabel}</span>
                  <span>拾い {r.pickup}</span>
                </div>
                <p className="rank-card-note">{r.note}</p>
              </Link>
            </li>
          ))}
        </ol>

        <p className="footnote">
          主経路は日常で拾う通常天井。リセット専用・真BIG後などは注記のみ。ホール状況・閉店は未反映。
        </p>
      </main>
    </div>
  )
}

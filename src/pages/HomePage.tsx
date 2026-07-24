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
        <p className="brand">HYENA SLOT</p>
        <h1 className="machine-name">ハイエナ適性ランキング</h1>
        <p className="tagline">
          実装機種を、日常の通常天井ハイエナ向けに総合採点したもの — タップで機種へ
        </p>
        <p className="home-logs-link-wrap">
          <Link className="home-logs-link" to="/logs">
            稼働記録（カレンダー）
          </Link>
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

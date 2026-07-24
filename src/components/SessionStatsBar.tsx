import { Link } from 'react-router-dom'
import { formatNum, formatRate, rateTone } from '../lib/format'
import type { AggregateStats } from '../sessions/stats'

type Props = {
  title?: string
  stats: AggregateStats
}

export default function SessionStatsBar({ title = '集計', stats }: Props) {
  return (
    <section className="session-stats" aria-label={title}>
      <h2 className="session-stats-title">{title}</h2>
      <div className="session-stats-grid">
        <div className="session-stat">
          <span className="label">稼働平均期待出玉率</span>
          <strong className={`rate ${rateTone(stats.weightedExpectedRate)}`}>
            {formatRate(stats.weightedExpectedRate)}
          </strong>
        </div>
        <div className="session-stat">
          <span className="label">稼働実績出玉率</span>
          <strong className={`rate ${rateTone(stats.weightedActualRate)}`}>
            {formatRate(stats.weightedActualRate)}
          </strong>
        </div>
        <div className="session-stat">
          <span className="label">勝率</span>
          <strong>
            {stats.winRate == null
              ? '—'
              : `${stats.winRate.toFixed(1)}%（${stats.winCount}/${stats.count}）`}
          </strong>
        </div>
        <div className="session-stat">
          <span className="label">稼働台数</span>
          <strong>{stats.count}</strong>
        </div>
        <div className="session-stat">
          <span className="label">総投資／総差枚</span>
          <strong>
            {formatNum(stats.totalInvest, 0)}／
            {stats.totalDiff > 0 ? '+' : ''}
            {formatNum(stats.totalDiff, 0)}
          </strong>
        </div>
      </div>
    </section>
  )
}

export function SessionBackupActions({
  onExport,
  onImportFile,
}: {
  onExport: () => void
  onImportFile: (file: File) => void
}) {
  return (
    <div className="session-backup">
      <button type="button" className="btn-secondary" onClick={onExport}>
        JSONエクスポート
      </button>
      <label className="btn-secondary file-label">
        JSONインポート
        <input
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onImportFile(f)
            e.target.value = ''
          }}
        />
      </label>
      <Link to="/" className="btn-secondary">
        TOPへ
      </Link>
    </div>
  )
}

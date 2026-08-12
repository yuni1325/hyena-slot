import { Link } from 'react-router-dom'
import {
  formatNum,
  formatRate,
  rateTone,
  signedTone,
} from '../lib/format'
import { getSessionMachine } from '../sessions/registry'
import type { AggregateStats, MachineAggregate } from '../sessions/stats'

function formatDiff(n: number): string {
  return `${n > 0 ? '+' : ''}${formatNum(n, 0)}`
}

type Props = {
  title?: string
  stats: AggregateStats
  /** 機種ごとの稼働台数・勝率・差枚 */
  byMachine?: MachineAggregate[]
}

export default function SessionStatsBar({
  title = '集計',
  stats,
  byMachine,
}: Props) {
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
          <span className="label">総投資／回収／差枚</span>
          <strong>
            {formatNum(stats.totalInvest, 0)}／
            {formatNum(stats.totalInvest + stats.totalDiff, 0)}／
            <span className={signedTone(stats.totalDiff)}>
              {formatDiff(stats.totalDiff)}
            </span>
          </strong>
        </div>
      </div>

      {byMachine && byMachine.length > 0 && (
        <div className="session-machine-stats">
          <h3 className="session-machine-stats-title">機種別</h3>
          <div className="session-machine-table-wrap">
            <table className="session-machine-table">
              <thead>
                <tr>
                  <th scope="col">機種</th>
                  <th scope="col">台数</th>
                  <th scope="col">勝率</th>
                  <th scope="col">期待</th>
                  <th scope="col">実績</th>
                  <th scope="col">投資</th>
                  <th scope="col">回収</th>
                  <th scope="col">差枚</th>
                </tr>
              </thead>
              <tbody>
                {byMachine.map((m) => {
                  const short =
                    getSessionMachine(m.machineId)?.shortName ?? m.machineName
                  return (
                    <tr key={m.machineId}>
                      <th scope="row" className="session-machine-table-name">
                        {short}
                      </th>
                      <td>{m.count}</td>
                      <td>
                        {m.winRate == null ? '—' : `${m.winRate.toFixed(0)}%`}
                      </td>
                      <td>
                        <strong
                          className={`rate ${rateTone(m.weightedExpectedRate)}`}
                        >
                          {formatRate(m.weightedExpectedRate)}
                        </strong>
                      </td>
                      <td>
                        <strong
                          className={`rate ${rateTone(m.weightedActualRate)}`}
                        >
                          {formatRate(m.weightedActualRate)}
                        </strong>
                      </td>
                      <td>{formatNum(m.totalInvest, 0)}</td>
                      <td>{formatNum(m.totalInvest + m.totalDiff, 0)}</td>
                      <td className={signedTone(m.totalDiff)}>
                        {formatDiff(m.totalDiff)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
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

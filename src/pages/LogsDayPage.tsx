import { Link, useNavigate, useParams } from 'react-router-dom'
import SessionStatsBar from '../components/SessionStatsBar'
import { formatNum, formatRate, rateTone, signedTone } from '../lib/format'
import { useSessions } from '../sessions/SessionProvider'
import DataVersionToggle from '../components/DataVersionToggle'
import { DATA_VERSION_PREF_LABEL, otherVersion } from '../sessions/dataVersion'
import {
  aggregateByMachine,
  aggregateSessions,
  hasVersionedSessions,
  resolveExpectedPayoutRate,
  sessionsOnDate,
} from '../sessions/stats'
import { actualPayoutRate, recoverMedalsFrom } from '../sessions/types'
import { getSessionMachine } from '../sessions/registry'

function isValidDateKey(s: string | undefined): s is string {
  return Boolean(s && /^\d{4}-\d{2}-\d{2}$/.test(s))
}

export default function LogsDayPage() {
  const { date } = useParams()
  const navigate = useNavigate()
  const { sessions, deleteSession, dataVersion, setDataVersion } = useSessions()

  if (!isValidDateKey(date)) {
    return (
      <div className="app">
        <p>日付が不正です。</p>
        <Link to="/">カレンダーへ</Link>
      </div>
    )
  }

  const daySessions = sessionsOnDate(sessions, date)
  const stats = aggregateSessions(daySessions, dataVersion)
  const byMachine = aggregateByMachine(daySessions, dataVersion)
  const showVersionToggle = hasVersionedSessions(daySessions)

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden />
      <header className="hero">
        <p className="back-home-wrap">
          <Link to="/" className="back-home">
            ← カレンダーへ
          </Link>
        </p>
        <h1 className="machine-name">{date}</h1>
        <p className="tagline">この日の稼働台</p>
      </header>

      <main className="panel session-panel">
        {showVersionToggle && (
          <DataVersionToggle value={dataVersion} onChange={setDataVersion} />
        )}
        <SessionStatsBar title="当日集計" stats={stats} byMachine={byMachine} />

        <div className="session-actions">
          <Link className="btn-primary" to={`/logs/${date}/new`}>
            台を追加
          </Link>
        </div>

        {daySessions.length === 0 ? (
          <p className="hint">まだ記録がありません。「台を追加」から入力できます。</p>
        ) : (
          <ul className="session-list">
            {daySessions.map((s) => {
              const expected = resolveExpectedPayoutRate(s, dataVersion)
              const def = getSessionMachine(s.machineId)
              const altVersion = otherVersion(dataVersion)
              const altExpected = def?.hasDataVersions
                ? resolveExpectedPayoutRate(s, altVersion)
                : null
              const actual = actualPayoutRate(s.investMedals, s.diffMedals)
              const delta =
                actual != null && expected != null
                  ? actual - expected
                  : null
              const short = def?.shortName ?? s.machineName
              return (
                <li key={s.id} className="session-card">
                  <Link to={`/logs/${date}/${s.id}`} className="session-card-main">
                    <span className="session-card-name">{short}</span>
                    <span className="session-card-row">
                      投資 {formatNum(s.investMedals, 0)}／回収{' '}
                      {formatNum(
                        recoverMedalsFrom(s.investMedals, s.diffMedals),
                        0,
                      )}
                      ／差枚{' '}
                      <span className={signedTone(s.diffMedals)}>
                        {s.diffMedals > 0 ? '+' : ''}
                        {formatNum(s.diffMedals, 0)}
                      </span>
                    </span>
                    <span className="session-card-rates">
                      <span>
                        期待{' '}
                        <strong className={`rate ${rateTone(expected)}`}>
                          {formatRate(expected)}
                        </strong>
                      </span>
                      <span>
                        実績{' '}
                        <strong className={`rate ${rateTone(actual)}`}>
                          {formatRate(actual)}
                        </strong>
                      </span>
                      <span>
                        差{' '}
                        <strong className={signedTone(delta)}>
                          {delta == null
                            ? '—'
                            : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}pp`}
                        </strong>
                      </span>
                    </span>
                    {altExpected != null && (
                      <span className="alt-rate">
                        {DATA_VERSION_PREF_LABEL[altVersion]}での期待{' '}
                        {formatRate(altExpected)}
                        {expected != null &&
                          (Math.abs(altExpected - expected) < 0.05
                            ? '（同じ）'
                            : `（${altExpected - expected > 0 ? '+' : ''}${(altExpected - expected).toFixed(1)}pp）`)}
                      </span>
                    )}
                  </Link>
                  <button
                    type="button"
                    className="btn-danger-text"
                    onClick={() => {
                      if (window.confirm(`${short}の記録を削除しますか？`)) {
                        deleteSession(s.id)
                      }
                    }}
                  >
                    削除
                  </button>
                </li>
              )
            })}
          </ul>
        )}

        <div className="session-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/')}
          >
            カレンダーへ戻る
          </button>
        </div>
      </main>
    </div>
  )
}

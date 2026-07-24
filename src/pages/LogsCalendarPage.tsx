import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BackToHomeButton from '../components/BackToHomeButton'
import SessionStatsBar, {
  SessionBackupActions,
} from '../components/SessionStatsBar'
import { useSessions } from '../sessions/SessionProvider'
import { formatNum } from '../lib/format'
import {
  aggregateSessions,
  sessionsInMonth,
  sessionsOnDate,
} from '../sessions/stats'

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function toDateKey(y: number, m: number, d: number): string {
  return `${y}-${pad2(m)}-${pad2(d)}`
}

function formatDiff(n: number): string {
  const sign = n > 0 ? '+' : ''
  return `${sign}${formatNum(n, 0)}`
}

function dayTone(totalDiff: number | null): string {
  if (totalDiff == null) return ''
  if (totalDiff > 0) return 'is-good'
  if (totalDiff < 0) return 'is-bad'
  return 'is-flat'
}

export default function LogsCalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const { sessions, exportJson, importJsonText } = useSessions()

  const monthSessions = useMemo(
    () => sessionsInMonth(sessions, year, month),
    [sessions, year, month],
  )
  const monthStats = useMemo(
    () => aggregateSessions(monthSessions),
    [monthSessions],
  )

  const firstDow = useMemo(() => {
    // 月曜始まり: 0=Mon ... 6=Sun
    const dow = new Date(year, month - 1, 1).getDay()
    return (dow + 6) % 7
  }, [year, month])

  const daysInMonth = useMemo(
    () => new Date(year, month, 0).getDate(),
    [year, month],
  )

  const cells = useMemo(() => {
    const list: Array<{
      key: string
      day: number | null
      dateKey?: string
      count: number
      totalDiff: number | null
    }> = []
    for (let i = 0; i < firstDow; i++) {
      list.push({ key: `e${i}`, day: null, count: 0, totalDiff: null })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = toDateKey(year, month, d)
      const dayS = sessionsOnDate(sessions, dateKey)
      const agg = aggregateSessions(dayS)
      list.push({
        key: dateKey,
        day: d,
        dateKey,
        count: agg.count,
        totalDiff: dayS.length > 0 ? agg.totalDiff : null,
      })
    }
    return list
  }, [firstDow, daysInMonth, year, month, sessions])

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1)
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
  }

  const handleImport = async (file: File) => {
    try {
      const text = await file.text()
      if (
        !window.confirm(
          'インポートすると現在の記録をすべて置き換えます。よろしいですか？',
        )
      ) {
        return
      }
      importJsonText(text)
      window.alert('インポートしました')
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : 'インポートに失敗しました',
      )
    }
  }

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
        <h1 className="machine-name">稼働記録</h1>
        <p className="tagline">カレンダーから日付を選び、台ごとの実績を記録</p>
      </header>

      <main className="panel session-panel">
        <SessionStatsBar title={`${year}年${month}月の集計`} stats={monthStats} />

        <div className="cal-nav">
          <button type="button" className="btn-secondary" onClick={() => shiftMonth(-1)}>
            ← 前月
          </button>
          <strong className="cal-month-label">
            {year}年{month}月
          </strong>
          <button type="button" className="btn-secondary" onClick={() => shiftMonth(1)}>
            翌月 →
          </button>
        </div>

        <div className="cal-weekdays" aria-hidden>
          {['月', '火', '水', '木', '金', '土', '日'].map((w) => (
            <span key={w}>{w}</span>
          ))}
        </div>

        <div className="cal-grid">
          {cells.map((c) =>
            c.day == null || !c.dateKey ? (
              <div key={c.key} className="cal-cell is-empty" />
            ) : (
              <Link
                key={c.key}
                to={`/logs/${c.dateKey}`}
                className={`cal-cell ${c.count > 0 ? 'has-data' : ''} ${dayTone(c.totalDiff)}`}
              >
                <span className="cal-day">{c.day}</span>
                {c.count > 0 && c.totalDiff != null && (
                  <>
                    <span className="cal-meta">{c.count}台</span>
                    <span className="cal-delta">{formatDiff(c.totalDiff)}</span>
                  </>
                )}
              </Link>
            ),
          )}
        </div>

        <p className="hint">
          各日は稼働台数と合計差枚。色は合計差枚（緑＝プラス／赤＝マイナス）。
        </p>

        <SessionBackupActions onExport={exportJson} onImportFile={handleImport} />
        <p className="hint">
          データはこの端末のブラウザに保存されます。消えたとき用に JSON
          エクスポートを推奨します。
        </p>
      </main>
    </div>
  )
}

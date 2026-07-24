import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SessionMachineFields from '../components/SessionMachineFields'
import { formatRate, rateTone } from '../lib/format'
import {
  getSessionMachine,
  sessionMachines,
} from '../sessions/registry'
import { useSessions } from '../sessions/SessionProvider'
import { actualPayoutRate, type MachineSession } from '../sessions/types'

function isValidDateKey(s: string | undefined): s is string {
  return Boolean(s && /^\d{4}-\d{2}-\d{2}$/.test(s))
}

function newId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `s-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function LogsSessionFormPage() {
  const { date, sessionId } = useParams()
  const navigate = useNavigate()
  const { sessions, upsertSession } = useSessions()
  const isNew = !sessionId || sessionId === 'new'

  const existing = useMemo(() => {
    if (isNew || !sessionId) return null
    return sessions.find((s) => s.id === sessionId) ?? null
  }, [isNew, sessionId, sessions])

  const [machineId, setMachineId] = useState(
    () => existing?.machineId ?? sessionMachines[0]?.id ?? '',
  )
  const machine = getSessionMachine(machineId)

  const [inputs, setInputs] = useState<Record<string, unknown>>(() => {
    if (existing) return { ...existing.inputs }
    return sessionMachines[0]?.defaultInputs() ?? {}
  })

  const [investText, setInvestText] = useState(
    () => String(existing?.investMedals ?? ''),
  )
  const [diffText, setDiffText] = useState(
    () => String(existing?.diffMedals ?? ''),
  )
  const [note, setNote] = useState(() => existing?.note ?? '')
  const [error, setError] = useState<string | null>(null)

  if (!isValidDateKey(date)) {
    return (
      <div className="app">
        <p>日付が不正です。</p>
        <Link to="/logs">カレンダーへ</Link>
      </div>
    )
  }

  if (!isNew && !existing) {
    return (
      <div className="app">
        <p>記録が見つかりません。</p>
        <Link to={`/logs/${date}`}>日詳細へ</Link>
      </div>
    )
  }

  const expected = machine ? machine.expectedPayoutRate(inputs) : null
  const investMedals = Number(investText)
  const diffMedals = Number(diffText)
  const actual =
    Number.isFinite(investMedals) && Number.isFinite(diffMedals)
      ? actualPayoutRate(investMedals, diffMedals)
      : null
  const delta =
    expected != null && actual != null ? actual - expected : null

  const onMachineChange = (id: string) => {
    setMachineId(id)
    const def = getSessionMachine(id)
    if (def) setInputs(def.defaultInputs())
  }

  const onSave = () => {
    setError(null)
    if (!machine) {
      setError('機種を選んでください')
      return
    }
    if (!(investMedals > 0) || !Number.isFinite(investMedals)) {
      setError('投資枚数は1以上の数値で入力してください')
      return
    }
    if (!Number.isFinite(diffMedals)) {
      setError('差枚を数値で入力してください')
      return
    }

    const now = new Date().toISOString()
    const session: MachineSession = {
      id: existing?.id ?? newId(),
      date,
      machineId: machine.id,
      machineName: machine.name,
      inputs: { ...inputs },
      expectedPayoutRate: expected,
      investMedals: Math.floor(investMedals),
      diffMedals: Math.floor(diffMedals),
      note: note.trim() || undefined,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    upsertSession(session)
    navigate(`/logs/${date}`)
  }

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden />
      <header className="hero">
        <p className="back-home-wrap">
          <Link to={`/logs/${date}`} className="back-home">
            ← {date}へ戻る
          </Link>
        </p>
        <h1 className="machine-name">{isNew ? '台を記録' : '記録を編集'}</h1>
        <p className="tagline">{date}</p>
      </header>

      <main className="panel session-panel">
        <label className="field">
          <span>機種</span>
          <select
            value={machineId}
            onChange={(e) => onMachineChange(e.target.value)}
            disabled={!isNew}
          >
            {sessionMachines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.shortName}
              </option>
            ))}
          </select>
        </label>

        {machine && (
          <>
            <h2 className="section-title">天井狙い時の入力</h2>
            <SessionMachineFields
              fields={machine.fields}
              values={inputs}
              onChange={setInputs}
            />
            <p className="preview-rate">
              期待出玉率{' '}
              <strong className={`rate ${rateTone(expected)}`}>
                {formatRate(expected)}
              </strong>
            </p>
          </>
        )}

        <h2 className="section-title">出玉実績</h2>
        <div className="form-grid">
          <label className="field">
            <span>投資枚数</span>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              value={investText}
              onChange={(e) => setInvestText(e.target.value)}
              placeholder="例: 5000"
            />
          </label>
          <label className="field">
            <span>差枚（マイナス可）</span>
            <input
              type="number"
              inputMode="numeric"
              value={diffText}
              onChange={(e) => setDiffText(e.target.value)}
              placeholder="例: -800 / 1200"
            />
          </label>
          <label className="field field-full">
            <span>メモ（任意）</span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ホール名・台番号など"
            />
          </label>
        </div>

        <div className="session-compare">
          <div>
            <span className="label">期待</span>
            <strong className={`rate ${rateTone(expected)}`}>{formatRate(expected)}</strong>
          </div>
          <div>
            <span className="label">実績</span>
            <strong className={`rate ${rateTone(actual)}`}>{formatRate(actual)}</strong>
          </div>
          <div>
            <span className="label">差</span>
            <strong>
              {delta == null
                ? '—'
                : `${delta > 0 ? '+' : ''}${delta.toFixed(1)}pp`}
            </strong>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="session-actions">
          <button type="button" className="btn-primary" onClick={onSave}>
            保存
          </button>
          <Link className="btn-secondary" to={`/logs/${date}`}>
            キャンセル
          </Link>
        </div>
      </main>
    </div>
  )
}

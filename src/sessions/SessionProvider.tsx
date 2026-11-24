import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  downloadSessionsJson,
  loadSessionsFile,
  parseSessionsFile,
  saveSessionsFile,
} from './storage'
import { resolveExpectedPayoutRate } from './stats'
import {
  loadDataVersionPref,
  saveDataVersionPref,
  type DataVersionPref,
} from './dataVersion'
import type { MachineSession, SessionsFile } from './types'

type SessionsContextValue = {
  file: SessionsFile
  sessions: MachineSession[]
  upsertSession: (session: MachineSession) => void
  deleteSession: (id: string) => void
  replaceAll: (file: SessionsFile) => void
  exportJson: () => void
  importJsonText: (text: string) => void
  /** 期待出玉率の計算に使うデータ版（端末ごとの表示設定） */
  dataVersion: DataVersionPref
  setDataVersion: (v: DataVersionPref) => void
}

const SessionsContext = createContext<SessionsContextValue | null>(null)

/** 保存済み入力から現行式の期待出玉率へ寄せる（表示・エクスポート用） */
function refreshExpectedRates(file: SessionsFile): SessionsFile {
  let changed = false
  const sessions = file.sessions.map((s) => {
    const live = resolveExpectedPayoutRate(s)
    if (live === s.expectedPayoutRate) return s
    if (
      live == null &&
      (s.expectedPayoutRate == null || !Number.isFinite(s.expectedPayoutRate))
    ) {
      return s
    }
    // 浮動小数の微小差は無視
    if (
      live != null &&
      s.expectedPayoutRate != null &&
      Math.abs(live - s.expectedPayoutRate) < 1e-6
    ) {
      return s
    }
    changed = true
    return { ...s, expectedPayoutRate: live }
  })
  return changed ? { ...file, sessions } : file
}

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<SessionsFile>(() => {
    const loaded = loadSessionsFile()
    const refreshed = refreshExpectedRates(loaded)
    if (refreshed !== loaded) saveSessionsFile(refreshed)
    return refreshed
  })

  const [dataVersion, setDataVersionState] = useState<DataVersionPref>(() =>
    loadDataVersionPref(),
  )
  const setDataVersion = useCallback((v: DataVersionPref) => {
    saveDataVersionPref(v)
    setDataVersionState(v)
  }, [])

  const persist = useCallback((next: SessionsFile) => {
    saveSessionsFile(next)
    setFile(loadSessionsFile())
  }, [])

  const upsertSession = useCallback(
    (session: MachineSession) => {
      const others = file.sessions.filter((s) => s.id !== session.id)
      persist({
        ...file,
        sessions: [...others, session],
      })
    },
    [file, persist],
  )

  const deleteSession = useCallback(
    (id: string) => {
      persist({
        ...file,
        sessions: file.sessions.filter((s) => s.id !== id),
      })
    },
    [file, persist],
  )

  const replaceAll = useCallback(
    (next: SessionsFile) => {
      persist(next)
    },
    [persist],
  )

  const exportJson = useCallback(() => {
    downloadSessionsJson(file)
  }, [file])

  const importJsonText = useCallback(
    (text: string) => {
      const parsed = parseSessionsFile(JSON.parse(text))
      persist(parsed)
    },
    [persist],
  )

  const value = useMemo(
    () => ({
      file,
      sessions: file.sessions,
      upsertSession,
      deleteSession,
      replaceAll,
      exportJson,
      importJsonText,
      dataVersion,
      setDataVersion,
    }),
    [
      dataVersion,
      setDataVersion,
      file,
      upsertSession,
      deleteSession,
      replaceAll,
      exportJson,
      importJsonText,
    ],
  )

  return (
    <SessionsContext.Provider value={value}>{children}</SessionsContext.Provider>
  )
}

export function useSessions(): SessionsContextValue {
  const ctx = useContext(SessionsContext)
  if (!ctx) throw new Error('useSessions must be used within SessionsProvider')
  return ctx
}

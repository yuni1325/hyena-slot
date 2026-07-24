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
import type { MachineSession, SessionsFile } from './types'

type SessionsContextValue = {
  file: SessionsFile
  sessions: MachineSession[]
  upsertSession: (session: MachineSession) => void
  deleteSession: (id: string) => void
  replaceAll: (file: SessionsFile) => void
  exportJson: () => void
  importJsonText: (text: string) => void
}

const SessionsContext = createContext<SessionsContextValue | null>(null)

export function SessionsProvider({ children }: { children: ReactNode }) {
  const [file, setFile] = useState<SessionsFile>(() => loadSessionsFile())

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
    }),
    [
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

import {
  SESSIONS_FILE_VERSION,
  type MachineSession,
  type SessionsFile,
} from './types'

export const STORAGE_KEY = 'hyena-slot.sessions.v1'

function emptyFile(): SessionsFile {
  return {
    version: SESSIONS_FILE_VERSION,
    updatedAt: new Date().toISOString(),
    sessions: [],
  }
}

function isSession(x: unknown): x is MachineSession {
  if (!x || typeof x !== 'object') return false
  const s = x as Record<string, unknown>
  return (
    typeof s.id === 'string' &&
    typeof s.date === 'string' &&
    typeof s.machineId === 'string' &&
    typeof s.machineName === 'string' &&
    typeof s.investMedals === 'number' &&
    typeof s.diffMedals === 'number' &&
    (s.expectedPayoutRate === null || typeof s.expectedPayoutRate === 'number') &&
    typeof s.createdAt === 'string' &&
    typeof s.updatedAt === 'string' &&
    s.inputs != null &&
    typeof s.inputs === 'object'
  )
}

export function parseSessionsFile(raw: unknown): SessionsFile {
  if (!raw || typeof raw !== 'object') {
    throw new Error('JSONの形式が不正です')
  }
  const obj = raw as Record<string, unknown>
  if (!Array.isArray(obj.sessions)) {
    throw new Error('sessions 配列がありません')
  }
  const sessions = obj.sessions.filter(isSession)
  if (sessions.length !== obj.sessions.length) {
    throw new Error('不正なセッション行が含まれています')
  }
  return {
    version: SESSIONS_FILE_VERSION,
    updatedAt:
      typeof obj.updatedAt === 'string'
        ? obj.updatedAt
        : new Date().toISOString(),
    sessions,
  }
}

export function loadSessionsFile(): SessionsFile {
  try {
    const text = localStorage.getItem(STORAGE_KEY)
    if (!text) return emptyFile()
    return parseSessionsFile(JSON.parse(text))
  } catch {
    return emptyFile()
  }
}

export function saveSessionsFile(file: SessionsFile): void {
  const next: SessionsFile = {
    ...file,
    version: SESSIONS_FILE_VERSION,
    updatedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function exportSessionsJson(file: SessionsFile): string {
  return JSON.stringify(
    {
      ...file,
      version: SESSIONS_FILE_VERSION,
      updatedAt: new Date().toISOString(),
    },
    null,
    2,
  )
}

export function downloadSessionsJson(file: SessionsFile): void {
  const blob = new Blob([exportSessionsJson(file)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const stamp = new Date().toISOString().slice(0, 10)
  a.href = url
  a.download = `hyena-slot-sessions-${stamp}.json`
  a.click()
  URL.revokeObjectURL(url)
}

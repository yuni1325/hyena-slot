/** 稼働実績（ローカル永続） */

export const SESSIONS_FILE_VERSION = 1 as const

export type MachineSession = {
  id: string
  date: string // YYYY-MM-DD
  machineId: string
  machineName: string
  /** 機種ごとの計算入力スナップショット */
  inputs: Record<string, unknown>
  /** 保存時点の期待出玉率（％） */
  expectedPayoutRate: number | null
  /** 投資枚数 */
  investMedals: number
  /** 差枚（回収 − 投資。マイナス可） */
  diffMedals: number
  note?: string
  createdAt: string
  updatedAt: string
}

export type SessionsFile = {
  version: typeof SESSIONS_FILE_VERSION
  updatedAt: string
  sessions: MachineSession[]
}

/** 差枚 = 回収 − 投資 */
export function diffMedalsFrom(
  investMedals: number,
  recoverMedals: number,
): number {
  return recoverMedals - investMedals
}

/** 回収 = 投資 + 差枚（既存記録の表示用） */
export function recoverMedalsFrom(
  investMedals: number,
  diffMedals: number,
): number {
  return investMedals + diffMedals
}

export function actualPayoutRate(
  investMedals: number,
  diffMedals: number,
): number | null {
  if (!(investMedals > 0) || !Number.isFinite(diffMedals)) return null
  return ((investMedals + diffMedals) / investMedals) * 100
}

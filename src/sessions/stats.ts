import { actualPayoutRate, type MachineSession } from './types'

export type AggregateStats = {
  count: number
  /** 獲得枚数（投資+差枚）が投資を上回った台数 */
  winCount: number
  /** 勝率％＝ winCount / count × 100 */
  winRate: number | null
  totalInvest: number
  totalDiff: number
  /** 投資加重の期待出玉率 */
  weightedExpectedRate: number | null
  /** 投資加重の実績出玉率＝(総投資+総差枚)/総投資 */
  weightedActualRate: number | null
}

/** 獲得枚数 = 投資 + 差枚。投資を上回る ⇔ 差枚 > 0 */
export function isSessionWin(s: MachineSession): boolean {
  return s.investMedals + s.diffMedals > s.investMedals
}

export function aggregateSessions(sessions: MachineSession[]): AggregateStats {
  let totalInvest = 0
  let totalDiff = 0
  let expectedWeight = 0
  let expectedSum = 0
  let winCount = 0

  for (const s of sessions) {
    if (isSessionWin(s)) winCount += 1
    totalDiff += s.diffMedals
    if (!(s.investMedals > 0)) continue
    totalInvest += s.investMedals
    if (s.expectedPayoutRate != null && Number.isFinite(s.expectedPayoutRate)) {
      expectedWeight += s.investMedals
      expectedSum += s.expectedPayoutRate * s.investMedals
    }
  }

  const count = sessions.length
  return {
    count,
    winCount,
    winRate: count > 0 ? (winCount / count) * 100 : null,
    totalInvest,
    totalDiff,
    weightedExpectedRate:
      expectedWeight > 0 ? expectedSum / expectedWeight : null,
    weightedActualRate:
      totalInvest > 0
        ? actualPayoutRate(totalInvest, totalDiff)
        : null,
  }
}

export function sessionsInMonth(
  sessions: MachineSession[],
  year: number,
  month: number,
): MachineSession[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  return sessions.filter((s) => s.date.startsWith(prefix))
}

export function sessionsOnDate(
  sessions: MachineSession[],
  date: string,
): MachineSession[] {
  return sessions
    .filter((s) => s.date === date)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export function dayDeltaPp(sessions: MachineSession[]): number | null {
  const agg = aggregateSessions(sessions)
  if (agg.weightedExpectedRate == null || agg.weightedActualRate == null) {
    return null
  }
  return agg.weightedActualRate - agg.weightedExpectedRate
}

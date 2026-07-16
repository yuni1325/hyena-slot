/**
 * 閉店時間による出玉率の保守補正。
 * 目安: 閉店1時間前（残り約650G）が最後のうちはじめ。
 */

export const CLOSING_GAMES_PER_HOUR = 650

/** 30分刻み（1.0〜3.0時間） */
export const CLOSING_HOURS_OPTIONS = [1, 1.5, 2, 2.5, 3] as const

export type ClosingHours = (typeof CLOSING_HOURS_OPTIONS)[number]

export const DEFAULT_CLOSING_HOURS: ClosingHours = 2

/** フル評価に必要なバッファ（平均＋αを保守側に） */
const SAFETY_BUFFER = 1.1

export type ClosingCorrectionInput = {
  hoursUntilClose: number
  /** 初当たりまでの平均G */
  avgGamesToHit: number | null
  /** 初当たり（AT/ST）1回の期待獲得出玉 */
  expectedWinMedals: number | null
  /** AT/ST純増（枚/G） */
  pureIncPerGame: number
  /** 補正前の期待出玉率（%） */
  rawPayoutRate: number | null
}

export type ClosingCorrection = {
  hoursUntilClose: number
  availableGames: number
  availableMinutes: number
  /** 初当たりまでの平均時間（分） */
  avgMinutesToHit: number | null
  /** AT/STに必要な平均G・分 */
  atStGames: number | null
  atStMinutesNeeded: number | null
  /** 初当たり平均後に回せる残り時間（分）・G */
  minutesForAtSt: number | null
  gamesForAtSt: number | null
  /** 0〜1。必要G（平均初当＋AT/ST）×バッファに対する余裕 */
  closingFactor: number
  rawPayoutRate: number | null
  correctedPayoutRate: number | null
}

export function gamesToMinutes(games: number): number {
  return (games / CLOSING_GAMES_PER_HOUR) * 60
}

export function availableGamesUntilClose(hours: number): number {
  return Math.max(0, hours) * CLOSING_GAMES_PER_HOUR
}

export function applyClosingCorrection(
  input: ClosingCorrectionInput,
): ClosingCorrection {
  const hours = Math.max(0, input.hoursUntilClose)
  const availableGames = availableGamesUntilClose(hours)
  const availableMinutes = hours * 60

  const base: ClosingCorrection = {
    hoursUntilClose: hours,
    availableGames,
    availableMinutes,
    avgMinutesToHit: null,
    atStGames: null,
    atStMinutesNeeded: null,
    minutesForAtSt: null,
    gamesForAtSt: null,
    closingFactor: 0,
    rawPayoutRate: input.rawPayoutRate,
    correctedPayoutRate: null,
  }

  const avgG = input.avgGamesToHit
  const win = input.expectedWinMedals
  const pure = input.pureIncPerGame
  const raw = input.rawPayoutRate

  if (avgG == null || avgG < 0 || win == null || win <= 0 || pure <= 0) {
    return base
  }

  const atStGames = win / pure
  const avgMinutesToHit = gamesToMinutes(avgG)
  const atStMinutesNeeded = gamesToMinutes(atStGames)
  const gamesForAtSt = Math.max(0, availableGames - avgG)
  const minutesForAtSt = gamesToMinutes(gamesForAtSt)

  // 保守: 初当平均G + AT/ST所要G に 10%バッファを乗せた必要量に対する充足率
  const needGames = (avgG + atStGames) * SAFETY_BUFFER
  const closingFactor =
    needGames <= 0 ? 0 : Math.max(0, Math.min(1, availableGames / needGames))

  const correctedPayoutRate =
    raw == null ? null : raw * closingFactor

  return {
    ...base,
    avgMinutesToHit,
    atStGames,
    atStMinutesNeeded,
    minutesForAtSt,
    gamesForAtSt,
    closingFactor,
    correctedPayoutRate,
  }
}

export function closingHoursLabel(hours: number): string {
  if (Number.isInteger(hours)) return `${hours}時間`
  return `${hours}時間`
}

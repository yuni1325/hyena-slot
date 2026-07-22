/**
 * 閉店時間による出玉率の保守補正。
 * 目安: 閉店1時間前（残り約650G）が最後のうちはじめ。
 *
 * 補正の考え方（保守）:
 * - 初当までのGは平均 avgG の指数分布 → 閉店までに当たる確率 pHit = 1−e^(−A/μ)
 * - 当たっても「平均より遅い」時刻で当たったと仮定し、残Gで AT/ST 完走率を落とす
 * - AT/ST所要Gにもバッファを乗せる
 * → factor = pHit × atCompleteFrac（期待獲得出玉も同率で減衰）
 */

export const CLOSING_GAMES_PER_HOUR = 650

/** 30分刻み（1.0〜3.0時間） */
export const CLOSING_HOURS_OPTIONS = [1, 1.5, 2, 2.5, 3] as const

export type ClosingHours = (typeof CLOSING_HOURS_OPTIONS)[number]

export const DEFAULT_CLOSING_HOURS: ClosingHours = 2

/** 初当を平均より遅く見積もる（保守） */
const HIT_LATE_BIAS = 1.2
/** AT/ST所要Gの余裕（保守） */
const AT_BUFFER = 1.15

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
  /** 閉店までに初当する確率（指数待ち） */
  hitProbability: number
  /** 遅当たり仮定での AT/ST 完走率 */
  atCompleteFraction: number
  /** 0〜1。pHit × at完走率 */
  closingFactor: number
  /** 閉店補正後の期待獲得出玉 */
  correctedWinMedals: number | null
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
    hitProbability: 0,
    atCompleteFraction: 0,
    closingFactor: 0,
    correctedWinMedals: null,
    rawPayoutRate: input.rawPayoutRate,
    correctedPayoutRate: null,
  }

  const avgG = input.avgGamesToHit
  const win = input.expectedWinMedals
  const pure = input.pureIncPerGame
  const raw = input.rawPayoutRate

  if (avgG == null || avgG <= 0 || win == null || win <= 0 || pure <= 0) {
    return base
  }

  const atStGames = win / pure
  const avgMinutesToHit = gamesToMinutes(avgG)
  const atStMinutesNeeded = gamesToMinutes(atStGames)
  const gamesForAtSt = Math.max(0, availableGames - avgG)
  const minutesForAtSt = gamesToMinutes(gamesForAtSt)

  // ① 閉店までに初当する確率（指数分布・平均 avgG）
  const hitProbability = 1 - Math.exp(-availableGames / avgG)

  // ② 当たっても平均×1.2 で当たったと仮定し、AT/ST所要×1.15 に対する完走率
  const assumedHitG = avgG * HIT_LATE_BIAS
  const gamesLeftAfterLateHit = Math.max(0, availableGames - assumedHitG)
  const atNeed = atStGames * AT_BUFFER
  const atCompleteFraction =
    atNeed <= 0 ? 0 : Math.max(0, Math.min(1, gamesLeftAfterLateHit / atNeed))

  const closingFactor = Math.max(
    0,
    Math.min(1, hitProbability * atCompleteFraction),
  )

  const correctedWinMedals = win * closingFactor
  const correctedPayoutRate = raw == null ? null : raw * closingFactor

  return {
    ...base,
    avgMinutesToHit,
    atStGames,
    atStMinutesNeeded,
    minutesForAtSt,
    gamesForAtSt,
    hitProbability,
    atCompleteFraction,
    closingFactor,
    correctedWinMedals,
    correctedPayoutRate,
  }
}

export function closingHoursLabel(hours: number): string {
  if (Number.isInteger(hours)) return `${hours}時間`
  return `${hours}時間`
}

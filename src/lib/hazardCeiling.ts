/**
 * ハザード一定の天井モデル（G数別の期待値表が未公開の新台用）。
 *
 *   - 天井までは毎G一定確率 p で初当たり、天井到達で必ず当たる
 *   - 初当たり1回の等価獲得は定数 W（ヤメ時までのフォロー込み）
 *   - 出玉率 = W ÷（通常時消費 × 初当たりまでの平均G）
 *
 * p と W は機種ごとに公開アンカー（特定G数の期待値・出玉率）へ合わせる。
 */

export type HazardCeilingResult = {
  reachable: boolean
  expectedPayoutRate: number | null
  expectedWinMedals: number | null
  yenEv: number | null
  investYen: number | null
  reachRate: number | null
  remaining: number | null
  ceilingG: number
  avgGames: number | null
  avgInvestment: number | null
}

/** 天井まで N G 残りのときの初当たりまでの平均G */
export function expectedGames(p: number, remaining: number): number {
  if (remaining <= 0) return 0
  return (1 - Math.pow(1 - p, remaining)) / p
}

/** 「残りN Gで出玉率 rate%」になる W */
export function winForRate(
  p: number,
  remaining: number,
  ratePct: number,
  medalsPerGame: number,
): number {
  return (ratePct / 100) * medalsPerGame * expectedGames(p, remaining)
}

/** 「残りN Gで等価期待値 yen円」になる W */
export function winForYen(
  p: number,
  remaining: number,
  yen: number,
  medalsPerGame: number,
  yenPerMedal = 20,
): number {
  return medalsPerGame * expectedGames(p, remaining) + yen / yenPerMedal
}

export function evaluateHazardCeiling(args: {
  p: number
  winMedals: number
  ceilingG: number
  actualGames: number
  medalsPerGame: number
  yenPerMedal?: number
}): HazardCeilingResult {
  const yenPerMedal = args.yenPerMedal ?? 20
  const g = Math.max(0, Math.floor(args.actualGames))
  const remaining = Math.max(0, args.ceilingG - g)
  const w = args.winMedals

  if (remaining <= 0) {
    return {
      reachable: false,
      expectedPayoutRate: null,
      expectedWinMedals: w,
      yenEv: null,
      investYen: null,
      reachRate: null,
      remaining: 0,
      ceilingG: args.ceilingG,
      avgGames: null,
      avgInvestment: null,
    }
  }

  const avgGames = expectedGames(args.p, remaining)
  const avgInvestment = avgGames * args.medalsPerGame
  return {
    reachable: true,
    expectedPayoutRate: (w / avgInvestment) * 100,
    expectedWinMedals: w,
    yenEv: (w - avgInvestment) * yenPerMedal,
    investYen: avgInvestment * yenPerMedal,
    reachRate: Math.pow(1 - args.p, remaining) * 100,
    remaining,
    ceilingG: args.ceilingG,
    avgGames,
    avgInvestment,
  }
}

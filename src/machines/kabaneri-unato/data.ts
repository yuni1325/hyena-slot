/**
 * スマスロ 甲鉄城のカバネリ 海門決戦 — 設定1・天井ハイエナ用定数
 * 出典:
 * - https://nana-press.com/kaiseki/machine/1097/35403/ （天井期待値）
 * - https://nana-press.com/kaiseki/machine/1097/35411/ （周期）
 * - https://flick7.net/slot/kabaneri_unato__c.php （ST平均獲得）
 */

export type EvRow = {
  games: number
  /** 等価期待値（円） */
  yen: number
  /** 平均投資（円） */
  investYen: number
  /** 天井到達率（％） */
  reachRate: number
}

/** なな徹・ゲーム数天井期待値（周期数は考慮しないと明記） */
export const EV_NORMAL: EvRow[] = [
  { games: 0, yen: -1564, investYen: 13629, reachRate: 12.76 },
  { games: 50, yen: -1347, investYen: 13412, reachRate: 14.15 },
  { games: 100, yen: -1106, investYen: 13171, reachRate: 15.69 },
  { games: 150, yen: -840, investYen: 12904, reachRate: 17.4 },
  { games: 200, yen: -544, investYen: 12608, reachRate: 19.3 },
  { games: 250, yen: -215, investYen: 12280, reachRate: 21.4 },
  { games: 300, yen: 149, investYen: 11916, reachRate: 23.73 },
  { games: 350, yen: 552, investYen: 11513, reachRate: 26.31 },
  { games: 400, yen: 1000, investYen: 11065, reachRate: 29.17 },
  { games: 450, yen: 1496, investYen: 10569, reachRate: 32.35 },
  { games: 500, yen: 2046, investYen: 10019, reachRate: 35.87 },
  { games: 550, yen: 2656, investYen: 9408, reachRate: 39.78 },
  { games: 600, yen: 3333, investYen: 8732, reachRate: 44.11 },
  { games: 650, yen: 4083, investYen: 7982, reachRate: 48.91 },
  { games: 700, yen: 4915, investYen: 7150, reachRate: 54.24 },
  { games: 750, yen: 5838, investYen: 6227, reachRate: 60.14 },
  { games: 800, yen: 6861, investYen: 5204, reachRate: 66.69 },
  { games: 850, yen: 7995, investYen: 4070, reachRate: 73.95 },
  { games: 900, yen: 9253, investYen: 2812, reachRate: 82.0 },
  { games: 950, yen: 10648, investYen: 1417, reachRate: 90.93 },
]

export const EV_SHORTENED: EvRow[] = [
  { games: 0, yen: 1000, investYen: 11065, reachRate: 29.17 },
  { games: 50, yen: 1496, investYen: 10569, reachRate: 32.35 },
  { games: 100, yen: 2046, investYen: 10019, reachRate: 35.87 },
  { games: 150, yen: 2656, investYen: 9408, reachRate: 39.78 },
  { games: 200, yen: 3333, investYen: 8732, reachRate: 44.11 },
  { games: 250, yen: 4083, investYen: 7982, reachRate: 48.91 },
  { games: 300, yen: 4915, investYen: 7150, reachRate: 54.24 },
  { games: 350, yen: 5838, investYen: 6227, reachRate: 60.14 },
  { games: 400, yen: 6861, investYen: 5204, reachRate: 66.69 },
  { games: 450, yen: 7995, investYen: 4070, reachRate: 73.95 },
  { games: 500, yen: 9253, investYen: 2812, reachRate: 82.0 },
  { games: 550, yen: 10648, investYen: 1417, reachRate: 90.93 },
]

export const PREMISES = {
  /** ST1回あたり平均獲得（設定1・実践） */
  avgWinMedals: 627.1,
  stHitDenom: 422.5,
  firstHitDenom: 254.2,
  payoutRate: 97.5,
  /** なな徹シミュは31.0、実戦系は31.4 */
  baseGamesPer50: 31.0,
  yenPerMedal: 20,
  ceilingG: { normal: 996, shortened: 596 },
  maxCycle: { normal: 6, shortened: 4 },
  /**
   * 周期到達時ボーナス当選率（設定1）
   * 1・2周期は「約33%以上」→ 33%で計算
   * 5周期以降は調査中 → 暫定25%
   */
  cycleHitRate: {
    1: 0.33,
    2: 0.33,
    3: 0.184,
    4: 0.336,
    5: 0.25,
    6: 1,
  } as Record<number, number>,
} as const

export function medalsPerGame(): number {
  return 50 / PREMISES.baseGamesPer50
}

export function interpolateEv(rows: EvRow[], games: number): EvRow {
  const g = Math.max(0, games)
  if (g <= rows[0].games) return rows[0]
  const last = rows[rows.length - 1]
  if (g >= last.games) return last

  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i]
    const b = rows[i + 1]
    if (g >= a.games && g <= b.games) {
      const t = (g - a.games) / (b.games - a.games)
      return {
        games: g,
        yen: a.yen + (b.yen - a.yen) * t,
        investYen: a.investYen + (b.investYen - a.investYen) * t,
        reachRate: a.reachRate + (b.reachRate - a.reachRate) * t,
      }
    }
  }
  return last
}

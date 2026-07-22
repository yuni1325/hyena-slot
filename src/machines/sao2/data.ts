/**
 * スロット ソードアート・オンラインⅡ（SAO2）— 設定1・ハイエナ用定数
 * 出典:
 * - https://nana-press.com/kaiseki/machine/1158/37243/ （AT間天井期待値・暫定）
 * - https://1geki.jp/slot/l_sao2/
 * - https://p-town.dmm.com/machines/5025
 *
 * AT間天井 = 1200G+α → AT
 * CZ間 = 実G最大499（短縮256）または液晶モード別天井 → CZ（成功≈55%でAT）
 */

export type EvRow = {
  games: number
  yen: number
  investYen: number
  reachRate: number
}

/** なな徹・AT間天井（等価・設定1・暫定・CZ天井未考慮） */
export const EV_AT: EvRow[] = [
  { games: 0, yen: -1329, investYen: 12459, reachRate: 5.25 },
  { games: 50, yen: -1239, investYen: 12368, reachRate: 5.93 },
  { games: 100, yen: -1137, investYen: 12267, reachRate: 6.71 },
  { games: 150, yen: -1022, investYen: 12151, reachRate: 7.58 },
  { games: 200, yen: -892, investYen: 12021, reachRate: 8.57 },
  { games: 250, yen: -745, investYen: 11874, reachRate: 9.69 },
  { games: 300, yen: -578, investYen: 11707, reachRate: 10.96 },
  { games: 350, yen: -390, investYen: 11519, reachRate: 12.39 },
  { games: 400, yen: -177, investYen: 11306, reachRate: 14.01 },
  { games: 450, yen: 64, investYen: 11065, reachRate: 15.85 },
  { games: 500, yen: 336, investYen: 10793, reachRate: 17.92 },
  { games: 550, yen: 644, investYen: 10485, reachRate: 20.26 },
  { games: 600, yen: 992, investYen: 10137, reachRate: 22.9 },
  { games: 650, yen: 1386, investYen: 9743, reachRate: 25.9 },
  { games: 700, yen: 1831, investYen: 9298, reachRate: 29.28 },
  { games: 750, yen: 2334, investYen: 8795, reachRate: 33.11 },
  { games: 800, yen: 2903, investYen: 8226, reachRate: 37.44 },
  { games: 850, yen: 3546, investYen: 7583, reachRate: 42.33 },
  { games: 900, yen: 4273, investYen: 6856, reachRate: 47.86 },
  { games: 950, yen: 5096, investYen: 6033, reachRate: 54.11 },
  { games: 1000, yen: 6026, investYen: 5104, reachRate: 61.18 },
  { games: 1050, yen: 7077, investYen: 4052, reachRate: 69.18 },
  { games: 1100, yen: 8265, investYen: 2864, reachRate: 78.22 },
  { games: 1150, yen: 9610, investYen: 1520, reachRate: 88.44 },
]

export type CzModeId = 'A' | 'B' | 'C' | 'D' | 'heaven'

export const CZ_MODE_LABEL: Record<CzModeId, string> = {
  A: '通常A（液晶800G）',
  B: '通常B（液晶800G）',
  C: '通常C（液晶650G）',
  D: '通常D（液晶350G）',
  heaven: '天国（液晶100G）',
}

/** 液晶ゲーム数によるCZ天井 */
export const CZ_MODE_DISPLAY_CEILING: Record<CzModeId, number> = {
  A: 800,
  B: 800,
  C: 650,
  D: 350,
  heaven: 100,
}

export const CZ_MODE_IDS: CzModeId[] = ['A', 'B', 'C', 'D', 'heaven']

export const PREMISES = {
  atCeilingG: 1200,
  czActualCeiling: { normal: 499, shortened: 256 },
  /** CZ成功→AT 期待度（なな徹・スコードロン約55%） */
  czSuccessRate: 0.55,
  tableWinMedals: (EV_AT[0].investYen + EV_AT[0].yen) / 20,
  atHitDenom: 386.2,
  czHitDenom: 238.4,
  payoutRate: 97.6,
  baseGamesPer50: 31.0,
  yenPerMedal: 20,
  pureInc: 3.6,
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

export function winMedalsFromEv(row: EvRow): number {
  return (row.investYen + row.yen) / PREMISES.yenPerMedal
}

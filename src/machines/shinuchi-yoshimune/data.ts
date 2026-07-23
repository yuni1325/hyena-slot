/**
 * 真打 吉宗 — 設定1・ハイエナ用定数
 * 出典: web情報（AT間天井・暫定）／一撃／DMM
 * - https://1geki.jp/slot/l_shinuchi_yoshimune/
 * - https://p-town.dmm.com/machines/4983
 *
 * AT間 = 通常1500 / リセット1000 / 真BIG後700 → AT
 * CZ間 = 1000G → CZ（成功≈55%）
 * 周期 = モード別最大6/4/4/1 → CZ（通常CはAT直撃）
 */

export type EvRow = {
  games: number
  yen: number
  investYen: number
  reachRate: number
}

export type Situation = 'normal' | 'reset' | 'shinBig'

export const SITUATION_LABEL: Record<Situation, string> = {
  normal: '通常（AT後など）',
  reset: '設定変更・朝一リセット',
  shinBig: '真BIG後',
}

export type CzModeId = 'A' | 'B' | 'C' | 'heaven'

export const CZ_MODE_LABEL: Record<CzModeId, string> = {
  A: '通常A（最大6周期）',
  B: '通常B（最大4周期）',
  C: '通常C（最大4周期・到達でAT）',
  heaven: '天国（最大1周期）',
}

export const CZ_MODE_MAX_CYCLE: Record<CzModeId, number> = {
  A: 6,
  B: 4,
  C: 4,
  heaven: 1,
}

export const CZ_MODE_IDS: CzModeId[] = ['A', 'B', 'C', 'heaven']

/** web情報・通常条件（等価） */
export const EV_NORMAL: EvRow[] = [
  { games: 0, yen: -1259, investYen: 15771, reachRate: 5.49 },
  { games: 50, yen: -1166, investYen: 15678, reachRate: 6.05 },
  { games: 100, yen: -1063, investYen: 15576, reachRate: 6.66 },
  { games: 150, yen: -950, investYen: 15463, reachRate: 7.34 },
  { games: 200, yen: -826, investYen: 15338, reachRate: 8.08 },
  { games: 250, yen: -689, investYen: 15201, reachRate: 8.9 },
  { games: 300, yen: -538, investYen: 15050, reachRate: 9.81 },
  { games: 350, yen: -372, investYen: 14884, reachRate: 10.8 },
  { games: 400, yen: -189, investYen: 14701, reachRate: 11.9 },
  { games: 450, yen: 13, investYen: 14499, reachRate: 13.11 },
  { games: 500, yen: 235, investYen: 14277, reachRate: 14.44 },
  { games: 550, yen: 480, investYen: 14032, reachRate: 15.91 },
  { games: 600, yen: 750, investYen: 13763, reachRate: 17.53 },
  { games: 650, yen: 1047, investYen: 13465, reachRate: 19.31 },
  { games: 700, yen: 1374, investYen: 13138, reachRate: 21.27 },
  { games: 750, yen: 1735, investYen: 12778, reachRate: 23.43 },
  { games: 800, yen: 2132, investYen: 12381, reachRate: 25.81 },
  { games: 850, yen: 2569, investYen: 11943, reachRate: 28.43 },
  { games: 900, yen: 3051, investYen: 11461, reachRate: 31.32 },
  { games: 950, yen: 3582, investYen: 10930, reachRate: 34.5 },
  { games: 1000, yen: 4167, investYen: 10345, reachRate: 38.0 },
  { games: 1050, yen: 4811, investYen: 9701, reachRate: 41.86 },
  { games: 1100, yen: 5521, investYen: 8992, reachRate: 46.12 },
  { games: 1150, yen: 6303, investYen: 8210, reachRate: 50.8 },
  { games: 1200, yen: 7164, investYen: 7349, reachRate: 55.96 },
  { games: 1250, yen: 8112, investYen: 6400, reachRate: 61.65 },
  { games: 1300, yen: 9157, investYen: 5355, reachRate: 67.91 },
  { games: 1350, yen: 10309, investYen: 4204, reachRate: 74.81 },
  { games: 1400, yen: 11577, investYen: 2936, reachRate: 82.41 },
  { games: 1450, yen: 12974, investYen: 1539, reachRate: 90.78 },
]

/** web情報・リセット時（等価） */
export const EV_RESET: EvRow[] = [
  { games: 0, yen: -1139, investYen: 14277, reachRate: 14.44 },
  { games: 50, yen: -895, investYen: 14032, reachRate: 15.91 },
  { games: 100, yen: -625, investYen: 13763, reachRate: 17.53 },
  { games: 150, yen: -328, investYen: 13465, reachRate: 19.31 },
  { games: 200, yen: -1, investYen: 13138, reachRate: 21.27 },
  { games: 250, yen: 360, investYen: 12778, reachRate: 23.43 },
  { games: 300, yen: 757, investYen: 12381, reachRate: 25.81 },
  { games: 350, yen: 1195, investYen: 11943, reachRate: 28.43 },
  { games: 400, yen: 1676, investYen: 11461, reachRate: 31.32 },
  { games: 450, yen: 2207, investYen: 10930, reachRate: 34.5 },
  { games: 500, yen: 2792, investYen: 10345, reachRate: 38.0 },
  { games: 550, yen: 3436, investYen: 9701, reachRate: 41.86 },
  { games: 600, yen: 4146, investYen: 8992, reachRate: 46.12 },
  { games: 650, yen: 4928, investYen: 8210, reachRate: 50.8 },
  { games: 700, yen: 5789, investYen: 7349, reachRate: 55.96 },
  { games: 750, yen: 6738, investYen: 6400, reachRate: 61.65 },
  { games: 800, yen: 7783, investYen: 5355, reachRate: 67.91 },
  { games: 850, yen: 8934, investYen: 4204, reachRate: 74.81 },
  { games: 900, yen: 10202, investYen: 2936, reachRate: 82.41 },
  { games: 950, yen: 11599, investYen: 1539, reachRate: 90.78 },
]

/**
 * web情報・真BIG後（等価）
 * 到達率表に450G行が無いため、投資・到達率は400–500の線形補間。
 */
export const EV_SHIN_BIG: EvRow[] = [
  { games: 0, yen: -988, investYen: 12381, reachRate: 25.81 },
  { games: 50, yen: -551, investYen: 11943, reachRate: 28.43 },
  { games: 100, yen: -69, investYen: 11461, reachRate: 31.32 },
  { games: 150, yen: 462, investYen: 10930, reachRate: 34.5 },
  { games: 200, yen: 1047, investYen: 10345, reachRate: 38.0 },
  { games: 250, yen: 1691, investYen: 9701, reachRate: 41.86 },
  { games: 300, yen: 2401, investYen: 8992, reachRate: 46.12 },
  { games: 350, yen: 3183, investYen: 8210, reachRate: 50.8 },
  { games: 400, yen: 4044, investYen: 7349, reachRate: 55.96 },
  { games: 450, yen: 6037, investYen: 6352, reachRate: 61.94 },
  { games: 500, yen: 7189, investYen: 5355, reachRate: 67.91 },
  { games: 550, yen: 8457, investYen: 4204, reachRate: 74.81 },
  { games: 600, yen: 9854, investYen: 2936, reachRate: 82.41 },
  { games: 650, yen: 11599, investYen: 1539, reachRate: 90.78 },
]

export const PREMISES = {
  atCeiling: { normal: 1500, reset: 1000, shinBig: 700 },
  czGamesCeiling: 1000,
  czSuccessRate: 0.55,
  /** 通常Cは周期到達でAT直撃 */
  modeCAtDirect: true,
  czHitDenom: 313.0,
  atHitDenom: 488.9,
  /** 1周期あたりの到達G目安（ポイント天井の自前換算） */
  avgGamesPerCycle: 200,
  baseGamesPer50: 31.0,
  yenPerMedal: 20,
  pureInc: 2.7,
  tableWinMedals: (EV_NORMAL[0].investYen + EV_NORMAL[0].yen) / 20,
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

export function atEvRowsFor(situation: Situation): EvRow[] {
  if (situation === 'reset') return EV_RESET
  if (situation === 'shinBig') return EV_SHIN_BIG
  return EV_NORMAL
}

export function atCeilingFor(situation: Situation): number {
  return PREMISES.atCeiling[situation]
}

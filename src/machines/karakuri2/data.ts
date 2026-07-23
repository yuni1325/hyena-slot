/**
 * Lパチスロ からくりサーカス2 — 設定1・ハイエナ用定数
 * 出典: web情報／一撃／DMM Pタウン
 *
 * CZ天井 = 液晶モード別 or 実890G → 女神CZ（≈55%）
 * CZスルー天井 = 4連続スルー後5回目 → AT＋激情ジャッジ
 * AT天井 = 実2500G → AT＋激情ジャッジ
 */

export type EvRow = {
  games: number
  yen: number
  investYen: number
  reachRate: number
}

export type Situation = 'normal' | 'reset'

export const SITUATION_LABEL: Record<Situation, string> = {
  normal: '通常（AT後など）',
  reset: '設定変更・朝一リセット',
}

export type ModeId = 'A' | 'B' | 'C' | 'D' | 'heaven'

export const MODE_LABEL: Record<ModeId, string> = {
  A: '通常A（液晶1101G）',
  B: '通常B（液晶701G）',
  C: '通常C（液晶1101G・到達AT）',
  D: '通常D（液晶1101G・劇場ジャッジ）',
  heaven: '天国（液晶100G）',
}

/** 通常時の液晶CZ天井 */
export const MODE_DISPLAY_CEILING: Record<ModeId, number> = {
  A: 1101,
  B: 701,
  C: 1101,
  D: 1101,
  heaven: 100,
}

export const MODE_IDS: ModeId[] = ['A', 'B', 'C', 'D', 'heaven']

/** web情報・CZ実G天井（890G・等価・暫定） */
export const EV_CZ_ACTUAL: EvRow[] = [
  { games: 0, yen: -1578, investYen: 10755, reachRate: 9.45 },
  { games: 40, yen: -1442, investYen: 10629, reachRate: 10.5 },
  { games: 90, yen: -1251, investYen: 10453, reachRate: 11.99 },
  { games: 140, yen: -1033, investYen: 10251, reachRate: 13.69 },
  { games: 190, yen: -784, investYen: 10020, reachRate: 15.63 },
  { games: 240, yen: -500, investYen: 9757, reachRate: 17.85 },
  { games: 290, yen: -176, investYen: 9457, reachRate: 20.38 },
  { games: 340, yen: 195, investYen: 9114, reachRate: 23.27 },
  { games: 390, yen: 618, investYen: 8722, reachRate: 26.56 },
  { games: 440, yen: 1100, investYen: 8275, reachRate: 30.33 },
  { games: 490, yen: 1652, investYen: 7764, reachRate: 34.63 },
  { games: 540, yen: 2281, investYen: 7181, reachRate: 39.54 },
  { games: 590, yen: 3000, investYen: 6515, reachRate: 45.14 },
  { games: 640, yen: 3821, investYen: 5755, reachRate: 51.54 },
  { games: 690, yen: 4758, investYen: 4888, reachRate: 58.85 },
  { games: 740, yen: 5827, investYen: 3897, reachRate: 67.19 },
  { games: 790, yen: 7049, investYen: 2766, reachRate: 76.71 },
  { games: 840, yen: 8443, investYen: 1475, reachRate: 87.58 },
]

/** web情報・AT天井（2500G・等価・暫定・激情ジャッジ込み） */
export const EV_AT: EvRow[] = [
  { games: 0, yen: -1218, investYen: 16321, reachRate: 0.84 },
  { games: 100, yen: -1189, investYen: 16292, reachRate: 1.02 },
  { games: 200, yen: -1153, investYen: 16256, reachRate: 1.23 },
  { games: 300, yen: -1110, investYen: 16214, reachRate: 1.49 },
  { games: 400, yen: -1058, investYen: 16162, reachRate: 1.8 },
  { games: 500, yen: -995, investYen: 16100, reachRate: 2.18 },
  { games: 600, yen: -919, investYen: 16024, reachRate: 2.64 },
  { games: 700, yen: -827, investYen: 15932, reachRate: 3.2 },
  { games: 800, yen: -715, investYen: 15821, reachRate: 3.87 },
  { games: 900, yen: -580, investYen: 15687, reachRate: 4.69 },
  { games: 1000, yen: -416, investYen: 15524, reachRate: 5.68 },
  { games: 1100, yen: -217, investYen: 15327, reachRate: 6.87 },
  { games: 1200, yen: 23, investYen: 15089, reachRate: 8.32 },
  { games: 1300, yen: 314, investYen: 14800, reachRate: 10.08 },
  { games: 1400, yen: 666, investYen: 14451, reachRate: 12.2 },
  { games: 1500, yen: 1093, investYen: 14028, reachRate: 14.77 },
  { games: 1600, yen: 1609, investYen: 13515, reachRate: 17.89 },
  { games: 1700, yen: 2234, investYen: 12895, reachRate: 21.65 },
  { games: 1800, yen: 2991, investYen: 12144, reachRate: 26.22 },
  { games: 1900, yen: 3908, investYen: 11234, reachRate: 31.74 },
  { games: 2000, yen: 5018, investYen: 10133, reachRate: 38.43 },
  { games: 2100, yen: 6361, investYen: 8800, reachRate: 46.53 },
  { games: 2200, yen: 7988, investYen: 7186, reachRate: 56.34 },
  { games: 2300, yen: 9957, investYen: 5231, reachRate: 68.22 },
  { games: 2400, yen: 12342, investYen: 2865, reachRate: 82.59 },
]

export const PREMISES = {
  czActualCeiling: 890,
  atCeiling: 2500,
  resetDisplayCeiling: 500,
  czSuccessGoddess: 0.55,
  /** 劇場ジャッジ成功≈47%→AT */
  czSuccessTheater: 0.47,
  throughCeilingHits: 5,
  czHitDenom: 342,
  atHitDenom: 519,
  baseGamesPer50: 31.8,
  yenPerMedal: 20,
  pureInc: 2.8,
  czWinMedals: (EV_CZ_ACTUAL[0].investYen + EV_CZ_ACTUAL[0].yen) / 20,
  atWinMedals: (EV_AT[0].investYen + EV_AT[0].yen) / 20,
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

export function displayCeilingFor(situation: Situation, mode: ModeId): number {
  if (situation === 'reset') return PREMISES.resetDisplayCeiling
  return MODE_DISPLAY_CEILING[mode]
}

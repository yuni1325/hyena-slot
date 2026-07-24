/**
 * Lパチスロ 炎炎ノ消防隊2 — 設定1・天井ハイエナ用定数
 * 出典: web情報（天井・狙い目）／一撃／DMM
 * - https://1geki.jp/slot/l_ennenn2/
 * - https://p-town.dmm.com/machines/4926
 *
 * 出玉率の主軸はweb情報・ボーナス間天井期待値表（実G・等価）。
 * モード別天井は残Gを通常850表へ写像して近似。
 */

export type EvRow = {
  games: number
  yen: number
  investYen: number
  reachRate: number
}

export type EnenMode = 'unknown' | 'A' | 'B' | 'C' | 'D' | 'E'

export const ENEN_MODE_IDS: Array<Exclude<EnenMode, 'unknown'>> = [
  'A',
  'B',
  'C',
  'D',
  'E',
]

export const ENEN_MODE_LABEL: Record<Exclude<EnenMode, 'unknown'>, string> = {
  A: '通常A（天井850G+α）',
  B: '通常B（天井650G+α）',
  C: '通常C（天井450G+α）',
  D: '通常D（天井250G+α）',
  E: '通常E（天井88G+α）',
}

export const ENEN_MODE_CEILING: Record<Exclude<EnenMode, 'unknown'>, number> =
  {
    A: 850,
    B: 650,
    C: 450,
    D: 250,
    E: 88,
  }

/** web情報・通常（ボーナス間850G・設定1・等価） */
export const EV_NORMAL: EvRow[] = [
  { games: 0, yen: -868, investYen: 8220, reachRate: 5.14 },
  { games: 50, yen: -783, investYen: 8135, reachRate: 6.12 },
  { games: 100, yen: -682, investYen: 8034, reachRate: 7.28 },
  { games: 150, yen: -561, investYen: 7913, reachRate: 8.67 },
  { games: 200, yen: -418, investYen: 7770, reachRate: 10.33 },
  { games: 250, yen: -247, investYen: 7599, reachRate: 12.3 },
  { games: 300, yen: -44, investYen: 7396, reachRate: 14.65 },
  { games: 350, yen: 198, investYen: 7154, reachRate: 17.44 },
  { games: 400, yen: 487, investYen: 6865, reachRate: 20.77 },
  { games: 450, yen: 830, investYen: 6522, reachRate: 24.73 },
  { games: 500, yen: 1239, investYen: 6113, reachRate: 29.45 },
  { games: 550, yen: 1726, investYen: 5626, reachRate: 35.07 },
  { games: 600, yen: 2306, investYen: 5046, reachRate: 41.76 },
  { games: 650, yen: 2996, investYen: 4356, reachRate: 49.73 },
  { games: 700, yen: 3818, investYen: 3534, reachRate: 59.22 },
  { games: 750, yen: 4798, investYen: 2554, reachRate: 70.52 },
  { games: 800, yen: 5963, investYen: 1388, reachRate: 83.98 },
]

/** web情報・設定変更時（ボーナス間650G） */
export const EV_SHORTENED: EvRow[] = [
  { games: 0, yen: -820, investYen: 7770, reachRate: 10.33 },
  { games: 50, yen: -649, investYen: 7599, reachRate: 12.3 },
  { games: 100, yen: -446, investYen: 7396, reachRate: 14.65 },
  { games: 150, yen: -204, investYen: 7154, reachRate: 17.44 },
  { games: 200, yen: 84, investYen: 6865, reachRate: 20.77 },
  { games: 250, yen: 428, investYen: 6522, reachRate: 24.73 },
  { games: 300, yen: 837, investYen: 6113, reachRate: 29.45 },
  { games: 350, yen: 1324, investYen: 5626, reachRate: 35.07 },
  { games: 400, yen: 1903, investYen: 5046, reachRate: 41.76 },
  { games: 450, yen: 2594, investYen: 4356, reachRate: 49.73 },
  { games: 500, yen: 3416, investYen: 3534, reachRate: 59.22 },
  { games: 550, yen: 4395, investYen: 2554, reachRate: 70.52 },
  { games: 600, yen: 5561, investYen: 1388, reachRate: 83.98 },
]

export const PREMISES = {
  tableWinMedals: (EV_NORMAL[0].investYen + EV_NORMAL[0].yen) / 20,
  bonusHitDenom: 272,
  /** 炎炎ループ初当たり（設定1） */
  loopHitDenom: 684,
  payoutRate: 97.7,
  baseGamesPer50: 33.1,
  yenPerMedal: 20,
  pureInc: 5.8,
  bonusCeilingG: { normal: 850, shortened: 650 },
  /** 炎炎ループ間天井（参考・表なし） */
  loopCeilingG: { normal: 2000, shortened: 1500 },
  /** 伝導者の罠スルー天井 */
  trapThroughMax: 5,
  /** 伝導者の罠成功率（ボーナス当選期待度） */
  trapSuccessRate: 0.4,
  /**
   * SPボーナス（スペシャルエピソード）経由の期待獲得出玉目安。
   * 炎炎大戦ループ期待≈1200枚を代理（表の通常初当たりより厚い）。
   */
  spWinMedals: 1200,
  refCeilingG: 850,
  stopNote: '伝導者の罠or炎炎激闘潜伏終了後即ヤメ',
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

export function resolveEnenMode(
  mode: EnenMode,
): Exclude<EnenMode, 'unknown'> {
  return mode === 'unknown' ? 'A' : mode
}

export function modeCeilingFor(mode: EnenMode): number {
  return ENEN_MODE_CEILING[resolveEnenMode(mode)]
}

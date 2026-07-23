/**
 * スマスロ ミリオンゴッド-神々の軌跡- — 設定1・ハイエナ用定数
 * 出典: web情報（天井期待値・暫定）／一撃／DMM
 * - https://1geki.jp/slot/l_milliongod_kiseki/
 * - https://p-town.dmm.com/machines/4961
 *
 * GG間天井 = 通常1480G+α / リセット時 510・1000・1480（15.2%・20.3%・64.5%）
 */

export type EvRow = {
  games: number
  yen: number
  investYen: number
  reachRate: number
}

export type Phase = 'normal' | 'reset'

export const PHASE_LABEL: Record<Phase, string> = {
  normal: '通常（GG後など）',
  reset: '設定変更・朝一リセット',
}

/** web情報・通常条件（等価・設定1・暫定） */
export const EV_NORMAL: EvRow[] = [
  { games: 0, yen: -1093, investYen: 17308, reachRate: 7.69 },
  { games: 50, yen: -962, investYen: 17177, reachRate: 8.39 },
  { games: 100, yen: -820, investYen: 17035, reachRate: 9.15 },
  { games: 150, yen: -664, investYen: 16880, reachRate: 9.98 },
  { games: 200, yen: -495, investYen: 16710, reachRate: 10.88 },
  { games: 250, yen: -310, investYen: 16526, reachRate: 11.86 },
  { games: 300, yen: -109, investYen: 16324, reachRate: 12.94 },
  { games: 350, yen: 110, investYen: 16105, reachRate: 14.11 },
  { games: 400, yen: 350, investYen: 15865, reachRate: 15.39 },
  { games: 450, yen: 611, investYen: 15604, reachRate: 16.78 },
  { games: 500, yen: 896, investYen: 15319, reachRate: 18.3 },
  { games: 510, yen: 956, investYen: 15259, reachRate: 18.62 },
  { games: 550, yen: 1206, investYen: 15009, reachRate: 19.95 },
  { games: 600, yen: 1545, investYen: 14670, reachRate: 21.76 },
  { games: 650, yen: 1914, investYen: 14301, reachRate: 23.73 },
  { games: 700, yen: 2317, investYen: 13898, reachRate: 25.88 },
  { games: 750, yen: 2756, investYen: 13459, reachRate: 28.22 },
  { games: 800, yen: 3235, investYen: 12980, reachRate: 30.77 },
  { games: 850, yen: 3758, investYen: 12458, reachRate: 33.56 },
  { games: 900, yen: 4327, investYen: 11888, reachRate: 36.6 },
  { games: 950, yen: 4948, investYen: 11267, reachRate: 39.91 },
  { games: 1000, yen: 5626, investYen: 10590, reachRate: 43.52 },
  { games: 1050, yen: 6364, investYen: 9851, reachRate: 47.46 },
  { games: 1100, yen: 7170, investYen: 9045, reachRate: 51.76 },
  { games: 1150, yen: 8048, investYen: 8167, reachRate: 56.44 },
  { games: 1200, yen: 9006, investYen: 7209, reachRate: 61.55 },
  { games: 1250, yen: 10051, investYen: 6164, reachRate: 67.13 },
  { games: 1300, yen: 11190, investYen: 5025, reachRate: 73.2 },
  { games: 1350, yen: 12433, investYen: 3782, reachRate: 79.83 },
  { games: 1400, yen: 13788, investYen: 2427, reachRate: 87.05 },
  { games: 1450, yen: 15265, investYen: 950, reachRate: 94.93 },
]

/**
 * web情報・リセット時（等価・設定1・暫定・ベイズ更新あり）
 * 510G超で510天井が消えるため期待値が一度落ちる。
 */
export const EV_RESET: EvRow[] = [
  { games: 0, yen: 246, investYen: 15970, reachRate: 14.83 },
  { games: 50, yen: 497, investYen: 15718, reachRate: 16.17 },
  { games: 100, yen: 772, investYen: 15443, reachRate: 17.64 },
  { games: 150, yen: 1071, investYen: 15144, reachRate: 19.23 },
  { games: 200, yen: 1398, investYen: 14818, reachRate: 20.97 },
  { games: 250, yen: 1754, investYen: 14462, reachRate: 22.87 },
  { games: 300, yen: 2142, investYen: 14073, reachRate: 24.94 },
  { games: 350, yen: 2565, investYen: 13650, reachRate: 27.2 },
  { games: 400, yen: 3027, investYen: 13188, reachRate: 29.66 },
  { games: 450, yen: 3530, investYen: 12685, reachRate: 32.35 },
  { games: 500, yen: 4079, investYen: 12136, reachRate: 35.27 },
  { games: 510, yen: 2040, investYen: 14175, reachRate: 24.4 },
  { games: 550, yen: 2369, investYen: 13847, reachRate: 26.15 },
  { games: 600, yen: 2812, investYen: 13403, reachRate: 28.52 },
  { games: 650, yen: 3296, investYen: 12919, reachRate: 31.1 },
  { games: 700, yen: 3824, investYen: 12391, reachRate: 33.92 },
  { games: 750, yen: 4400, investYen: 11815, reachRate: 36.99 },
  { games: 800, yen: 5028, investYen: 11188, reachRate: 40.33 },
  { games: 850, yen: 5712, investYen: 10503, reachRate: 43.98 },
  { games: 900, yen: 6459, investYen: 9756, reachRate: 47.97 },
  { games: 950, yen: 7273, investYen: 8942, reachRate: 52.31 },
  { games: 1000, yen: 5626, investYen: 10590, reachRate: 43.52 },
  { games: 1050, yen: 6364, investYen: 9851, reachRate: 47.46 },
  { games: 1100, yen: 7170, investYen: 9045, reachRate: 51.76 },
  { games: 1150, yen: 8048, investYen: 8167, reachRate: 56.44 },
  { games: 1200, yen: 9006, investYen: 7209, reachRate: 61.55 },
  { games: 1250, yen: 10051, investYen: 6164, reachRate: 67.13 },
  { games: 1300, yen: 11190, investYen: 5025, reachRate: 73.2 },
  { games: 1350, yen: 12433, investYen: 3782, reachRate: 79.83 },
  { games: 1400, yen: 13788, investYen: 2427, reachRate: 87.05 },
  { games: 1450, yen: 15265, investYen: 950, reachRate: 94.93 },
]

export const PREMISES = {
  ceilingG: 1480,
  resetCeilings: { g510: 0.152, g1000: 0.203, g1480: 0.645 },
  ggHitDenom: 533,
  payoutRate: 97.2,
  baseGamesPer50: 30.8,
  yenPerMedal: 20,
  pureInc: 7.0,
  /** 通常表0Gから逆算（天井恩恵・ループストック込み） */
  tableWinMedals: (EV_NORMAL[0].investYen + EV_NORMAL[0].yen) / 20,
} as const

export function medalsPerGame(): number {
  return 50 / PREMISES.baseGamesPer50
}

export function evRowsFor(phase: Phase): EvRow[] {
  return phase === 'reset' ? EV_RESET : EV_NORMAL
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

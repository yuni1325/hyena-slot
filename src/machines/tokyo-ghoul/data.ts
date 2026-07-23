/**
 * L 東京喰種 — 設定1・ハイエナ用定数
 * 出典: web情報（天井・狙い目）／一撃／DMM
 * - https://1geki.jp/slot/l_tokyoghoul/
 * - https://p-town.dmm.com/machines/4742
 *
 * AT間天井 = 実G（スイカ加算なし）最大1200G → AT
 * CZ間天井 = 表示G（加算込み）最大600G+α（モードで変動）→ CZ
 */

export type EvRow = {
  games: number
  yen: number
  investYen: number
  reachRate: number
}

/** CZ間天井の種類（表示G基準） */
export type CzCeilingKind =
  | 'normal600'
  | 'modeC500'
  | 'heavenPrep300'
  | 'heaven100'
  | 'reset200'

export const CZ_CEILING_G: Record<CzCeilingKind, number> = {
  normal600: 600,
  modeC500: 500,
  heavenPrep300: 300,
  heaven100: 100,
  reset200: 200,
}

export const CZ_CEILING_LABEL: Record<CzCeilingKind, string> = {
  normal600: '通常A/B・チャンス（600G+α）',
  modeC500: '通常C（500G+α）',
  heavenPrep300: '天国準備（300G+α）',
  heaven100: '天国（100G+α）',
  reset200: '設定変更・朝一（200G+α）',
}

/** web情報・AT間天井期待値（実G・設定1） */
export const EV_AT: EvRow[] = [
  { games: 0, yen: -815, investYen: 12723, reachRate: 5.65 },
  { games: 50, yen: -718, investYen: 12626, reachRate: 6.36 },
  { games: 100, yen: -609, investYen: 12517, reachRate: 7.17 },
  { games: 150, yen: -486, investYen: 12393, reachRate: 8.09 },
  { games: 200, yen: -347, investYen: 12255, reachRate: 9.12 },
  { games: 250, yen: -191, investYen: 12098, reachRate: 10.28 },
  { games: 300, yen: -14, investYen: 11922, reachRate: 11.58 },
  { games: 350, yen: 184, investYen: 11723, reachRate: 13.06 },
  { games: 400, yen: 408, investYen: 11499, reachRate: 14.72 },
  { games: 450, yen: 661, investYen: 11247, reachRate: 16.59 },
  { games: 500, yen: 945, investYen: 10962, reachRate: 18.7 },
  { games: 550, yen: 1266, investYen: 10642, reachRate: 21.08 },
  { games: 600, yen: 1628, investYen: 10280, reachRate: 23.76 },
  { games: 650, yen: 2035, investYen: 9872, reachRate: 26.78 },
  { games: 700, yen: 2495, investYen: 9413, reachRate: 30.19 },
  { games: 750, yen: 3013, investYen: 8895, reachRate: 34.03 },
  { games: 800, yen: 3597, investYen: 8311, reachRate: 38.36 },
  { games: 850, yen: 4255, investYen: 7653, reachRate: 43.24 },
  { games: 900, yen: 4997, investYen: 6911, reachRate: 48.75 },
  { games: 950, yen: 5833, investYen: 6075, reachRate: 54.95 },
  { games: 1000, yen: 6775, investYen: 5132, reachRate: 61.94 },
  { games: 1050, yen: 7838, investYen: 4070, reachRate: 69.82 },
  { games: 1100, yen: 9036, investYen: 2872, reachRate: 78.7 },
  { games: 1150, yen: 10386, investYen: 1522, reachRate: 88.71 },
]

/** web情報・CZ間天井通常（表示G・最大600・モード未考慮） */
export const EV_CZ_NORMAL: EvRow[] = [
  { games: 0, yen: -1018, investYen: 8471, reachRate: 13.96 },
  { games: 50, yen: -773, investYen: 8226, reachRate: 16.45 },
  { games: 100, yen: -485, investYen: 7937, reachRate: 19.38 },
  { games: 150, yen: -144, investYen: 7597, reachRate: 22.84 },
  { games: 200, yen: 257, investYen: 7196, reachRate: 26.91 },
  { games: 250, yen: 729, investYen: 6724, reachRate: 31.71 },
  { games: 300, yen: 1286, investYen: 6167, reachRate: 37.36 },
  { games: 350, yen: 1942, investYen: 5511, reachRate: 44.02 },
  { games: 400, yen: 2714, investYen: 4738, reachRate: 51.87 },
  { games: 450, yen: 3625, investYen: 3828, reachRate: 61.12 },
  { games: 500, yen: 4698, investYen: 2754, reachRate: 72.02 },
  { games: 550, yen: 5963, investYen: 1490, reachRate: 84.87 },
]

/** web情報・CZ間天井 設定変更（朝一200G） */
export const EV_CZ_RESET: EvRow[] = [
  { games: 0, yen: 257, investYen: 4738, reachRate: 51.87 },
  { games: 20, yen: 603, investYen: 4392, reachRate: 55.39 },
  { games: 40, yen: 973, investYen: 4022, reachRate: 59.15 },
  { games: 60, yen: 1368, investYen: 3627, reachRate: 63.16 },
  { games: 80, yen: 1790, investYen: 3205, reachRate: 67.45 },
  { games: 100, yen: 2240, investYen: 2754, reachRate: 72.02 },
  { games: 120, yen: 2722, investYen: 2273, reachRate: 76.91 },
  { games: 140, yen: 3235, investYen: 1760, reachRate: 82.13 },
  { games: 160, yen: 3784, investYen: 1211, reachRate: 87.7 },
  { games: 180, yen: 4369, investYen: 625, reachRate: 93.65 },
]

export const PREMISES = {
  atCeilingG: 1200,
  baseGamesPer50: 31.0,
  yenPerMedal: 20,
  atHitDenom: 394.4,
  czHitDenom: 262.6,
  pureInc: 4.0,
  /** AT表から逆算した一定獲得 */
  atWinMedals: (EV_AT[0].investYen + EV_AT[0].yen) / 20,
  czWinMedalsNormal: (EV_CZ_NORMAL[0].investYen + EV_CZ_NORMAL[0].yen) / 20,
  czWinMedalsReset: (EV_CZ_RESET[0].investYen + EV_CZ_RESET[0].yen) / 20,
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

export function czEvRowsFor(kind: CzCeilingKind): EvRow[] {
  if (kind === 'reset200') return EV_CZ_RESET
  // 通常C/天国等も通常600表を使い、calc側で「天井残りG」が同じ位置へ写す
  return EV_CZ_NORMAL
}

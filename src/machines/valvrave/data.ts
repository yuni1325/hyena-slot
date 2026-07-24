/**
 * パチスロ 革命機ヴァルヴレイヴ（ヴヴヴ）— 設定1・天井ハイエナ用定数
 * 出典: web情報（天井・狙い目）／一撃／DMM
 * - https://1geki.jp/slot/s_valvrave/
 * - https://p-town.dmm.com/machines/4244
 *
 * 出玉率の主軸はweb情報・ボーナス&AT間天井期待値表（実G・等価）。
 * CZ間はモード別天井の残り表示（期待値表は非公開のため出玉率未算出）。
 */

export type EvRow = {
  games: number
  yen: number
  investYen: number
  reachRate: number
}

/** CZ天井モード（液晶表示G） */
export type CzMode = 'unknown' | 'A' | 'B' | 'C' | 'D'

export const CZ_MODE_IDS: Array<Exclude<CzMode, 'unknown'>> = [
  'A',
  'B',
  'C',
  'D',
]

export const CZ_MODE_LABEL: Record<Exclude<CzMode, 'unknown'>, string> = {
  A: 'モードA（CZ天井1000G+α）',
  B: 'モードB（CZ天井700G+α）',
  C: 'モードC（CZ天井500G+α）',
  D: 'モードD（CZ天井300G+α）',
}

export const CZ_MODE_CEILING: Record<Exclude<CzMode, 'unknown'>, number> = {
  A: 1000,
  B: 700,
  C: 500,
  D: 300,
}

/** web情報・ボーナス&AT間天井期待値（実G・設定1・等価） */
export const EV_BONUS: EvRow[] = [
  { games: 0, yen: -2005, investYen: 16742, reachRate: 6.73 },
  { games: 50, yen: -1885, investYen: 16628, reachRate: 7.37 },
  { games: 100, yen: -1753, investYen: 16504, reachRate: 8.06 },
  { games: 150, yen: -1609, investYen: 16368, reachRate: 8.82 },
  { games: 200, yen: -1451, investYen: 16219, reachRate: 9.65 },
  { games: 250, yen: -1279, investYen: 16056, reachRate: 10.56 },
  { games: 300, yen: -1090, investYen: 15877, reachRate: 11.55 },
  { games: 350, yen: -883, investYen: 15682, reachRate: 12.64 },
  { games: 400, yen: -657, investYen: 15469, reachRate: 13.83 },
  { games: 450, yen: -410, investYen: 15235, reachRate: 15.13 },
  { games: 500, yen: -139, investYen: 14980, reachRate: 16.55 },
  { games: 550, yen: 157, investYen: 14700, reachRate: 18.11 },
  { games: 600, yen: 481, investYen: 14394, reachRate: 19.81 },
  { games: 650, yen: 835, investYen: 14059, reachRate: 21.68 },
  { games: 700, yen: 1223, investYen: 13693, reachRate: 23.72 },
  { games: 750, yen: 1648, investYen: 13293, reachRate: 25.95 },
  { games: 800, yen: 2112, investYen: 12854, reachRate: 28.39 },
  { games: 850, yen: 2620, investYen: 12375, reachRate: 31.06 },
  { games: 900, yen: 3175, investYen: 11850, reachRate: 33.99 },
  { games: 950, yen: 3783, investYen: 11276, reachRate: 37.19 },
  { games: 1000, yen: 4449, investYen: 10648, reachRate: 40.68 },
  { games: 1050, yen: 5176, investYen: 9960, reachRate: 44.51 },
  { games: 1100, yen: 5973, investYen: 9208, reachRate: 48.7 },
  { games: 1150, yen: 6844, investYen: 8386, reachRate: 53.28 },
  { games: 1200, yen: 7797, investYen: 7486, reachRate: 58.3 },
  { games: 1250, yen: 8840, investYen: 6501, reachRate: 63.78 },
  { games: 1300, yen: 9981, investYen: 5424, reachRate: 69.79 },
  { games: 1350, yen: 11229, investYen: 4245, reachRate: 76.35 },
  { games: 1400, yen: 12595, investYen: 2955, reachRate: 83.54 },
  { games: 1450, yen: 14089, investYen: 1544, reachRate: 91.4 },
]

export const PREMISES = {
  tableWinMedals: (EV_BONUS[0].investYen + EV_BONUS[0].yen) / 20,
  bonusHitDenom: 519,
  /** 設定1 CZ確率 */
  czHitDenom: 277,
  /** 共闘Vチャレンジ成功率（ボーナス当選期待度） */
  czSuccessRate: 0.52,
  /**
   * CZ成功後のボーナス種別ごとの平均獲得出玉（枚）。
   * 振り分け不明のため等分近似。
   */
  bonusWinMedals: { revolution: 470, kessen: 110 } as const,
  bonusTypeSplit: { revolution: 0.5, kessen: 0.5 } as const,
  payoutRate: 97.3,
  baseGamesPer50: 31.0,
  yenPerMedal: 20,
  pureInc: 7.2,
  /** ボーナス&AT間天井（実G） */
  bonusCeilingG: 1500,
  /** CZスルー天井 */
  czThroughMax: 7,
  /** 決戦ボーナス連続スルー天井 */
  kessenThroughMax: 4,
  /** ヤメ時: ボーナスorAT終了後66G消化後即ヤメ（表条件） */
  stopAfterBonusGames: 66,
} as const

/** CZ成功後の期待獲得出玉（革命/決戦の混合） */
export function expectedWinMedalsAfterCzSuccess(): number {
  const { revolution, kessen } = PREMISES.bonusWinMedals
  const w = PREMISES.bonusTypeSplit
  return revolution * w.revolution + kessen * w.kessen
}

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

export function resolveCzMode(mode: CzMode): Exclude<CzMode, 'unknown'> {
  return mode === 'unknown' ? 'A' : mode
}

export function czCeilingFor(mode: CzMode): number {
  return CZ_MODE_CEILING[resolveCzMode(mode)]
}

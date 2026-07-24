/**
 * Lパチスロ 革命機ヴァルヴレイヴ2（ヴヴヴ2）— 設定1・天井ハイエナ用定数
 * 出典: web情報（天井・狙い目）／一撃／DMM
 * - https://1geki.jp/slot/l_valvrave2/
 * - https://p-town.dmm.com/machines/4885
 *
 * 出玉率の主軸はweb情報・ボーナス&AT間天井期待値表（実G・等価・暫定）。
 * CZ間999G・周期天井は自前近似で比較。
 */

export type EvRow = {
  games: number
  yen: number
  investYen: number
  reachRate: number
}

/** 周期モード */
export type PeriodMode = 'unknown' | 'A' | 'B' | 'C' | 'heaven'

export const PERIOD_MODE_IDS: Array<Exclude<PeriodMode, 'unknown'>> = [
  'A',
  'B',
  'C',
  'heaven',
]

export const PERIOD_MODE_LABEL: Record<
  Exclude<PeriodMode, 'unknown'>,
  string
> = {
  A: '通常A（最大6周期）',
  B: '通常B（最大3周期）',
  C: '通常C（最大5周期）',
  heaven: '天国（1周期）',
}

export const PERIOD_MODE_MAX: Record<Exclude<PeriodMode, 'unknown'>, number> = {
  A: 6,
  B: 3,
  C: 5,
  heaven: 1,
}

/** web情報・通常（ボーナス&AT間1500G・設定1・等価・暫定） */
export const EV_NORMAL: EvRow[] = [
  { games: 0, yen: -1454, investYen: 14558, reachRate: 5.0 },
  { games: 50, yen: -1373, investYen: 14478, reachRate: 5.52 },
  { games: 100, yen: -1284, investYen: 14389, reachRate: 6.1 },
  { games: 150, yen: -1186, investYen: 14291, reachRate: 6.74 },
  { games: 200, yen: -1078, investYen: 14182, reachRate: 7.45 },
  { games: 250, yen: -958, investYen: 14063, reachRate: 8.23 },
  { games: 300, yen: -825, investYen: 13930, reachRate: 9.1 },
  { games: 350, yen: -679, investYen: 13784, reachRate: 10.05 },
  { games: 400, yen: -517, investYen: 13622, reachRate: 11.11 },
  { games: 450, yen: -338, investYen: 13443, reachRate: 12.28 },
  { games: 500, yen: -141, investYen: 13245, reachRate: 13.57 },
  { games: 550, yen: 78, investYen: 13027, reachRate: 14.99 },
  { games: 600, yen: 319, investYen: 12786, reachRate: 16.57 },
  { games: 650, yen: 586, investYen: 12519, reachRate: 18.31 },
  { games: 700, yen: 880, investYen: 12224, reachRate: 20.23 },
  { games: 750, yen: 1206, investYen: 11899, reachRate: 22.35 },
  { games: 800, yen: 1566, investYen: 11539, reachRate: 24.7 },
  { games: 850, yen: 1963, investYen: 11141, reachRate: 27.3 },
  { games: 900, yen: 2403, investYen: 10702, reachRate: 30.16 },
  { games: 950, yen: 2888, investYen: 10216, reachRate: 33.33 },
  { games: 1000, yen: 3425, investYen: 9680, reachRate: 36.83 },
  { games: 1050, yen: 4018, investYen: 9087, reachRate: 40.7 },
  { games: 1100, yen: 4673, investYen: 8432, reachRate: 44.98 },
  { games: 1150, yen: 5397, investYen: 7708, reachRate: 49.7 },
  { games: 1200, yen: 6197, investYen: 6908, reachRate: 54.92 },
  { games: 1250, yen: 7081, investYen: 6024, reachRate: 60.69 },
  { games: 1300, yen: 8058, investYen: 5047, reachRate: 67.06 },
  { games: 1350, yen: 9137, investYen: 3968, reachRate: 74.11 },
  { games: 1400, yen: 10330, investYen: 2775, reachRate: 81.89 },
  { games: 1450, yen: 11648, investYen: 1457, reachRate: 90.49 },
]

/** web情報・設定変更時（ボーナス&AT間1000G・暫定） */
export const EV_SHORTENED: EvRow[] = [
  { games: 0, yen: -1323, investYen: 13245, reachRate: 13.57 },
  { games: 50, yen: -1104, investYen: 13027, reachRate: 14.99 },
  { games: 100, yen: -863, investYen: 12786, reachRate: 16.57 },
  { games: 150, yen: -596, investYen: 12519, reachRate: 18.31 },
  { games: 200, yen: -302, investYen: 12224, reachRate: 20.23 },
  { games: 250, yen: 24, investYen: 11899, reachRate: 22.35 },
  { games: 300, yen: 384, investYen: 11539, reachRate: 24.7 },
  { games: 350, yen: 781, investYen: 11141, reachRate: 27.3 },
  { games: 400, yen: 1221, investYen: 10702, reachRate: 30.16 },
  { games: 450, yen: 1706, investYen: 10216, reachRate: 33.33 },
  { games: 500, yen: 2243, investYen: 9680, reachRate: 36.83 },
  { games: 550, yen: 2836, investYen: 9087, reachRate: 40.7 },
  { games: 600, yen: 3491, investYen: 8432, reachRate: 44.98 },
  { games: 650, yen: 4215, investYen: 7708, reachRate: 49.7 },
  { games: 700, yen: 5015, investYen: 6908, reachRate: 54.92 },
  { games: 750, yen: 5899, investYen: 6024, reachRate: 60.69 },
  { games: 800, yen: 6876, investYen: 5047, reachRate: 67.06 },
  { games: 850, yen: 7955, investYen: 3968, reachRate: 74.11 },
  { games: 900, yen: 9148, investYen: 2775, reachRate: 81.89 },
  { games: 950, yen: 10466, investYen: 1457, reachRate: 90.49 },
]

export const PREMISES = {
  tableWinMedals: (EV_NORMAL[0].investYen + EV_NORMAL[0].yen) / 20,
  bonusHitDenom: 476,
  /** 全設定共通 CZ確率 */
  czHitDenom: 324,
  /** ドルシア攻防戦・ボーナス期待度 */
  czSuccessRate: 0.6,
  bonusWinMedals: { revolution: 460, kessen: 200 } as const,
  bonusTypeSplit: { revolution: 0.5, kessen: 0.5 } as const,
  payoutRate: 97.7,
  baseGamesPer50: 32.7,
  yenPerMedal: 20,
  pureInc: 9.0,
  bonusCeilingG: { normal: 1500, shortened: 1000 },
  /** CZ間天井（実G想定） */
  czCeilingG: 999,
  /** 決戦ボーナス連続スルー天井 */
  kessenThroughMax: 3,
  /** 周期到達の平均G目安 */
  cycleAvgReach: { 1: 90, later: 100 } as const,
  maxCycle: { normal: 6, shortened: 3 },
  stopAfterBonusGames: 66,
} as const

export function expectedWinMedalsAfterCzSuccess(
  kessenThroughReady: boolean,
): number {
  if (kessenThroughReady) return PREMISES.bonusWinMedals.revolution
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

export function resolvePeriodMode(
  mode: PeriodMode,
): Exclude<PeriodMode, 'unknown'> {
  return mode === 'unknown' ? 'A' : mode
}

export function avgReachForCycle(cycle: number): number {
  return cycle <= 1
    ? PREMISES.cycleAvgReach[1]
    : PREMISES.cycleAvgReach.later
}

export function effectiveMaxCycle(
  mode: PeriodMode,
  shortened: boolean,
): number {
  const resolved = resolvePeriodMode(mode)
  const byShort = shortened
    ? PREMISES.maxCycle.shortened
    : PREMISES.maxCycle.normal
  return Math.min(PERIOD_MODE_MAX[resolved], byShort)
}

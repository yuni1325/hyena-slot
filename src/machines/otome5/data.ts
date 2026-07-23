/**
 * L戦国乙女5 業火を穿つ宿焔の双刃 — 設定1・ハイエナ用定数
 * 出典: web情報（天井・周期・暫定）／一撃／DMM
 * - https://1geki.jp/slot/l_otome5/
 * - https://p-town.dmm.com/machines/5009
 *
 * ゲーム数天井 = 実G（強カワチャンス加算は含まない）999 / 短縮650
 * 周期天井 = 最大6 / 短縮4。1周期は表示Gで最大500G+α
 */

export type EvRow = {
  games: number
  yen: number
  investYen: number
  reachRate: number
}

/** web情報・通常天井（実G・等価・設定1・暫定） */
export const EV_NORMAL: EvRow[] = [
  { games: 0, yen: -1541, investYen: 11597, reachRate: 7.66 },
  { games: 50, yen: -1409, investYen: 11465, reachRate: 8.71 },
  { games: 100, yen: -1259, investYen: 11315, reachRate: 9.91 },
  { games: 150, yen: -1088, investYen: 11144, reachRate: 11.26 },
  { games: 200, yen: -894, investYen: 10950, reachRate: 12.81 },
  { games: 250, yen: -673, investYen: 10729, reachRate: 14.57 },
  { games: 300, yen: -422, investYen: 10478, reachRate: 16.57 },
  { games: 350, yen: -137, investYen: 10193, reachRate: 18.84 },
  { games: 400, yen: 188, investYen: 9868, reachRate: 21.43 },
  { games: 450, yen: 557, investYen: 9499, reachRate: 24.37 },
  { games: 500, yen: 977, investYen: 9079, reachRate: 27.71 },
  { games: 550, yen: 1455, investYen: 8601, reachRate: 31.51 },
  { games: 600, yen: 1998, investYen: 8058, reachRate: 35.84 },
  { games: 650, yen: 2615, investYen: 7440, reachRate: 40.76 },
  { games: 700, yen: 3318, investYen: 6738, reachRate: 46.35 },
  { games: 750, yen: 4116, investYen: 5939, reachRate: 52.71 },
  { games: 800, yen: 5025, investYen: 5031, reachRate: 59.94 },
  { games: 850, yen: 6058, investYen: 3998, reachRate: 68.17 },
  { games: 900, yen: 7233, investYen: 2823, reachRate: 77.52 },
  { games: 950, yen: 8569, investYen: 1487, reachRate: 88.16 },
]

/** web情報・設定変更天井（実G・等価・設定1・暫定） */
export const EV_SHORTENED: EvRow[] = [
  { games: 0, yen: -1355, investYen: 10199, reachRate: 18.79 },
  { games: 50, yen: -1031, investYen: 9875, reachRate: 21.37 },
  { games: 100, yen: -663, investYen: 9506, reachRate: 24.3 },
  { games: 150, yen: -244, investYen: 9088, reachRate: 27.64 },
  { games: 200, yen: 232, investYen: 8611, reachRate: 31.43 },
  { games: 250, yen: 774, investYen: 8070, reachRate: 35.75 },
  { games: 300, yen: 1390, investYen: 7454, reachRate: 40.65 },
  { games: 350, yen: 2090, investYen: 6753, reachRate: 46.23 },
  { games: 400, yen: 2887, investYen: 5956, reachRate: 52.57 },
  { games: 450, yen: 3793, investYen: 5050, reachRate: 59.79 },
  { games: 500, yen: 4823, investYen: 4020, reachRate: 67.99 },
  { games: 550, yen: 5995, investYen: 2848, reachRate: 77.32 },
  { games: 600, yen: 7328, investYen: 1515, reachRate: 87.93 },
]

export const PREMISES = {
  tableWinMedals: (EV_NORMAL[0].investYen + EV_NORMAL[0].yen) / 20,
  atHitDenom: 359.5,
  payoutRate: 97.9,
  baseGamesPer50: 31.0,
  yenPerMedal: 20,
  /** AT「強カワラッシュ」純増目安（枚/G） */
  pureInc: 2.7,
  ceilingG: { normal: 999, shortened: 650 },
  maxCycle: { normal: 6, shortened: 4 },
  /**
   * 周期到達時AT期待度（設定1・web情報）。
   * 3〜5周期は「30%以上」→保守で30%。
   */
  cycleAtRate: {
    1: 0.4,
    2: 0.4,
    3: 0.3,
    4: 0.3,
    5: 0.3,
    6: 1,
  } as Record<number, number>,
  /**
   * 表示Gでの1周期到達目安（モード混合の仮置き・主表示用）。
   * 1周期目は引き戻し寄り（最大200）、以降はモードA/B混合寄り。
   */
  cycleAvgReachDisplay: { 1: 180, later: 280 } as const,
  /** 表示G周期のハード上限 */
  cycleDisplayHardCap: 500,
  cycleCorrectionScale: 0.5,
} as const

/** 周期テーブル（天井周期） */
export type PeriodTableId = 'A' | 'B' | 'heaven'

export const PERIOD_TABLE_LABEL: Record<PeriodTableId, string> = {
  A: '通常A（最大6周期）',
  B: '通常B（最大3周期）',
  heaven: '天国（1周期）',
}

export const PERIOD_TABLE_MAX: Record<PeriodTableId, number> = {
  A: 6,
  B: 3,
  heaven: 1,
}

/** 周期モード（規定G） */
export type PeriodModeId = 'A' | 'B' | 'C' | 'chance' | 'pullback'

export const PERIOD_MODE_LABEL: Record<PeriodModeId, string> = {
  A: 'モードA（最大500G）',
  B: 'モードB（最大300G）',
  C: 'モードC（最大200G）',
  chance: 'チャンス（最大50G）',
  pullback: '引き戻し（最大200G）',
}

/** モード別・周期到達のハード上限（表示G） */
export const PERIOD_MODE_HARD: Record<PeriodModeId, number> = {
  A: 500,
  B: 300,
  C: 200,
  chance: 50,
  pullback: 200,
}

/**
 * モード別・平均到達G（表示）。ハード直前ゾーン寄りにやや短め。
 * 以降周期も同モード継続想定（B/Cは転落しにくい）。
 */
export const PERIOD_MODE_AVG: Record<PeriodModeId, number> = {
  A: 340,
  B: 220,
  C: 140,
  chance: 50,
  pullback: 140,
}

export const PERIOD_TABLE_IDS: PeriodTableId[] = ['A', 'B', 'heaven']
export const PERIOD_MODE_IDS: PeriodModeId[] = [
  'A',
  'B',
  'C',
  'chance',
  'pullback',
]

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

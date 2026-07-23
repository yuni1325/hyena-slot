/**
 * スマスロモンキーターンⅤ — 設定1・天井ハイエナ用定数
 * 出典: web情報（天井・狙い目）／一撃／DMM
 * - https://1geki.jp/slot/l_monkeyturn5/
 * - https://p-town.dmm.com/machines/4450
 *
 * 出玉率の主軸はweb情報ゲーム数天井期待値表（周期・モード未考慮）。
 * 周期・モード・表示Gは補正として加味する。
 */

export type EvRow = {
  games: number
  yen: number
  investYen: number
  reachRate: number
}

/** 不明は通常Aとして主計算する */
export type MonkeyMode = 'A' | 'B' | 'heaven' | 'unknown'

export const MODE_IDS: Array<Exclude<MonkeyMode, 'unknown'>> = [
  'A',
  'B',
  'heaven',
]

export const MODE_LABEL: Record<Exclude<MonkeyMode, 'unknown'>, string> = {
  A: '通常A（最大6周期）',
  B: '通常B（最大3周期）',
  heaven: '天国（1周期）',
}

/** web情報・通常条件（ST後想定・周期未考慮） */
export const EV_NORMAL: EvRow[] = [
  { games: 0, yen: -600, investYen: 9370, reachRate: 8.72 },
  { games: 50, yen: -453, investYen: 9223, reachRate: 10.16 },
  { games: 100, yen: -281, investYen: 9051, reachRate: 11.83 },
  { games: 150, yen: -81, investYen: 8851, reachRate: 13.78 },
  { games: 200, yen: 152, investYen: 8618, reachRate: 16.05 },
  { games: 250, yen: 424, investYen: 8346, reachRate: 18.7 },
  { games: 300, yen: 740, investYen: 8030, reachRate: 21.78 },
  { games: 350, yen: 1108, investYen: 7662, reachRate: 25.36 },
  { games: 400, yen: 1537, investYen: 7233, reachRate: 29.54 },
  { games: 450, yen: 2036, investYen: 6734, reachRate: 34.4 },
  { games: 500, yen: 2617, investYen: 6153, reachRate: 40.07 },
  { games: 550, yen: 3295, investYen: 5475, reachRate: 46.66 },
  { games: 600, yen: 4084, investYen: 4686, reachRate: 54.35 },
  { games: 650, yen: 5002, investYen: 3768, reachRate: 63.3 },
  { games: 700, yen: 6072, investYen: 2698, reachRate: 73.72 },
  { games: 750, yen: 7319, investYen: 1451, reachRate: 85.86 },
]

/** web情報・天井短縮時（設定変更・青島VS波多野敗北後） */
export const EV_SHORTENED: EvRow[] = [
  { games: 0, yen: 740, investYen: 8030, reachRate: 21.78 },
  { games: 50, yen: 1108, investYen: 7662, reachRate: 25.36 },
  { games: 100, yen: 1537, investYen: 7233, reachRate: 29.54 },
  { games: 150, yen: 2036, investYen: 6734, reachRate: 34.4 },
  { games: 200, yen: 2617, investYen: 6153, reachRate: 40.07 },
  { games: 250, yen: 3295, investYen: 5475, reachRate: 46.66 },
  { games: 300, yen: 4084, investYen: 4686, reachRate: 54.35 },
  { games: 350, yen: 5002, investYen: 3768, reachRate: 63.3 },
  { games: 400, yen: 6072, investYen: 2698, reachRate: 73.72 },
  { games: 450, yen: 7319, investYen: 1451, reachRate: 85.86 },
]

export const PREMISES = {
  tableWinMedals: (EV_NORMAL[0].investYen + EV_NORMAL[0].yen) / 20,
  atHitDenom: 299.8,
  payoutRate: 97.75,
  baseGamesPer50: 32.0,
  yenPerMedal: 20,
  pureInc: 4.0,
  ceilingG: { normal: 795, shortened: 495 },
  maxCycle: { normal: 6, shortened: 4 },
  modeMaxCycle: { A: 6, B: 3, heaven: 1 } as Record<
    Exclude<MonkeyMode, 'unknown'>,
    number
  >,
  /**
   * 表示G（周期内）の到達目安。
   * 1周期: 平均約80G・ハード天井222（pt相当）
   * 2周期以降: 平均約100G
   */
  cycleAvgReachDisplay: { 1: 80, later: 100 } as const,
  /** 周期ごとの表示Gハード上限（規定pt到達の上限に相当） */
  cycleDisplayHardCap: { 1: 222, mid: 666, last: 444 } as const,
  /**
   * 周期到達時のAT当選率。
   * ◎≈25% / ○≈3% / △≈1% / 「-」≈0% / 天井=100%
   * 参考: トータル1周期≈40%・2周期以内≈64%はモード混合
   */
  cycleAtRate: {
    A: { 1: 0, 2: 0.25, 3: 0.01, 4: 0.03, 5: 0.25, 6: 1 },
    B: { 1: 0, 2: 0.25, 3: 1 },
    heaven: { 1: 1 },
  } as Record<Exclude<MonkeyMode, 'unknown'>, Record<number, number>>,
  /** 表と周期モデルのブレンド（周期差を出玉率に反映） */
  cycleCorrectionScale: 0.75,
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

export function hardCapForCycle(cycle: number): number {
  if (cycle <= 1) return PREMISES.cycleDisplayHardCap[1]
  if (cycle >= 6) return PREMISES.cycleDisplayHardCap.last
  return PREMISES.cycleDisplayHardCap.mid
}

export function avgReachForCycle(cycle: number): number {
  return cycle === 1
    ? PREMISES.cycleAvgReachDisplay[1]
    : PREMISES.cycleAvgReachDisplay.later
}

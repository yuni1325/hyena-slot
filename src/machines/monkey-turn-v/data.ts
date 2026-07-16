/**
 * スマスロモンキーターンⅤ — 設定1・天井ハイエナ用定数
 * 出典:
 * - https://nana-press.com/kaiseki/machine/644/18016/ （天井期待値）
 * - https://nana-press.com/kaiseki/machine/644/23068/ （狙い目・周期）
 * - https://1geki.jp/slot/l_monkeyturn5/
 * - https://p-town.dmm.com/machines/4450
 *
 * 出玉率の主軸はなな徹ゲーム数天井期待値表（周期・モード未考慮）。
 * 周期・モードは補正として加味する。
 */

export type EvRow = {
  games: number
  yen: number
  investYen: number
  reachRate: number
}

export type MonkeyMode = 'A' | 'B' | 'heaven' | 'unknown'

/** なな徹・通常条件（ST後想定・周期未考慮） */
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

/** なな徹・天井短縮時（設定変更・青島VS波多野敗北後） */
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
  /** なな徹表から逆算した一定獲得（invest+yen） */
  tableWinMedals: (EV_NORMAL[0].investYen + EV_NORMAL[0].yen) / 20,
  atHitDenom: 299.8,
  payoutRate: 97.75,
  baseGamesPer50: 32.0,
  yenPerMedal: 20,
  /** AT純増目安（枚/G）・閉店時の所要G概算用 */
  pureInc: 4.0,
  ceilingG: { normal: 795, shortened: 495 },
  maxCycle: { normal: 6, shortened: 4 },
  modeMaxCycle: { A: 6, B: 3, heaven: 1 } as Record<
    Exclude<MonkeyMode, 'unknown'>,
    number
  >,
  /** 1周期平均約80G、2周期以降平均約100G（なな徹・1激） */
  cycleAvgGames: { 1: 80, later: 100 } as const,
  /**
   * 周期到達時のAT当選率（ユーザー指定）。
   * ◎≈25% / ○≈3% / △≈1% / 「-」はほぼ無し / 天井周期=100%
   * 参考: 1周期全体≈40%・2周期以内≈64%はモード混合の話で、モードA単体の1周期は低い。
   */
  cycleAtRate: {
    A: { 1: 0, 2: 0.25, 3: 0.01, 4: 0.03, 5: 0.25, 6: 1 },
    B: { 1: 0, 2: 0.25, 3: 1 },
    heaven: { 1: 1 },
  } as Record<Exclude<MonkeyMode, 'unknown'>, Record<number, number>>,
  /** モード不明時は表のみ（周期補正なし） */
  cycleCorrectionScale: 0.5,
  /** CZ「超抜」成功≈50% は表に織込み済み想定。補正では周期経路のみ */
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

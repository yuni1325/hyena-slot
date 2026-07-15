/**
 * スマスロ 甲鉄城のカバネリ 海門決戦 — 設定1・天井ハイエナ用定数
 * 出典:
 * - https://nana-press.com/kaiseki/machine/1097/35403/ （天井期待値）
 * - https://nana-press.com/kaiseki/machine/1097/35411/ （周期）
 * - https://flick7.net/slot/kabaneri_unato__c.php （ST平均獲得・参考）
 *
 * 出玉率の主軸はなな徹表。周期・CZは補正として加味する。
 * 初当りボーナス（周期・CZ成功とも）は概ね BIG:REG = 1:1
 *   BIG＝エピソード → ST濃厚
 *   REG＝駿城 → ST期待度約20%、失敗時は周期/G数引き継ぎ
 * 天井到達時のみエピソード（ST）確定。
 */

export type EvRow = {
  games: number
  /** 等価期待値（円） */
  yen: number
  /** 平均投資（円） */
  investYen: number
  /** 天井到達率（％） */
  reachRate: number
}

/** なな徹・ゲーム数天井期待値（周期数は考慮しないと明記） */
export const EV_NORMAL: EvRow[] = [
  { games: 0, yen: -1564, investYen: 13629, reachRate: 12.76 },
  { games: 50, yen: -1347, investYen: 13412, reachRate: 14.15 },
  { games: 100, yen: -1106, investYen: 13171, reachRate: 15.69 },
  { games: 150, yen: -840, investYen: 12904, reachRate: 17.4 },
  { games: 200, yen: -544, investYen: 12608, reachRate: 19.3 },
  { games: 250, yen: -215, investYen: 12280, reachRate: 21.4 },
  { games: 300, yen: 149, investYen: 11916, reachRate: 23.73 },
  { games: 350, yen: 552, investYen: 11513, reachRate: 26.31 },
  { games: 400, yen: 1000, investYen: 11065, reachRate: 29.17 },
  { games: 450, yen: 1496, investYen: 10569, reachRate: 32.35 },
  { games: 500, yen: 2046, investYen: 10019, reachRate: 35.87 },
  { games: 550, yen: 2656, investYen: 9408, reachRate: 39.78 },
  { games: 600, yen: 3333, investYen: 8732, reachRate: 44.11 },
  { games: 650, yen: 4083, investYen: 7982, reachRate: 48.91 },
  { games: 700, yen: 4915, investYen: 7150, reachRate: 54.24 },
  { games: 750, yen: 5838, investYen: 6227, reachRate: 60.14 },
  { games: 800, yen: 6861, investYen: 5204, reachRate: 66.69 },
  { games: 850, yen: 7995, investYen: 4070, reachRate: 73.95 },
  { games: 900, yen: 9253, investYen: 2812, reachRate: 82.0 },
  { games: 950, yen: 10648, investYen: 1417, reachRate: 90.93 },
]

export const EV_SHORTENED: EvRow[] = [
  { games: 0, yen: 1000, investYen: 11065, reachRate: 29.17 },
  { games: 50, yen: 1496, investYen: 10569, reachRate: 32.35 },
  { games: 100, yen: 2046, investYen: 10019, reachRate: 35.87 },
  { games: 150, yen: 2656, investYen: 9408, reachRate: 39.78 },
  { games: 200, yen: 3333, investYen: 8732, reachRate: 44.11 },
  { games: 250, yen: 4083, investYen: 7982, reachRate: 48.91 },
  { games: 300, yen: 4915, investYen: 7150, reachRate: 54.24 },
  { games: 350, yen: 5838, investYen: 6227, reachRate: 60.14 },
  { games: 400, yen: 6861, investYen: 5204, reachRate: 66.69 },
  { games: 450, yen: 7995, investYen: 4070, reachRate: 73.95 },
  { games: 500, yen: 9253, investYen: 2812, reachRate: 82.0 },
  { games: 550, yen: 10648, investYen: 1417, reachRate: 90.93 },
]

export const PREMISES = {
  /**
   * 出玉率の分子（なな徹表準拠）。
   * 表は「AT獲得枚数は常に一定」→ invest+yen から逆算すると約603.25枚で固定。
   */
  tableWinMedals: (EV_NORMAL[0].investYen + EV_NORMAL[0].yen) / 20,
  /** flick7 実践ST平均（参考・主計算には使わない） */
  practiceWinMedals: 627.1,
  stHitDenom: 422.5,
  firstHitDenom: 254.2,
  payoutRate: 97.5,
  /** なな徹シミュは31.0、実戦系は31.4 */
  baseGamesPer50: 31.0,
  yenPerMedal: 20,
  ceilingG: { normal: 996, shortened: 596 },
  maxCycle: { normal: 6, shortened: 4 },
  /** 1・2周期の規定G天井（表示G） */
  cycleGCeiling: { 1: 150, 2: 300 } as Record<number, number>,
  /** なな徹：1周期平均約100G、2周期平均約250Gで到達 */
  cycleAvgReachG: { 1: 100, 2: 250 } as Record<number, number>,
  /**
   * 周期到達時ボーナス当選率（設定1）
   * 「約33%以上」などは下限寄りに保守的に置く（規定G直前の楽観を抑える）
   */
  cycleHitRate: {
    1: 0.3,
    2: 0.3,
    3: 0.184,
    4: 0.336,
    5: 0.22,
    6: 1,
  } as Record<number, number>,
  /** 規定G天井直前（残り何G以内）で周期当選率を減衰させるか */
  nearCycleCeilingG: 40,
  /** 直前での減衰下限（1.0=減衰なし、0.45=強い抑制） */
  nearCycleCeilingDampMin: 0.45,
  /**
   * 周期モデルとなな徹表の平均G差のうち、補正に載せる割合。
   * 1.0=周期フル反映、0=表のみ。上振れ抑制のため半分程度。
   */
  cycleCorrectionScale: 0.5,
  /** 初当りボーナス振り分け BIG:REG = 1:1（周期・CZ成功とも） */
  bigShare: 0.5,
  regShare: 0.5,
  /** REG＝駿城 → ST */
  regStRate: 0.2,
  /** CZ成功期待度（参考表示用） */
  czSuccessRate: {
    mumei: 0.36,
    ikoma: 0.46,
    doran: 0.78,
  },
  /**
   * CZ経路のST寄与を公表ST確率から逆算するための基準。
   * 周期寄与 ≈ (校正用当選率 × BIG/REG経由ST率) / 150G
   */
  czCalibrationCycleLen: 150,
  czCalibrationCycleHit: 0.3,
} as const

/** ボーナス当選時にその場でSTへ行く確率（天井以外）。BIG:REG=1:1 */
export function stRateOnBonus(): number {
  return PREMISES.bigShare * 1 + PREMISES.regShare * PREMISES.regStRate
}

/**
 * 1GあたりのCZ経路ST確率（公表ST 1/422.5 から周期寄与を差し引いて校正）
 * CZ成功 → BIG:REG=1:1 → 上記 stRateOnBonus
 */
export function czStPerGame(): number {
  const pStBonus = stRateOnBonus()
  const cycleStPerGame =
    (PREMISES.czCalibrationCycleHit * pStBonus) /
    PREMISES.czCalibrationCycleLen
  const publishedSt = 1 / PREMISES.stHitDenom
  return Math.max(0, publishedSt - cycleStPerGame)
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

/** なな徹表1行から獲得枚数（常に約603） */
export function winMedalsFromEv(row: EvRow): number {
  return (row.investYen + row.yen) / PREMISES.yenPerMedal
}

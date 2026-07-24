/**
 * スマスロ 化物語 — 設定1・天井ハイエナ用定数
 * 出典: web情報（天井・狙い目）／一撃／DMM
 * - https://1geki.jp/slot/l_bakemonogatari/
 * - https://p-town.dmm.com/machines/4898
 *
 * 出玉率の主軸はweb情報・ゲーム数天井期待値表（実G・等価）。
 * 天井到達時はAT+倍倍チャンスを考慮した表。
 */

export type EvRow = {
  games: number
  yen: number
  investYen: number
  reachRate: number
}

/** web情報・AT後（天井1000G・設定1・等価） */
export const EV_NORMAL: EvRow[] = [
  { games: 0, yen: -717, investYen: 8524, reachRate: 2.51 },
  { games: 50, yen: -672, investYen: 8480, reachRate: 3.02 },
  { games: 100, yen: -617, investYen: 8427, reachRate: 3.63 },
  { games: 150, yen: -551, investYen: 8362, reachRate: 4.37 },
  { games: 200, yen: -472, investYen: 8285, reachRate: 5.25 },
  { games: 250, yen: -377, investYen: 8192, reachRate: 6.31 },
  { games: 300, yen: -263, investYen: 8081, reachRate: 7.59 },
  { games: 350, yen: -126, investYen: 7947, reachRate: 9.12 },
  { games: 400, yen: 39, investYen: 7785, reachRate: 10.97 },
  { games: 450, yen: 237, investYen: 7591, reachRate: 13.18 },
  { games: 500, yen: 476, investYen: 7358, reachRate: 15.85 },
  { games: 550, yen: 763, investYen: 7078, reachRate: 19.06 },
  { games: 600, yen: 1108, investYen: 6741, reachRate: 22.91 },
  { games: 650, yen: 1522, investYen: 6336, reachRate: 27.54 },
  { games: 700, yen: 2020, investYen: 5849, reachRate: 33.11 },
  { games: 750, yen: 2619, investYen: 5263, reachRate: 39.81 },
  { games: 800, yen: 3340, investYen: 4559, reachRate: 47.86 },
  { games: 850, yen: 4206, investYen: 3712, reachRate: 57.54 },
  { games: 900, yen: 5247, investYen: 2695, reachRate: 69.18 },
  { games: 950, yen: 6498, investYen: 1471, reachRate: 83.18 },
]

/** web情報・設定変更時（天井600G） */
export const EV_SHORTENED: EvRow[] = [
  { games: 0, yen: -563, investYen: 7785, reachRate: 10.97 },
  { games: 50, yen: -350, investYen: 7591, reachRate: 13.18 },
  { games: 100, yen: -93, investYen: 7358, reachRate: 15.85 },
  { games: 150, yen: 215, investYen: 7078, reachRate: 19.06 },
  { games: 200, yen: 586, investYen: 6741, reachRate: 22.91 },
  { games: 250, yen: 1032, investYen: 6336, reachRate: 27.54 },
  { games: 300, yen: 1568, investYen: 5849, reachRate: 33.11 },
  { games: 350, yen: 2212, investYen: 5263, reachRate: 39.81 },
  { games: 400, yen: 2987, investYen: 4559, reachRate: 47.86 },
  { games: 450, yen: 3918, investYen: 3712, reachRate: 57.54 },
  { games: 500, yen: 5038, investYen: 2695, reachRate: 69.18 },
  { games: 550, yen: 6385, investYen: 1471, reachRate: 83.18 },
]

export const PREMISES = {
  tableWinMedals: (EV_NORMAL[0].investYen + EV_NORMAL[0].yen) / 20,
  atHitDenom: 265.1,
  /** 解呪ノ儀 平均成功期待度 */
  czSuccessRate: 0.43,
  payoutRate: 97.9,
  baseGamesPer50: 31.1,
  yenPerMedal: 20,
  /** 表の算出は倖時間純増 */
  pureInc: 2.7,
  pureIncSuper: 5.0,
  ceilingG: { normal: 1000, shortened: 600 },
  stopNote: '夢の時間ヲ終わラセルな終了後即ヤメ',
  zoneHint: '30〜100G／260〜300G前兆、規定100・200・300GがCZチャンス',
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

export function evRowsFor(shortened: boolean): EvRow[] {
  return shortened ? EV_SHORTENED : EV_NORMAL
}

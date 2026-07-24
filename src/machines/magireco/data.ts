/**
 * スマスロ マギアレコード — 設定1・天井ハイエナ用定数
 * 出典: web情報（天井期待値）／一撃／DMM
 * - https://1geki.jp/slot/l_magireco/
 * - https://p-town.dmm.com/machines/4745
 *
 * 出玉率の主軸はweb情報・天井期待値表（実G・等価）。
 * 天井はポイント制（通常950pt+α／設定変更時最大699pt+α）。
 * 表は 1G≒1.5pt 換算で通常600G・短縮400Gとして算出。
 */

export type EvRow = {
  games: number
  yen: number
  investYen: number
  reachRate: number
}

/** web情報・天井短縮なし（950pt+α≒600G・設定1・等価） */
export const EV_NORMAL: EvRow[] = [
  { games: 0, yen: -1272, investYen: 7380, reachRate: 10.76 },
  { games: 50, yen: -1091, investYen: 7199, reachRate: 12.95 },
  { games: 100, yen: -872, investYen: 6980, reachRate: 15.6 },
  { games: 150, yen: -608, investYen: 6717, reachRate: 18.78 },
  { games: 200, yen: -291, investYen: 6399, reachRate: 22.62 },
  { games: 250, yen: 91, investYen: 6018, reachRate: 27.24 },
  { games: 300, yen: 551, investYen: 5558, reachRate: 32.8 },
  { games: 350, yen: 1104, investYen: 5004, reachRate: 39.49 },
  { games: 400, yen: 1771, investYen: 4337, reachRate: 47.56 },
  { games: 450, yen: 2574, investYen: 3534, reachRate: 57.27 },
  { games: 500, yen: 3541, investYen: 2567, reachRate: 68.96 },
  { games: 550, yen: 4706, investYen: 1402, reachRate: 83.04 },
]

/** web情報・天井短縮時（設定変更・最大699pt+α≒400G） */
export const EV_SHORTENED: EvRow[] = [
  { games: 0, yen: -1103, investYen: 6399, reachRate: 22.62 },
  { games: 50, yen: -721, investYen: 6018, reachRate: 27.24 },
  { games: 100, yen: -261, investYen: 5558, reachRate: 32.8 },
  { games: 150, yen: 293, investYen: 5004, reachRate: 39.49 },
  { games: 200, yen: 959, investYen: 4337, reachRate: 47.56 },
  { games: 250, yen: 1762, investYen: 3534, reachRate: 57.27 },
  { games: 300, yen: 2730, investYen: 2567, reachRate: 68.96 },
  { games: 350, yen: 3894, investYen: 1402, reachRate: 83.04 },
]

export const PREMISES = {
  tableWinMedals: (EV_NORMAL[0].investYen + EV_NORMAL[0].yen) / 20,
  bonusHitDenom: 240.6,
  atHitDenom: 654.6,
  payoutRate: 97.6,
  baseGamesPer50: 32.6,
  yenPerMedal: 20,
  pureInc: 2.6,
  /** 表のゲーム数換算天井（1G≒1.5pt） */
  ceilingG: { normal: 600, shortened: 400 },
  ceilingPt: { normal: 950, shortened: 699 },
  stopNote: 'AT終了後即ヤメ',
  zoneHint: '規定200pt・400pt・600ptがチャンス／穢れは未反映',
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

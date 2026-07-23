/**
 * スマスロ 攻殻機動隊 — 設定1・ハイエナ用定数
 * 出典: web情報（天井期待値）／一撃／DMM
 * - https://1geki.jp/slot/l_kokaku/
 * - https://p-town.dmm.com/machines/4931
 *
 * AT間天井 = 通常999G / リセット699G → AT
 * CZ天井 = 殲滅モード別（液晶左下G）→ 殲滅ZONE→CZ
 */

export type EvRow = {
  games: number
  yen: number
  investYen: number
  reachRate: number
}

/** 状況（天井短縮） */
export type Situation = 'normal' | 'reset' | 'whiteFail'

export const SITUATION_LABEL: Record<Situation, string> = {
  normal: '通常（AT後など）',
  reset: '設定変更・朝一リセット',
  whiteFail: '白の境界失敗後（CZ400）',
}

/** 殲滅モード（CZ天井） */
export type ZenModeId = 'A' | 'B' | 'C' | 'D' | 'reset'

export const ZEN_MODE_LABEL: Record<ZenModeId, string> = {
  A: '通常A（CZ天井550G）',
  B: '通常B（CZ天井450G）',
  C: '通常C（CZ天井250G）',
  D: '通常D（CZ天井150G）',
  reset: 'リセット（CZ天井350G）',
}

export const ZEN_MODE_CZ_CEILING: Record<ZenModeId, number> = {
  A: 550,
  B: 450,
  C: 250,
  D: 150,
  reset: 350,
}

/** モード別一覧に出す通常モード */
export const ZEN_MODE_IDS_NORMAL: ZenModeId[] = ['A', 'B', 'C', 'D']

/** web情報・AT間天井（通常・等価・設定1） */
export const EV_NORMAL: EvRow[] = [
  { games: 0, yen: -580, investYen: 10510, reachRate: 6.13 },
  { games: 50, yen: -477, investYen: 10407, reachRate: 7.05 },
  { games: 100, yen: -359, investYen: 10288, reachRate: 8.1 },
  { games: 150, yen: -223, investYen: 10152, reachRate: 9.32 },
  { games: 200, yen: -67, investYen: 9996, reachRate: 10.72 },
  { games: 250, yen: 113, investYen: 9816, reachRate: 12.32 },
  { games: 300, yen: 320, investYen: 9609, reachRate: 14.17 },
  { games: 350, yen: 558, investYen: 9371, reachRate: 16.3 },
  { games: 400, yen: 832, investYen: 9097, reachRate: 18.74 },
  { games: 450, yen: 1147, investYen: 8782, reachRate: 21.56 },
  { games: 500, yen: 1509, investYen: 8420, reachRate: 24.79 },
  { games: 550, yen: 1925, investYen: 8004, reachRate: 28.51 },
  { games: 600, yen: 2404, investYen: 7525, reachRate: 32.78 },
  { games: 650, yen: 2954, investYen: 6975, reachRate: 37.7 },
  { games: 700, yen: 3587, investYen: 6342, reachRate: 43.35 },
  { games: 750, yen: 4316, investYen: 5614, reachRate: 49.86 },
  { games: 800, yen: 5153, investYen: 4776, reachRate: 57.34 },
  { games: 850, yen: 6116, investYen: 3814, reachRate: 65.94 },
  { games: 900, yen: 7223, investYen: 2706, reachRate: 75.83 },
  { games: 950, yen: 8496, investYen: 1433, reachRate: 87.2 },
]

/** web情報・AT間天井（設定変更・等価・設定1） */
export const EV_RESET: EvRow[] = [
  { games: 0, yen: 320, investYen: 9609, reachRate: 14.17 },
  { games: 50, yen: 558, investYen: 9371, reachRate: 16.3 },
  { games: 100, yen: 832, investYen: 9097, reachRate: 18.74 },
  { games: 150, yen: 1147, investYen: 8782, reachRate: 21.56 },
  { games: 200, yen: 1509, investYen: 8420, reachRate: 24.79 },
  { games: 250, yen: 1925, investYen: 8004, reachRate: 28.51 },
  { games: 300, yen: 2404, investYen: 7525, reachRate: 32.78 },
  { games: 350, yen: 2954, investYen: 6975, reachRate: 37.7 },
  { games: 400, yen: 3587, investYen: 6342, reachRate: 43.35 },
  { games: 450, yen: 4316, investYen: 5614, reachRate: 49.86 },
  { games: 500, yen: 5153, investYen: 4776, reachRate: 57.34 },
  { games: 550, yen: 6116, investYen: 3814, reachRate: 65.94 },
  { games: 600, yen: 7223, investYen: 2706, reachRate: 75.83 },
  { games: 650, yen: 8496, investYen: 1433, reachRate: 87.2 },
]

export const PREMISES = {
  atCeiling: { normal: 999, reset: 699 },
  /** 白の境界失敗後のCZ天井 */
  whiteFailCzCeiling: 400,
  czSuccessSam: 0.526,
  czSuccessTachikoma: 0.65,
  czHitDenom: 238.0,
  atHitDenom: 336.3,
  payoutRate: 97.9,
  baseGamesPer50: 32.0,
  yenPerMedal: 20,
  pureInc: 4.0,
  tableWinMedals: (EV_NORMAL[0].investYen + EV_NORMAL[0].yen) / 20,
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

export function atEvRowsFor(situation: Situation): EvRow[] {
  return situation === 'reset' ? EV_RESET : EV_NORMAL
}

export function atCeilingFor(situation: Situation): number {
  return situation === 'reset'
    ? PREMISES.atCeiling.reset
    : PREMISES.atCeiling.normal
}

/** 状況を加味した実効CZ天井 */
export function effectiveCzCeiling(
  situation: Situation,
  mode: ZenModeId,
): number {
  if (situation === 'whiteFail') return PREMISES.whiteFailCzCeiling
  if (situation === 'reset') return ZEN_MODE_CZ_CEILING.reset
  return ZEN_MODE_CZ_CEILING[mode]
}

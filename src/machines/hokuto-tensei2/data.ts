/**
 * スマスロ北斗の拳 転生の章2 — 規定あべし振り分け（設定1）
 * 出典:
 * - https://nana-press.com/kaiseki/machine/1059/34309/
 * - https://1geki.jp/slot/l_hokuto_tensei2/45/
 *
 * 期待値の当て方は人生期待値論の公表値逆算ノートに準拠:
 * https://note.com/kitaichi_lifer/n/n9a574c2a25f8
 * （ゾーン代表＝区間中央、あべし増≒1.8/G、TY554.7）
 */
export type Zone = {
  min: number
  max: number
  /** モード別選択率（％） */
  rates: {
    A: number
    B: number
    C: number
    heaven: number
  }
}

export const MODE_LABELS = {
  A: '通常A',
  B: '通常B',
  C: '通常C',
  heaven: '天国',
} as const

export type HokutoMode = keyof typeof MODE_LABELS

/** AT終了後など（設定変更時以外） */
export type Phase = 'afterAt' | 'reset'

export const PHASE_LABELS: Record<Phase, string> = {
  afterAt: 'AT終了後（設定変更時以外）',
  reset: '設定変更時（朝一リセット）',
}

export const MODE_CEILING: Record<Phase, Record<HokutoMode, number>> = {
  afterAt: { A: 1536, B: 896, C: 576, heaven: 128 },
  reset: { A: 1280, B: 896, C: 576, heaven: 128 },
}

/** シャッター＝896以内当選濃厚 */
export const SHUTTER_CAP = 896

/**
 * モード滞在率（設定1・公開値）
 * 出典: なな徹「状況別のモード振り分け」
 */
export const MODE_STAY_RATE: Record<Phase, Record<HokutoMode, number>> = {
  afterAt: { A: 51.9, B: 23.7, C: 17.6, heaven: 6.8 },
  reset: { A: 49.3, B: 22.0, C: 20.1, heaven: 8.6 },
}

/** 設定変更時以外・設定1 */
export const ZONES_AFTER_AT: Zone[] = [
  { min: 1, max: 64, rates: { A: 0.2, B: 0.21, C: 0.03, heaven: 12.5 } },
  { min: 65, max: 128, rates: { A: 1.37, B: 1.49, C: 0.2, heaven: 87.5 } },
  { min: 129, max: 192, rates: { A: 0.31, B: 0.37, C: 0.4, heaven: 0 } },
  { min: 193, max: 256, rates: { A: 21.94, B: 26.59, C: 28.81, heaven: 0 } },
  { min: 257, max: 320, rates: { A: 0.12, B: 0.73, C: 0.45, heaven: 0 } },
  { min: 321, max: 384, rates: { A: 0.73, B: 4.41, C: 2.7, heaven: 0 } },
  { min: 385, max: 448, rates: { A: 0.12, B: 0.02, C: 1.41, heaven: 0 } },
  { min: 449, max: 512, rates: { A: 0.12, B: 0.02, C: 1.38, heaven: 0 } },
  { min: 513, max: 576, rates: { A: 5.6, B: 0.98, C: 64.64, heaven: 0 } },
  { min: 577, max: 640, rates: { A: 0.11, B: 0.99, C: 0, heaven: 0 } },
  { min: 641, max: 704, rates: { A: 0.12, B: 1.01, C: 0, heaven: 0 } },
  { min: 705, max: 768, rates: { A: 1.4, B: 12.23, C: 0, heaven: 0 } },
  { min: 769, max: 832, rates: { A: 0.11, B: 1.0, C: 0, heaven: 0 } },
  { min: 833, max: 896, rates: { A: 5.71, B: 49.93, C: 0, heaven: 0 } },
  { min: 897, max: 960, rates: { A: 0.11, B: 0, C: 0, heaven: 0 } },
  { min: 961, max: 1024, rates: { A: 0.71, B: 0, C: 0, heaven: 0 } },
  { min: 1025, max: 1088, rates: { A: 0.12, B: 0, C: 0, heaven: 0 } },
  { min: 1089, max: 1152, rates: { A: 0.73, B: 0, C: 0, heaven: 0 } },
  { min: 1153, max: 1216, rates: { A: 0.12, B: 0, C: 0, heaven: 0 } },
  { min: 1217, max: 1280, rates: { A: 10.99, B: 0, C: 0, heaven: 0 } },
  { min: 1281, max: 1344, rates: { A: 3.4, B: 0, C: 0, heaven: 0 } },
  { min: 1345, max: 1408, rates: { A: 15.11, B: 0, C: 0, heaven: 0 } },
  { min: 1409, max: 1472, rates: { A: 29.3, B: 0, C: 0, heaven: 0 } },
  { min: 1473, max: 1536, rates: { A: 1.45, B: 0, C: 0, heaven: 0 } },
]

/** 設定変更時・設定1 */
export const ZONES_RESET: Zone[] = [
  { min: 1, max: 64, rates: { A: 0.26, B: 0.29, C: 0.03, heaven: 12.5 } },
  { min: 65, max: 128, rates: { A: 1.8, B: 2.02, C: 0.22, heaven: 87.5 } },
  { min: 129, max: 192, rates: { A: 0.36, B: 0.45, C: 0.4, heaven: 0 } },
  { min: 193, max: 256, rates: { A: 26.26, B: 32.72, C: 28.77, heaven: 0 } },
  { min: 257, max: 320, rates: { A: 0.15, B: 0.9, C: 0.45, heaven: 0 } },
  { min: 321, max: 384, rates: { A: 0.88, B: 5.41, C: 2.69, heaven: 0 } },
  { min: 385, max: 448, rates: { A: 0.15, B: 0.03, C: 1.4, heaven: 0 } },
  { min: 449, max: 512, rates: { A: 0.15, B: 0.03, C: 1.4, heaven: 0 } },
  { min: 513, max: 576, rates: { A: 6.71, B: 1.21, C: 64.63, heaven: 0 } },
  { min: 577, max: 640, rates: { A: 0.1, B: 0.89, C: 0, heaven: 0 } },
  { min: 641, max: 704, rates: { A: 0.1, B: 0.89, C: 0, heaven: 0 } },
  { min: 705, max: 768, rates: { A: 1.19, B: 10.68, C: 0, heaven: 0 } },
  { min: 769, max: 832, rates: { A: 0.1, B: 0.89, C: 0, heaven: 0 } },
  { min: 833, max: 896, rates: { A: 4.85, B: 43.6, C: 0, heaven: 0 } },
  { min: 897, max: 960, rates: { A: 0.89, B: 0, C: 0, heaven: 0 } },
  { min: 961, max: 1024, rates: { A: 5.34, B: 0, C: 0, heaven: 0 } },
  { min: 1025, max: 1088, rates: { A: 0.89, B: 0, C: 0, heaven: 0 } },
  { min: 1089, max: 1152, rates: { A: 5.34, B: 0, C: 0, heaven: 0 } },
  { min: 1153, max: 1216, rates: { A: 0.89, B: 0, C: 0, heaven: 0 } },
  { min: 1217, max: 1280, rates: { A: 43.62, B: 0, C: 0, heaven: 0 } },
]

export function zonesFor(phase: Phase): Zone[] {
  return phase === 'reset' ? ZONES_RESET : ZONES_AFTER_AT
}

/** 固定前提に使う定数（設定1） */
export const PREMISES = {
  /**
   * 初当たり1回あたり平均獲得枚数
   * 人生期待値論ノートの「たらればさん参照」554.7枚に合わせる
   *（機械割逆算の554.6と実質同値）
   */
  avgWinMedals: 554.7,
  firstHitDenom: 366.0,
  payoutRate: 97.6,
  baseGamesPer50: 31.5,
  /** AT純増目安（枚/G）・閉店時の所要G概算用 */
  pureInc: 3.0,
  /**
   * 1Gあたりあべし増加（天破均し込み）
   * 人生期待値論ノートが用いる実務値 1.8
   */
  abeshiPerGame: 1.8,
  /** AT直撃確率（暫定・公表なし） */
  directHitDenom: 8000,
} as const

/** ゾーン代表あべし＝区間中央（ノートの平均当選あべし ≈ Emid/1.8 に整合） */
export function zoneRepresentative(zone: Zone): number {
  return (zone.min + zone.max) / 2
}

export function medalsPerGame(): number {
  return 50 / PREMISES.baseGamesPer50
}

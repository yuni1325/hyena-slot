/**
 * スマスロ リコリス・リコイル（サミー・2026/9/7導入）— 設定1・天井ハイエナ用定数
 * 出典: 一撃／ちょんぼりすた／スロベース／パチセブン
 * - https://1geki.jp/slot/l_lycoreco/3/
 * - https://chonborista.com/slot/sammy-slot/261631/
 * - https://slobase.jp/machines/lycoris-recoil
 * - https://pachiseven.jp/machines/7419
 *
 * 公開されている天井期待値は「開始G→天井までの出玉率」の数点のみ
 * （AT間300G〜 100.3%／400G〜 106.1%／上位CZ失敗後0G〜 103.9%）。
 * ゲーム数ごとの表が未公開のため、以下の自前モデルで補間する:
 *   - 天井までは一定のハザード p で初当たり（CZ経由込みの実効値）
 *   - 初当たり1回の等価獲得は定数 W
 *   - 出玉率 = W ÷（通常時消費 × 初当たりまでの平均G）
 * p・W は 300G=100.3%・400G=106.1% の2点に合わせて解いた値。
 * 上位CZ失敗後は 0G=103.9% に合うよう W だけ別に合わせる。
 */

export type Situation = 'normal' | 'shortened' | 'upperFail'

export const SITUATION_IDS: Situation[] = ['normal', 'shortened', 'upperFail']

export const SITUATION_LABEL: Record<Situation, string> = {
  normal: 'ラッシュ後（AT間天井850G）',
  shortened: 'リセット／ラッシュ駆け抜け後（600G）',
  upperFail: '上位CZ失敗後（250G）',
}

export const SITUATION_CEILING: Record<Situation, number> = {
  normal: 850,
  shortened: 600,
  upperFail: 250,
}

/** 公開アンカー（設定1・開始G→天井までの出玉率） */
export const ANCHORS = {
  normal300: 100.3,
  normal400: 106.1,
  upperFail0: 103.9,
} as const

export const PREMISES = {
  czHitDenom: 198.7,
  atHitDenom: 328.8,
  payoutRate: 97.9,
  baseGamesPer50: 31.8,
  yenPerMedal: 20,
  pureInc: 8.4,
  czCeiling: { normal: 600, shortened: 250 },
  stopNote:
    'ラッシュ後は即ヤメ厳禁（引き戻し前兆・100Gゾーンまで）。上位ラッシュ後は100G+αまで',
  zoneHint:
    '100Gゾーン（50Gから105.7%）・250Gゾーン（150Gから101.0%）は未反映',
} as const

export function medalsPerGame(): number {
  return 50 / PREMISES.baseGamesPer50
}

/** 天井 N G 以内の初当たりまでの平均G（ハザード p・天井で必ず当たる） */
export function expectedGames(p: number, n: number): number {
  if (n <= 0) return 0
  return (1 - Math.pow(1 - p, n)) / p
}

function solveHazard(): number {
  const target = ANCHORS.normal400 / ANCHORS.normal300
  const c = SITUATION_CEILING.normal
  // ratio(p) = E[G | 300G] / E[G | 400G] は p について単調減少 → 二分法
  let lo = 1 / 2000
  let hi = 1 / 50
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2
    const r = expectedGames(mid, c - 300) / expectedGames(mid, c - 400)
    if (r > target) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** 実効ハザード（自前算出・約1/230） */
export const HAZARD = solveHazard()

/** 初当たり1回の等価獲得（自前算出） */
export const WIN_MEDALS: Record<Situation, number> = (() => {
  const m = medalsPerGame()
  const base =
    (ANCHORS.normal300 / 100) *
    m *
    expectedGames(HAZARD, SITUATION_CEILING.normal - 300)
  const upper =
    (ANCHORS.upperFail0 / 100) *
    m *
    expectedGames(HAZARD, SITUATION_CEILING.upperFail)
  return { normal: base, shortened: base, upperFail: upper }
})()

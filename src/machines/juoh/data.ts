/**
 * スマスロ 獣王（L獣王XZ・サミー・2026/10/5導入）— 設定1・天井ハイエナ用定数
 * 出典: スロベース／ちょんぼりすた／flick7／ハイエナ君
 * - https://slobase.jp/machines/juuou
 * - https://chonborista.com/slot/sammy-slot/263920/
 * - https://flick7.net/slot/jyu_oh/tenjo/
 * - https://haienakun.com/monster-juoh/
 *
 * G数別の期待値表が未公開のため、ハザード一定の天井モデル（lib/hazardCeiling）で補間。
 *   - p は公表SC初当たり 1/326.5 をそのまま使用
 *   - W は状況別に公開アンカーへ合わせる（等価）
 *       通常: 500G〜 +1,035円 ／ 設定変更（天井599G）: 100G〜 +132円
 */

import { winForYen } from '../../lib/hazardCeiling'

export type Situation = 'normal' | 'reset'

export const SITUATION_IDS: Situation[] = ['normal', 'reset']

export const SITUATION_LABEL: Record<Situation, string> = {
  normal: 'SC後（天井999G）',
  reset: '設定変更後（天井599G）',
}

export const SITUATION_CEILING: Record<Situation, number> = {
  normal: 999,
  reset: 599,
}

export const ANCHORS = {
  normal: { games: 500, yen: 1035 },
  reset: { games: 100, yen: 132 },
} as const

export const PREMISES = {
  hitDenom: 326.5,
  payoutRate: 97.8,
  baseGamesPer50: 31.8,
  yenPerMedal: 20,
  pureInc: 8.0,
  stopNote:
    'SC終了後は潜伏29G+αを確認。サバ連後・超サバ後は100G（SP高確）まで',
  resetNote: 'サバ連に入らなければ次回も天井599Gのまま',
} as const

export function medalsPerGame(): number {
  return 50 / PREMISES.baseGamesPer50
}

export const HAZARD = 1 / PREMISES.hitDenom

export const WIN_MEDALS: Record<Situation, number> = {
  normal: winForYen(
    HAZARD,
    SITUATION_CEILING.normal - ANCHORS.normal.games,
    ANCHORS.normal.yen,
    medalsPerGame(),
  ),
  reset: winForYen(
    HAZARD,
    SITUATION_CEILING.reset - ANCHORS.reset.games,
    ANCHORS.reset.yen,
    medalsPerGame(),
  ),
}

/**
 * スマスロ モンスターハンターライズ：サンブレイク（2026/10/5導入）— 設定1・天井ハイエナ用定数
 * 出典: ちょんぼりすた／イチカツ／アルテマ／スロガチ
 * - https://chonborista.com/slot/enta-slot/264514/
 * - https://ichikatsu.com/mhrise-sunbreak/
 * - https://pachimo.altema.jp/lmhrstenjo
 * - https://slogati.com/lmonsterhunter-sunbreak/
 *
 * 【暫定】G数別の期待値表・出玉率が未公開。イチカツの導入初日データ
 * （600G≒2,945円・900G≒5,112円）は公表スペックとも狙い目とも整合しない
 * ため不採用。代わりに解析サイトの狙い目を「出玉率105%」と仮置きして
 * W を合わせる（AT後470G・設定変更後380G）。表が出たら差し替えること。
 *   - p は公表AT初当たり 1/349.9
 *   - CZ間333G・CZ6スルー・オトモ潜水艇5周期は未反映
 */

import { winForRate } from '../../lib/hazardCeiling'

export type Situation = 'afterAt' | 'reset'

export const SITUATION_IDS: Situation[] = ['afterAt', 'reset']

export const SITUATION_LABEL: Record<Situation, string> = {
  afterAt: 'AT後（天井999G）',
  reset: '設定変更後（天井999G）',
}

export const CEILING_G = 999

/** 狙い目＝出玉率この値と仮置き */
export const AIM_RATE = 105

export const AIM_GAMES: Record<Situation, number> = {
  afterAt: 470,
  reset: 380,
}

export const PREMISES = {
  atHitDenom: 349.9,
  payoutRate: 97.5,
  baseGamesPer50: 32,
  yenPerMedal: 20,
  /** 通常AT 2.7／上位AT 6.6。閉店補正は保守側の2.7 */
  pureInc: 2.7,
  pureIncUpper: 6.6,
  czCeiling: 333,
  czThrough: 6,
  replayCycle: 5,
  stopNote:
    'AT終了後は必ず1G回してエンタチャンス確認。リプレイが20回近いなら次周期まで',
  resetNote: '天井は短縮なし。初回ATの約30%で上位版盟勇クエスト',
} as const

export function medalsPerGame(): number {
  return 50 / PREMISES.baseGamesPer50
}

export const HAZARD = 1 / PREMISES.atHitDenom

export const WIN_MEDALS: Record<Situation, number> = {
  afterAt: winForRate(
    HAZARD,
    CEILING_G - AIM_GAMES.afterAt,
    AIM_RATE,
    medalsPerGame(),
  ),
  reset: winForRate(
    HAZARD,
    CEILING_G - AIM_GAMES.reset,
    AIM_RATE,
    medalsPerGame(),
  ),
}

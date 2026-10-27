/**
 * スマスロ モンスターハンターライズ：サンブレイク（2026/10/5導入）
 * 期待値: イチカツ（たられば 10/5〜10/8 約1,000万G・5枚等価）
 *   https://ichikatsu.com/mhrise-sunbreak/
 *   条件: 50枚=31.9G・時速800G・AT終了後即ヤメ・着席40G除外
 * 天井: AT間999G+α（CZ間333G・CZ6スルー・潜水艇5周期は表に平均的に含まれる）
 */
import { defineAnchoredMachine } from '../../lib/anchoredCeiling'

export type Situation = 'afterAt' | 'morning'

export const MH_SUNBREAK = defineAnchoredMachine<Situation>({
  order: ['afterAt', 'morning'],
  situations: {
    afterAt: {
      label: 'AT後（天井999G）',
      gamesLabel: 'AT間の実G',
      ceiling: 999,
      points: [[0, -986], [100, -453], [200, -76], [300, 518], [400, 895], [500, 1600], [600, 2475], [700, 3299], [800, 4646], [900, 5881]],
    },
    morning: {
      label: '朝一（リセット有無混在・天井999G）',
      gamesLabel: '朝一からの実G',
      ceiling: 999,
      points: [[0, -100], [100, 1024], [200, 1543], [300, 2827], [400, 3216], [500, 4193], [600, 5694], [700, 6806], [900, 7000]],
      note: '据え置き・設定変更が混ざった集計。サンプルが少なく700G以降は不安定',
    },
  },
  baseGamesPer50: 31.9,
  pureInc: 3.0,
  source: 'イチカツ（たられば実戦値・等価）',
  extraPremises: [
    {
      label: '他の天井',
      value: 'CZ間333G／CZ6スルー／潜水艇5周期',
      basis: 'CZ間・スルー・周期が深い台は表より上振れ',
    },
    {
      label: 'ヤメ時',
      value: 'AT終了後は必ず1G回してエンタチャンス確認',
      basis: 'リプレイが20回近いなら次周期まで',
    },
  ],
})

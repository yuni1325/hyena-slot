/**
 * スマスロ 獣王（サミー・2026/10/5導入）
 * 期待値: イチカツ（たられば実戦値・5枚等価・設定1）
 *   https://ichikatsu.com/juuou/
 *   条件: 50枚=31.8G・時速800G・AT後30Gでヤメ・着席30G除外
 * 天井: SC間999G+α ／ 設定変更後599G+α（サバ連まで短縮継続）
 */
import { defineAnchoredMachine } from '../../lib/anchoredCeiling'

export type Situation = 'sabaren' | 'nonSabaren' | 'reset'

export const JUOH = defineAnchoredMachine<Situation>({
  order: ['sabaren', 'nonSabaren', 'reset'],
  situations: {
    sabaren: {
      label: 'サバ連後（天井999G）',
      gamesLabel: 'SC間の実G',
      ceiling: 999,
      points: [[200, -1818], [300, -1160], [400, -473], [500, 577], [600, 1797], [700, 3376], [800, 5230]],
      note: '0〜100Gは100Gゾーン狙い（30G +603円・50G +939円、100Gで打ち切り）。この計算は天井狙い用',
    },
    nonSabaren: {
      label: '非サバ連後（天井999G）',
      gamesLabel: 'SC間の実G',
      ceiling: 999,
      points: [[200, -2154], [300, -1872], [400, -1061], [500, 44], [600, 1579], [700, 3260], [800, 5340]],
    },
    reset: {
      label: '設定変更後（天井599G）',
      gamesLabel: 'SC間の実G',
      ceiling: 599,
      points: [[0, -3082], [200, -402], [300, 913], [400, 2779], [500, 4777], [550, 6037]],
      note: 'サバ連に入らなければ次回も599Gのまま',
    },
  },
  baseGamesPer50: 31.8,
  pureInc: 8.0,
  source: 'イチカツ（たられば実戦値・設定1・等価）',
  extraPremises: [
    {
      label: 'ヤメ時',
      value: 'SC後は潜伏29G+α、サバ連後は100G+αまで',
      basis: '期待値表はAT後30Gでヤメる条件',
    },
  ],
})

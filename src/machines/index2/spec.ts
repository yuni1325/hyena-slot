/**
 * スマスロ とある魔術の禁書目録2（2026/8/3導入）
 * 期待値: イチカツ（たられば実戦値・5枚等価）
 *   https://ichikatsu.com/index2/
 *   条件: 50枚=30.8G・平均純増2.75枚・時速800G・AT終了後即ヤメ・着席30G除外
 * 天井: AT間 実G1200G（設定変更後777G）／CZ間 液晶G800G+α（設定変更後200G+α）
 */
import { defineAnchoredMachine } from '../../lib/anchoredCeiling'

export type Situation = 'atAfterAt' | 'czAfterAt' | 'atReset' | 'czReset'

export const INDEX2 = defineAnchoredMachine<Situation>({
  order: ['czAfterAt', 'atAfterAt', 'czReset', 'atReset'],
  situations: {
    czAfterAt: {
      label: 'AT後・CZ間（液晶G・天井800G）',
      gamesLabel: '液晶ゲーム数（CZ間）',
      ceiling: 800,
      points: [[100, -379], [150, 73], [200, 876], [250, 1689], [300, 2399], [400, 3425], [500, 4546]],
    },
    atAfterAt: {
      label: 'AT後・AT間（実G・天井1200G）',
      gamesLabel: 'AT間の実G',
      ceiling: 1200,
      points: [[200, 964], [250, 1606], [300, 2040], [450, 2561], [600, 2341], [700, 3281], [900, 4811], [1100, 8296]],
      note: 'CZ間天井が先に来やすく、300〜600Gは期待値が伸びにくい',
    },
    czReset: {
      label: '設定変更後・CZ間（液晶G・天井200G）',
      gamesLabel: '液晶ゲーム数（CZ間）',
      ceiling: 200,
      points: [[30, 244], [40, 515], [60, 1049], [80, 1585], [100, 2001], [150, 3243]],
    },
    atReset: {
      label: '設定変更後・AT間（実G・天井777G）',
      gamesLabel: 'AT間の実G',
      ceiling: 777,
      points: [[50, 489], [100, 1311], [200, 609], [300, 1406], [400, 2656], [500, 4152], [700, 9180]],
      note: '100G付近はCZ短縮天井の影響で一時的に高い',
    },
  },
  baseGamesPer50: 30.8,
  pureInc: 4.0,
  source: 'イチカツ（たられば実戦値・設定1・等価）',
  extraPremises: [
    {
      label: 'ヤメ時',
      value: 'AT後は基本即ヤメ。液晶Gの余剰40G以上・ロシアステージは100Gまで',
      basis: 'エンディング経由のAT終了は天国濃厚で続行',
    },
  ],
})

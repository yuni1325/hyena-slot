/**
 * Lパチスロ 喰霊-零-Re（オーイズミ・2026/8/17導入）
 * 【暫定】実戦値の表は未公開。スロッターの道具箱の暫定モデルを使用:
 *   https://slot-toolbox.com/garei-zero-re-tenjo/
 *   条件: 設定1・50枚=36.1G・天井の無限ART価値を15,000円相当と仮定
 *   ※他サイトの等価狙い目は500G〜650Gと幅がある
 * 天井: ボーナス+ART間999G+α → 無限ART（次回ボーナスまで減算停止）。設定変更で短縮なし
 */
import { defineAnchoredMachine } from '../../lib/anchoredCeiling'

export type Situation = 'normal'

export const GAREI = defineAnchoredMachine<Situation>({
  order: ['normal'],
  situations: {
    normal: {
      label: 'ボーナス・ART後（天井999G）',
      gamesLabel: 'ボーナス+ART間の実G',
      ceiling: 999,
      points: [[0, -382], [100, -365], [200, -331], [300, -264], [400, -134], [500, 121], [600, 622], [700, 1604], [800, 3529], [900, 7302]],
    },
  },
  baseGamesPer50: 36.1,
  pureInc: 1.4,
  source: 'スロッターの道具箱の暫定モデル',
  provisional: true,
  extraPremises: [
    {
      label: '未反映の要素',
      value: '妖力ポイント（蝶）・高確・RT3',
      basis: '蝶が貯まっている台・高確示唆は表より有利',
    },
    {
      label: 'ヤメ時',
      value: 'ART後は内部状態・蝶・ボーナス非当選を確認',
      basis: 'REG後は高確濃厚なので16G以上',
    },
  ],
})

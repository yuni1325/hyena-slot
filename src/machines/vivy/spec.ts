/**
 * スロット Vivy -Fluorite Eye's Song-（大都技研・2026/11/2導入）
 * 期待値: イチカツ（理論値・暫定）https://ichikatsu.com/vivy/
 *   導入3日間 1,348台日・当たり間約4.6万行の実測周期当選率＋解析値でシミュレーション
 *   AT初当り検算1/275（公表1/276.5）。コイン持ち31.0G/50枚
 * 天井: AT間800G+α（設定変更後500G+α）または最大6周期。CZ経由なしでAT
 * スペック: 設定1 AT初当り1/276.5・機械割97.7%・AT純増約3.2枚
 */
import { defineAnchoredMachine } from '../../lib/anchoredCeiling'

export type Situation = 'afterAt' | 'reset'

export const VIVY = defineAnchoredMachine<Situation>({
  order: ['afterAt', 'reset'],
  situations: {
    afterAt: {
      label: 'AT後・1周期目非当選（天井800G）',
      gamesLabel: 'AT間の液晶G',
      ceiling: 800,
      points: [
        [100, -1050], [150, -380], [200, 310], [250, 730], [300, 1080], [350, 1400],
        [400, 1730], [450, 2130], [500, 2670], [550, 3310], [600, 4060], [650, 4890],
        [700, 5850], [750, 6980],
      ],
      note: '周期天井（6周期）・周期内ptは未反映。2周期目500pt〜・5周期目以降は浅いGでも狙える',
    },
    reset: {
      label: '設定変更後（天井500G）',
      gamesLabel: '朝一からの液晶G',
      ceiling: 500,
      points: [
        [0, 350], [50, 1780], [100, 2620], [150, 2040], [200, 2310], [250, 2990],
        [300, 3760], [350, 4620], [400, 5620], [450, 6830],
      ],
      note: '設定1でも約40%で天国スタート。0Gからプラス',
    },
  },
  baseGamesPer50: 31.0,
  pureInc: 3.2,
  source: '理論値（導入初期の実測データを使ったシミュレーション）',
  provisional: true,
  extraPremises: [
    {
      label: 'AT後1周期目の空き台',
      value: 'AT後20G〜（前兆終了まで）',
      basis: 'AT後0Gで+120円、50Gで+1,540円、100Gで+2,670円の目安',
    },
    {
      label: 'ヤメ時',
      value: 'AT後は即ヤメ（1周期目まで打っても期待値ほぼゼロ）',
      basis: '周期の前兆で外れたら周期目とptで判断',
    },
  ],
})

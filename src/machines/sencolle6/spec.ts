/**
 * 戦国コレクション6（コナミアミューズメント・2026/7/6導入）
 * 【暫定】G数別の実戦値表は未公開。一撃の「期待値の目安」を点として使用:
 *   400G≒±0円 / 450G≒+500円 / 550G≒+1,000円 / 650G≒+2,000円（等価・AT後）
 *   https://1geki.jp/slot/l_sencolle6/3/
 * 天井: AT間999G+α ／ 周期6周期（設定変更後3周期）
 * コイン持ち: アルテマの投資計算（1,000円=33.7G）
 */
import { defineAnchoredMachine } from '../../lib/anchoredCeiling'

export type Situation = 'afterAt'

export const SENCOLLE6 = defineAnchoredMachine<Situation>({
  order: ['afterAt'],
  situations: {
    afterAt: {
      label: 'AT後（天井999G）',
      gamesLabel: 'AT間の実G',
      ceiling: 999,
      points: [[400, 0], [450, 500], [550, 1000], [650, 2000]],
      note: '設定変更後は周期天井3周期に短縮されるため、このゲーム数基準は使わない',
    },
  },
  baseGamesPer50: 33.7,
  pureInc: 3.0,
  source: '一撃の期待値目安（暫定）',
  provisional: true,
  extraPremises: [
    {
      label: '周期天井（未反映）',
      value: '6周期でAT（設定変更後3周期）',
      basis: '4〜6周期目・規定コレ数が近い台は浅いGでも優先',
    },
    {
      label: 'ヤメ時',
      value: 'AT後は1周期目まで（約40%でAT）',
      basis: '最終決戦敗北後も1周期目まで',
    },
  ],
})

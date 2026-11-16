/**
 * L転生王女と天才令嬢の魔法革命（オリンピアエステート・2026/10/5導入）
 * 期待値: フリック7（EV Analyzer実戦集計・2026/10/26更新）
 *   https://flick7.net/slot/tenten-kakumei/tenjo/
 *   集計軸: AT間（通常AT後 AT2〜14回目）・5枚等価。G区間は中央値に配置。106%ライン129G〜
 * 天井: ボーナス間 通常510G+α（CZ中のGを除く・設定変更後410G+α）／CZ間410G+α（設定変更後310G+α）
 *   ＋αとCZ消化分で実Gは510Gを超えるため、計算上の上限は表の末尾に合わせる
 * スペック: 設定1 ボーナス初当り1/320.0・機械割97.9%・コイン持ち32.4G
 */
import { defineAnchoredMachine } from '../../lib/anchoredCeiling'

export type Situation = 'afterAt'

export const TENTEN = defineAnchoredMachine<Situation>({
  order: ['afterAt'],
  situations: {
    afterAt: {
      label: 'ボーナス後（天井510G+α）',
      gamesLabel: 'ボーナス間の実G',
      ceiling: 660,
      points: [
        [0, -1060, 96.5], [25, -1004, 97.0], [75, 410, 101.3], [125, 1212, 104.2],
        [175, 2042, 107.5], [225, 2500, 109.4], [275, 3368, 113.6], [325, 4152, 117.9],
        [375, 5004, 123.5], [425, 5522, 127.6], [475, 6402, 136.0], [525, 6996, 142.7],
        [575, 8196, 158.7], [625, 8942, 164.8],
      ],
      note: '天井はCZ中のGを除く510G+αのため、実Gでは550〜650Gまで伸びることがある。王宮舞踏会駆け抜け後はCZ間210G、上位CZ失敗後は310Gに短縮',
    },
  },
  baseGamesPer50: 32.4,
  pureInc: 3.0,
  source: '実戦値（大規模データ集計・等価）',
  extraPremises: [
    {
      label: '設定変更後',
      value: 'ボーナス間410G+α・CZ間310G+α',
      basis: 'リセット台は310G以上のハマりが狙い目',
    },
    {
      label: 'ヤメ時',
      value: '転天ポイント（MAX10pt）が近ければ続行',
      basis: 'ポイントはCZ失敗後・ボーナス高確後も持ち越し',
    },
  ],
})

import AnchoredMachinePage from '../components/AnchoredMachinePage'
import { GAREI, type Situation } from '../machines/garei/spec'

export default function GareiPage() {
  return (
    <AnchoredMachinePage<Situation>
      machineId="garei"
      title="Lパチスロ 喰霊-零-Re"
      tagline="ボーナス+ART間の実Gから天井期待値を確認（暫定）"
      machine={GAREI}
      defaultSituation="normal"
      defaultGames={600}
      provisional
      inputNote="天井は無限ART（次回ボーナスまで）。設定変更での短縮なし。蝶（妖力）が貯まっている台は上振れ。"
      footnote="等価の狙い目は580G前後〜（サイトにより500〜650G）。天井到達で無限ARTのため後半ほど急に伸びる。"
    />
  )
}

import AnchoredMachinePage from '../components/AnchoredMachinePage'
import { SF6, type Situation } from '../machines/sf6/spec'

export default function Sf6Page() {
  return (
    <AnchoredMachinePage<Situation>
      machineId="sf6"
      title="スマスロ ストリートファイター6"
      tagline="AT間の実G（データカウンター）から天井期待値を確認"
      machine={SF6}
      defaultSituation="afterSt"
      defaultGames={300}
      inputNote="液晶Gは内部カウントで実Gと一致しない（液晶1000G≒実470G）。データカウンターの実Gで入力。"
      footnote="損益分岐は約110G、機械割106%ラインは290G前後〜（実戦集計）。FBスルー回数が多い台・天国示唆のアイキャッチは優先。"
    />
  )
}

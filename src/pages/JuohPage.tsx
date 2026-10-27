import AnchoredMachinePage from '../components/AnchoredMachinePage'
import { JUOH, type Situation } from '../machines/juoh/spec'

export default function JuohPage() {
  return (
    <AnchoredMachinePage<Situation>
      machineId="juoh"
      title="スマスロ 獣王"
      tagline="SC間の実Gと前回状況（サバ連／非サバ連／設定変更）から天井期待値を確認"
      machine={JUOH}
      defaultSituation="sabaren"
      defaultGames={550}
      footnote="等価の狙い目（時給2,000円）：サバ連後540G〜、非サバ連後570G〜、設定変更後280G〜。サバ連後は0Gから100Gゾーン狙いも可（100Gで打ち切り）。"
    />
  )
}

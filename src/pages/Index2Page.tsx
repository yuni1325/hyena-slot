import AnchoredMachinePage from '../components/AnchoredMachinePage'
import { INDEX2, type Situation } from '../machines/index2/spec'

export default function Index2Page() {
  return (
    <AnchoredMachinePage<Situation>
      machineId="index2"
      title="スマスロ とある魔術の禁書目録2"
      tagline="液晶G（CZ間）・実G（AT間）とリセット有無から天井期待値を確認"
      machine={INDEX2}
      defaultSituation="czAfterAt"
      defaultGames={250}
      inputNote="CZ間（液晶G）とAT間（実G）の両方を見て、期待値の高いほうで判断。"
      footnote="等価の狙い目（時給2,000円）：AT後 CZ間200G〜／AT間230G〜、設定変更後 CZ間40G〜／AT間280G〜。"
    />
  )
}

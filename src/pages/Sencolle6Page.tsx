import AnchoredMachinePage from '../components/AnchoredMachinePage'
import { SENCOLLE6, type Situation } from '../machines/sencolle6/spec'

export default function Sencolle6Page() {
  return (
    <AnchoredMachinePage<Situation>
      machineId="sencolle6"
      title="戦国コレクション6"
      tagline="AT間の実Gから天井期待値を確認（暫定）"
      machine={SENCOLLE6}
      defaultSituation="afterAt"
      defaultGames={550}
      provisional
      inputNote="周期天井（6周期・設定変更後3周期）は未反映。4周期目以降の台は浅いGでも狙える。"
      footnote="等価の目安：400G〜プラス、実戦的には550G前後〜。設定変更後は周期で判断。"
    />
  )
}

import AnchoredMachinePage from '../components/AnchoredMachinePage'
import { VIVY, type Situation } from '../machines/vivy/spec'

export default function VivyPage() {
  return (
    <AnchoredMachinePage<Situation>
      machineId="vivy"
      title="スロット Vivy -Fluorite Eye's Song-"
      tagline="AT間の液晶Gとリセット有無から天井期待値を確認（暫定）"
      machine={VIVY}
      defaultSituation="afterAt"
      defaultGames={300}
      provisional
      inputNote="周期天井（最大6周期）・周期内ptは未反映。2周期目500pt〜、5周期目以降は浅いGでも狙える。"
      footnote="等価の狙い目（時給2,000円）：1周期目で外れた台は280G〜、設定変更後は20G〜、AT後1周期目の空き台はAT後20G〜（前兆終了まで）。"
    />
  )
}

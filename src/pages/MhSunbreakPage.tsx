import HazardCeilingPage from '../components/HazardCeilingPage'
import {
  buildMhSunbreakPremises,
  calculateMhSunbreak,
} from '../machines/mh-sunbreak/calc'
import {
  CEILING_G,
  PREMISES,
  SITUATION_IDS,
  SITUATION_LABEL,
  type Situation,
} from '../machines/mh-sunbreak/data'

export default function MhSunbreakPage() {
  return (
    <HazardCeilingPage<Situation>
      machineId="mh-sunbreak"
      title="スマスロ モンスターハンターライズ：サンブレイク"
      tagline="AT間の実Gから天井期待値を確認（暫定）"
      gamesLabel="実G数（AT間）"
      situationIds={SITUATION_IDS}
      situationLabel={SITUATION_LABEL}
      defaultSituation="afterAt"
      defaultGames={500}
      ceilingFor={() => CEILING_G}
      pureIncPerGame={PREMISES.pureInc}
      calculate={calculateMhSunbreak}
      premises={buildMhSunbreakPremises}
      inputNote={`CZ間${PREMISES.czCeiling}G・CZ${PREMISES.czThrough}スルー・潜水艇${PREMISES.replayCycle}周期は未反映（深いほど上振れ）。`}
      premisesNote="【暫定】設定1固定。期待値表が未公開のため、解析サイトの狙い目を出玉率105%と仮置きした自前モデル→閉店補正。"
      footnote="狙い目の目安は等価でAT後420〜470G〜、設定変更後380G〜。CZ天井狙いは210G〜。AT終了後は必ず1G回す。"
    />
  )
}

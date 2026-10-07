import HazardCeilingPage from '../components/HazardCeilingPage'
import { buildJuohPremises, calculateJuoh } from '../machines/juoh/calc'
import {
  PREMISES,
  SITUATION_CEILING,
  SITUATION_IDS,
  SITUATION_LABEL,
  type Situation,
} from '../machines/juoh/data'

export default function JuohPage() {
  return (
    <HazardCeilingPage<Situation>
      machineId="juoh"
      title="スマスロ 獣王"
      tagline="SC間の実Gとリセット有無から天井期待値を確認"
      gamesLabel="実G数（SC間）"
      situationIds={SITUATION_IDS}
      situationLabel={SITUATION_LABEL}
      defaultSituation="normal"
      defaultGames={550}
      ceilingFor={(s) => SITUATION_CEILING[s]}
      pureIncPerGame={PREMISES.pureInc}
      calculate={calculateJuoh}
      premises={buildJuohPremises}
      inputNote={PREMISES.resetNote}
      premisesNote="設定1固定。G数別の期待値表が未公開のため、公開期待値に合わせた自前モデルで補間→閉店補正。"
      footnote="通常は約300Gで損益分岐、等価の狙い目は500〜590G〜。設定変更後は100G〜でプラス、200G〜が目安。SC後は潜伏29G、サバ連後は100Gまで回す。"
    />
  )
}

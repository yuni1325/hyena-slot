import AnchoredMachinePage from '../components/AnchoredMachinePage'
import { MH_SUNBREAK, type Situation } from '../machines/mh-sunbreak/spec'

export default function MhSunbreakPage() {
  return (
    <AnchoredMachinePage<Situation>
      machineId="mh-sunbreak"
      title="スマスロ モンスターハンターライズ：サンブレイク"
      tagline="AT間の実Gから天井期待値を確認"
      machine={MH_SUNBREAK}
      defaultSituation="afterAt"
      defaultGames={300}
      inputNote="CZ間333G・CZ6スルー・潜水艇5周期が近い台は表示より上振れ。"
      footnote="AT後は約60Gで損益分岐、機械割106%ラインはAT間255G〜（約3.2万件の実戦集計）。AT終了後は必ず1G回す。"
    />
  )
}

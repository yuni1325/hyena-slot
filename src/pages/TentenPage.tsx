import AnchoredMachinePage from '../components/AnchoredMachinePage'
import { TENTEN, type Situation } from '../machines/tenten/spec'

export default function TentenPage() {
  return (
    <AnchoredMachinePage<Situation>
      machineId="tenten"
      title="L転生王女と天才令嬢の魔法革命"
      tagline="ボーナス間の実Gから天井期待値を確認"
      machine={TENTEN}
      defaultSituation="afterAt"
      defaultGames={150}
      inputNote="王宮舞踏会駆け抜け後はCZ間210G、上位CZ失敗後は310Gに短縮。設定変更後はボーナス間410G・CZ間310G。"
      footnote="損益分岐は約70G、機械割106%ラインは130G前後〜（実戦集計）。天井が510G+αと浅く、ハイエナ向き。"
    />
  )
}

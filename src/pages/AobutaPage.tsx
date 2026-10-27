import AnchoredMachinePage from '../components/AnchoredMachinePage'
import { AOBUTA, type Situation } from '../machines/aobuta/spec'

export default function AobutaPage() {
  return (
    <AnchoredMachinePage<Situation>
      machineId="aobuta"
      title="L青春ブタ野郎はバニーガール先輩の夢を見ない"
      tagline="AT間・CZ間のGと前回状況から天井期待値を確認"
      machine={AOBUTA}
      defaultSituation="tanpatsu"
      defaultGames={200}
      footnote="等価の狙い目（時給2,000円）：単発後170G〜、設定変更後200G〜、2連以上後260G〜、CZ間280G〜。CZ5スルー以上はG数不問。"
    />
  )
}

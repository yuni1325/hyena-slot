import AnchoredMachinePage from '../components/AnchoredMachinePage'
import { KANOKARI, type Situation } from '../machines/kanokari/spec'

export default function KanokariPage() {
  return (
    <AnchoredMachinePage<Situation>
      machineId="kanokari"
      title="Lパチスロ 彼女、お借りします"
      tagline="ボーナス間の実Gと前回ボーナス（BIG／REG／設定変更）から天井期待値を確認"
      machine={KANOKARI}
      defaultSituation="reg"
      defaultGames={350}
      inputNote="BIG後は500Gゾーンが強く、抜けた直後の500〜600Gは期待値が落ちる。"
      footnote="等価の狙い目（時給2,000円）：設定変更後はG数不問、REG後320G〜、BIG後は500Gゾーン狙い390〜545G（ゾーン後ヤメ）か天井狙い650G〜。REG連続3回以上の台も狙い目。"
    />
  )
}

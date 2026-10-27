export type MachineCard = {
  id: string
  path: string
  name: string
  shortName: string
  blurb: string
}

export const machineCards: MachineCard[] = [
  {
    id: 'hokuto-tensei2',
    path: '/machines/hokuto-tensei2',
    name: 'スマスロ北斗の拳 転生の章2',
    shortName: '北斗転生2',
    blurb: 'あべし・モード・シャッター判別から期待出玉率を算出',
  },
  {
    id: 'kabaneri-unato',
    path: '/machines/kabaneri-unato',
    name: 'スマスロ甲鉄城のカバネリ 海門決戦',
    shortName: 'カバネリ海門',
    blurb: '表示G・周期・短縮天井から期待出玉率を算出（CZ・規定G込み）',
  },
  {
    id: 'monkey-turn-v',
    path: '/machines/monkey-turn-v',
    name: 'スマスロモンキーターンⅤ',
    shortName: 'モンキーターンV',
    blurb: '実G・周期・モード・短縮から期待出玉率を算出',
  },
  {
    id: 'tokyo-ghoul',
    path: '/machines/tokyo-ghoul',
    name: 'L 東京喰種',
    shortName: '東京喰種',
    blurb: '実GのAT天井と表示GのCZ天井、両方から期待出玉率を算出',
  },
  {
    id: 'otome5',
    path: '/machines/otome5',
    name: 'L戦国乙女5 業火を穿つ宿焔の双刃',
    shortName: '戦国乙女5',
    blurb: '実G・表示G・周期から期待出玉率を算出（G数天井＋周期）',
  },
  {
    id: 'sao2',
    path: '/machines/sao2',
    name: 'スロット ソードアート・オンラインⅡ',
    shortName: 'SAO2',
    blurb: 'AT間実GとCZ間（実G・表示G・モード）から期待出玉率を算出',
  },
  {
    id: 'million-god',
    path: '/machines/million-god',
    name: 'スマスロ ミリオンゴッド-神々の軌跡-',
    shortName: 'ミリオンゴッド',
    blurb: 'GG間の現在Gとリセット有無から天井期待値を算出',
  },
  {
    id: 'kokaku',
    path: '/machines/kokaku',
    name: 'スマスロ 攻殻機動隊',
    shortName: '攻殻機動隊',
    blurb: 'AT間G・表示G・殲滅モード・状況から期待出玉率を算出',
  },
  {
    id: 'shinuchi-yoshimune',
    path: '/machines/shinuchi-yoshimune',
    name: '真打 吉宗',
    shortName: '真打吉宗',
    blurb: 'AT間G・CZ間G・周期・モード・状況から期待出玉率を算出',
  },
  {
    id: 'karakuri2',
    path: '/machines/karakuri2',
    name: 'Lパチスロ からくりサーカス2',
    shortName: 'からくりサーカス2',
    blurb: '実G・表示G・モード・CZスルー・状況から期待出玉率を算出',
  },
  {
    id: 'valvrave',
    path: '/machines/valvrave',
    name: 'パチスロ 革命機ヴァルヴレイヴ',
    shortName: 'ヴヴヴ',
    blurb: '実Gのボーナス間天井を主軸に、CZモード・スルーも確認',
  },
  {
    id: 'valvrave2',
    path: '/machines/valvrave2',
    name: 'Lパチスロ 革命機ヴァルヴレイヴ2',
    shortName: 'ヴヴヴ2',
    blurb: '実Gのボーナス間天井を主軸に、CZ999・周期・決戦スルーも比較',
  },
  {
    id: 'enen2',
    path: '/machines/enen2',
    name: 'Lパチスロ 炎炎ノ消防隊2',
    shortName: '炎炎ノ消防隊2',
    blurb: '実Gのボーナス間天井を主軸に、モード天井・伝導者スルーも比較',
  },
  {
    id: 'bakemonogatari',
    path: '/machines/bakemonogatari',
    name: 'スマスロ 化物語',
    shortName: '化物語',
    blurb: 'AT後の実Gとリセット有無からゲーム数天井の期待値を算出',
  },
  {
    id: 'magireco',
    path: '/machines/magireco',
    name: 'スマスロ マギアレコード',
    shortName: 'マギレコ',
    blurb: 'ボーナス間の実Gとリセット有無からポイント天井の期待値を算出',
  },
  {
    id: 'lycoreco',
    path: '/machines/lycoreco',
    name: 'スマスロ リコリス・リコイル',
    shortName: 'リコリコ',
    blurb: 'AT間の実Gと前回状況（通常／短縮／上位CZ失敗／上位ラッシュ）から期待出玉率を算出',
  },
  {
    id: 'juoh',
    path: '/machines/juoh',
    name: 'スマスロ 獣王',
    shortName: '獣王',
    blurb: 'SC間の実Gとサバ連・非サバ連・設定変更から期待値を算出（実戦値）',
  },
  {
    id: 'mh-sunbreak',
    path: '/machines/mh-sunbreak',
    name: 'スマスロ モンスターハンターライズ：サンブレイク',
    shortName: 'モンハンSB',
    blurb: 'AT間の実Gから期待値を算出（実戦値）',
  },
  {
    id: 'aobuta',
    path: '/machines/aobuta',
    name: 'L青春ブタ野郎はバニーガール先輩の夢を見ない',
    shortName: '青ブタ',
    blurb: 'AT間・CZ間のGと単発/2連以上/設定変更から期待値を算出（実戦値）',
  },
  {
    id: 'index2',
    path: '/machines/index2',
    name: 'スマスロ とある魔術の禁書目録2',
    shortName: '禁書目録2',
    blurb: '液晶G（CZ間）・実G（AT間）とリセット有無から期待値を算出（実戦値）',
  },
  {
    id: 'sencolle6',
    path: '/machines/sencolle6',
    name: '戦国コレクション6',
    shortName: '戦コレ6',
    blurb: 'AT間の実Gから期待値を算出（暫定）',
  },
  {
    id: 'garei',
    path: '/machines/garei',
    name: 'Lパチスロ 喰霊-零-Re',
    shortName: '喰霊零Re',
    blurb: 'ボーナス+ART間の実Gから期待値を算出（暫定）',
  },
]

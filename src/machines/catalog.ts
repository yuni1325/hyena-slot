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
]

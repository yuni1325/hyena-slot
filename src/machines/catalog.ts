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
    blurb: '表示G・実G・周期・短縮天井から期待出玉率を算出',
  },
]

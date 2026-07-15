/** 画面に固定表示する計算前提（根拠付き） */
export type Premise = {
  label: string
  value: string
  basis: string
  /** 参照サイトにない自前算出なら true */
  derived?: boolean
}

export type ModeId = string

export type ModeResult = {
  modeId: ModeId
  modeLabel: string
  /** 規定未到達が残っているか */
  reachable: boolean
  /** 期待出玉率（％）。到達不可時は null */
  expectedPayoutRate: number | null
  /** 初当たりまでの平均G */
  avgGames: number | null
  /** 初当たりまでの平均投資枚数 */
  avgInvestment: number | null
  /** 条件付き残りあべし期待値 */
  expectedRemainingAbeshi: number | null
  /** モード滞在率（％）。シャッター混合時は null */
  stayProbability: number | null
}

export type CalcInput = {
  currentAbeshi: number
  /** 機種固有の状況（北斗転生2: afterAt | reset など） */
  phase?: string
  /** 北斗転生2: シャッター判別あり */
  shutter?: boolean
}

export type PremiseArgs = {
  phase?: string
  shutter?: boolean
}

export type MachineDefinition = {
  id: string
  name: string
  shortName: string
  settingNote: string
  /** フェーズ選択肢（任意） */
  phases?: { id: string; label: string }[]
  /** シャッター判別入力を出すか */
  hasShutterOption?: boolean
  premises: (args?: PremiseArgs) => Premise[]
  calculate: (input: CalcInput) => ModeResult[]
}

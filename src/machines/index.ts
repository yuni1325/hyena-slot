import type { MachineDefinition } from './types'
import { buildPremises, calculateHokutoTensei2 } from './hokuto-tensei2/calc'
import { PHASE_LABELS, type Phase } from './hokuto-tensei2/data'

export const machines: MachineDefinition[] = [
  {
    id: 'hokuto-tensei2',
    name: 'スマスロ北斗の拳 転生の章2',
    shortName: '北斗転生2',
    settingNote: '設定1固定（人生期待値論ノートの公表値逆算に準拠）',
    hasShutterOption: true,
    phases: [
      { id: 'afterAt', label: PHASE_LABELS.afterAt },
      { id: 'reset', label: PHASE_LABELS.reset },
    ],
    premises: (args) =>
      buildPremises(
        (args?.phase as Phase) || 'afterAt',
        Boolean(args?.shutter),
      ),
    calculate: calculateHokutoTensei2,
  },
]

export function getMachine(id: string): MachineDefinition | undefined {
  return machines.find((m) => m.id === id)
}

export type { MachineDefinition, ModeResult, Premise, CalcInput } from './types'

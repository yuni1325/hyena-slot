import { machineCards } from '../machines/catalog'
import { calculateHokutoTensei2 } from '../machines/hokuto-tensei2/calc'
import { PHASE_LABELS, type Phase } from '../machines/hokuto-tensei2/data'
import { calculateKabaneri } from '../machines/kabaneri-unato/calc'
import { calculateMonkey } from '../machines/monkey-turn-v/calc'
import {
  MODE_LABEL as MONKEY_MODE_LABEL,
  type MonkeyMode,
} from '../machines/monkey-turn-v/data'
import { calculateGhoul } from '../machines/tokyo-ghoul/calc'
import {
  CZ_CEILING_LABEL,
  type CzCeilingKind,
} from '../machines/tokyo-ghoul/data'
import { calculateOtome5 } from '../machines/otome5/calc'
import { calculateSao2 } from '../machines/sao2/calc'
import {
  CZ_MODE_IDS as SAO_CZ_IDS,
  CZ_MODE_LABEL as SAO_CZ_LABEL,
  type CzModeId as SaoCzModeId,
} from '../machines/sao2/data'
import { calculateMillionGod } from '../machines/million-god/calc'
import {
  PHASE_LABEL as GOD_PHASE_LABEL,
  type Phase as GodPhase,
} from '../machines/million-god/data'
import { calculateKokaku } from '../machines/kokaku/calc'
import {
  SITUATION_LABEL as KOKAKU_SIT_LABEL,
  ZEN_MODE_IDS_NORMAL,
  ZEN_MODE_LABEL,
  type Situation as KokakuSituation,
  type ZenModeId,
} from '../machines/kokaku/data'
import { calculateYoshimune } from '../machines/shinuchi-yoshimune/calc'
import {
  CZ_MODE_IDS as YOSHI_CZ_IDS,
  CZ_MODE_LABEL as YOSHI_CZ_LABEL,
  SITUATION_LABEL as YOSHI_SIT_LABEL,
  type CzModeId as YoshiCzModeId,
  type Situation as YoshiSituation,
} from '../machines/shinuchi-yoshimune/data'
import { calculateKarakuri2 } from '../machines/karakuri2/calc'
import {
  MODE_IDS as KARAKURI_MODE_IDS,
  MODE_LABEL as KARAKURI_MODE_LABEL,
  SITUATION_LABEL as KARAKURI_SIT_LABEL,
  type ModeId as KarakuriModeId,
  type Situation as KarakuriSituation,
} from '../machines/karakuri2/data'
import { calculateValvrave } from '../machines/valvrave/calc'
import {
  CZ_MODE_IDS as VALVRAVE_CZ_IDS,
  CZ_MODE_LABEL as VALVRAVE_CZ_LABEL,
  type CzMode as ValvraveCzMode,
} from '../machines/valvrave/data'
import { calculateValvrave2 } from '../machines/valvrave2/calc'
import {
  PERIOD_MODE_IDS as VALVRAVE2_MODE_IDS,
  PERIOD_MODE_LABEL as VALVRAVE2_MODE_LABEL,
  type PeriodMode as Valvrave2Mode,
} from '../machines/valvrave2/data'
import { calculateEnen2 } from '../machines/enen2/calc'
import {
  ENEN_MODE_IDS,
  ENEN_MODE_LABEL,
  type EnenMode,
} from '../machines/enen2/data'
import { calculateBake } from '../machines/bakemonogatari/calc'
import { calculateMagireco } from '../machines/magireco/calc'

export type FieldOption = { value: string; label: string }

export type FieldDef =
  | {
      key: string
      label: string
      type: 'number'
      min?: number
      max?: number
      step?: number
    }
  | { key: string; label: string; type: 'boolean' }
  | {
      key: string
      label: string
      type: 'select'
      options: FieldOption[]
    }

export type SessionMachineDef = {
  id: string
  name: string
  shortName: string
  fields: FieldDef[]
  defaultInputs: () => Record<string, unknown>
  expectedPayoutRate: (inputs: Record<string, unknown>) => number | null
}

function num(v: unknown, fallback = 0): number {
  const n = typeof v === 'number' ? v : Number(v)
  if (!Number.isFinite(n)) return fallback
  return n
}

function bool(v: unknown, fallback = false): boolean {
  if (typeof v === 'boolean') return v
  return fallback
}

function str(v: unknown, fallback: string): string {
  return typeof v === 'string' ? v : fallback
}

function selectOptions(
  record: Record<string, string>,
  ids?: string[],
): FieldOption[] {
  const keys = ids ?? Object.keys(record)
  return keys.map((value) => ({ value, label: record[value] ?? value }))
}

const MONKEY_MODES: MonkeyMode[] = ['unknown', 'A', 'B', 'heaven']
const MONKEY_MODE_OPTS: FieldOption[] = MONKEY_MODES.map((m) => ({
  value: m,
  label: m === 'unknown' ? '不明（通常A扱い）' : MONKEY_MODE_LABEL[m],
}))

const CZ_CEILING_KINDS = Object.keys(CZ_CEILING_LABEL) as CzCeilingKind[]

export const sessionMachines: SessionMachineDef[] = [
  {
    id: 'hokuto-tensei2',
    name: 'スマスロ北斗の拳 転生の章2',
    shortName: '北斗転生2',
    fields: [
      { key: 'currentAbeshi', label: '現在あべし', type: 'number', min: 0, max: 1536 },
      {
        key: 'phase',
        label: '状況',
        type: 'select',
        options: selectOptions(PHASE_LABELS),
      },
      { key: 'shutter', label: 'シャッター判別あり', type: 'boolean' },
    ],
    defaultInputs: () => ({
      currentAbeshi: 369,
      phase: 'afterAt',
      shutter: false,
    }),
    expectedPayoutRate: (inputs) => {
      const rows = calculateHokutoTensei2({
        currentAbeshi: num(inputs.currentAbeshi, 0),
        phase: str(inputs.phase, 'afterAt') as Phase,
        shutter: bool(inputs.shutter),
      })
      const blend = rows.find((r) => r.modeId === 'blend') ?? rows[0]
      return blend?.expectedPayoutRate ?? null
    },
  },
  {
    id: 'kabaneri-unato',
    name: 'スマスロ甲鉄城のカバネリ 海門決戦',
    shortName: 'カバネリ海門',
    fields: [
      { key: 'displayGames', label: '表示G', type: 'number', min: 0 },
      { key: 'cycle', label: '周期', type: 'number', min: 1, max: 6 },
      { key: 'shortened', label: '短縮天井', type: 'boolean' },
    ],
    defaultInputs: () => ({
      displayGames: 280,
      cycle: 1,
      shortened: false,
    }),
    expectedPayoutRate: (inputs) =>
      calculateKabaneri({
        displayGames: num(inputs.displayGames),
        cycle: Math.min(6, Math.max(1, Math.floor(num(inputs.cycle, 1)))),
        shortened: bool(inputs.shortened),
      }).expectedPayoutRate,
  },
  {
    id: 'monkey-turn-v',
    name: 'スマスロモンキーターンⅤ',
    shortName: 'モンキーターンV',
    fields: [
      { key: 'actualGames', label: '実G', type: 'number', min: 0 },
      { key: 'cycle', label: '周期', type: 'number', min: 1, max: 6 },
      { key: 'mode', label: 'モード', type: 'select', options: MONKEY_MODE_OPTS },
      { key: 'shortened', label: '短縮天井', type: 'boolean' },
    ],
    defaultInputs: () => ({
      actualGames: 102,
      cycle: 2,
      mode: 'unknown',
      shortened: false,
    }),
    expectedPayoutRate: (inputs) =>
      calculateMonkey({
        actualGames: num(inputs.actualGames),
        cycle: Math.min(6, Math.max(1, Math.floor(num(inputs.cycle, 1)))),
        mode: str(inputs.mode, 'unknown') as MonkeyMode,
        shortened: bool(inputs.shortened),
      }).expectedPayoutRate,
  },
  {
    id: 'tokyo-ghoul',
    name: 'L 東京喰種',
    shortName: '東京喰種',
    fields: [
      { key: 'actualGames', label: '実G（AT間）', type: 'number', min: 0 },
      { key: 'displayGames', label: '表示G（CZ間）', type: 'number', min: 0 },
      {
        key: 'czCeiling',
        label: 'CZ天井種別',
        type: 'select',
        options: selectOptions(CZ_CEILING_LABEL, CZ_CEILING_KINDS),
      },
    ],
    defaultInputs: () => ({
      actualGames: 400,
      displayGames: 200,
      czCeiling: 'normal600',
    }),
    expectedPayoutRate: (inputs) =>
      calculateGhoul({
        actualGames: num(inputs.actualGames),
        displayGames: num(inputs.displayGames),
        czCeiling: str(inputs.czCeiling, 'normal600') as CzCeilingKind,
      }).expectedPayoutRate,
  },
  {
    id: 'otome5',
    name: 'L戦国乙女5 業火を穿つ宿焔の双刃',
    shortName: '戦国乙女5',
    fields: [
      { key: 'actualGames', label: '実G', type: 'number', min: 0 },
      { key: 'displayGames', label: '表示G', type: 'number', min: 0 },
      { key: 'cycle', label: '周期', type: 'number', min: 1, max: 6 },
      { key: 'shortened', label: '短縮天井', type: 'boolean' },
    ],
    defaultInputs: () => ({
      actualGames: 200,
      displayGames: 80,
      cycle: 1,
      shortened: false,
    }),
    expectedPayoutRate: (inputs) =>
      calculateOtome5({
        actualGames: num(inputs.actualGames),
        displayGames: num(inputs.displayGames),
        cycle: Math.min(6, Math.max(1, Math.floor(num(inputs.cycle, 1)))),
        shortened: bool(inputs.shortened),
      }).expectedPayoutRate,
  },
  {
    id: 'sao2',
    name: 'スロット ソードアート・オンラインⅡ',
    shortName: 'SAO2',
    fields: [
      { key: 'atGames', label: 'AT間実G', type: 'number', min: 0 },
      { key: 'czGames', label: 'CZ間実G', type: 'number', min: 0 },
      { key: 'displayGames', label: '表示G', type: 'number', min: 0 },
      {
        key: 'czMode',
        label: 'CZモード',
        type: 'select',
        options: selectOptions(SAO_CZ_LABEL, SAO_CZ_IDS),
      },
      { key: 'czShortened', label: 'CZ短縮', type: 'boolean' },
    ],
    defaultInputs: () => ({
      atGames: 400,
      czGames: 100,
      displayGames: 100,
      czMode: 'A',
      czShortened: false,
    }),
    expectedPayoutRate: (inputs) =>
      calculateSao2({
        atGames: num(inputs.atGames),
        czGames: num(inputs.czGames),
        displayGames: num(inputs.displayGames),
        czMode: str(inputs.czMode, 'A') as SaoCzModeId,
        czShortened: bool(inputs.czShortened),
      }).expectedPayoutRate,
  },
  {
    id: 'million-god',
    name: 'スマスロ ミリオンゴッド-神々の軌跡-',
    shortName: 'ミリオンゴッド',
    fields: [
      { key: 'games', label: 'GG間G', type: 'number', min: 0 },
      {
        key: 'phase',
        label: '状況',
        type: 'select',
        options: selectOptions(GOD_PHASE_LABEL),
      },
    ],
    defaultInputs: () => ({ games: 800, phase: 'normal' }),
    expectedPayoutRate: (inputs) =>
      calculateMillionGod({
        games: num(inputs.games),
        phase: str(inputs.phase, 'normal') as GodPhase,
      }).expectedPayoutRate,
  },
  {
    id: 'kokaku',
    name: 'スマスロ 攻殻機動隊',
    shortName: '攻殻機動隊',
    fields: [
      { key: 'atGames', label: 'AT間G', type: 'number', min: 0 },
      { key: 'displayGames', label: '表示G', type: 'number', min: 0 },
      {
        key: 'situation',
        label: '状況',
        type: 'select',
        options: selectOptions(KOKAKU_SIT_LABEL),
      },
      {
        key: 'zenMode',
        label: '殲滅モード',
        type: 'select',
        options: selectOptions(ZEN_MODE_LABEL, [
          ...ZEN_MODE_IDS_NORMAL,
          'reset',
        ]),
      },
    ],
    defaultInputs: () => ({
      atGames: 400,
      displayGames: 100,
      situation: 'normal',
      zenMode: 'A',
    }),
    expectedPayoutRate: (inputs) =>
      calculateKokaku({
        atGames: num(inputs.atGames),
        displayGames: num(inputs.displayGames),
        situation: str(inputs.situation, 'normal') as KokakuSituation,
        zenMode: str(inputs.zenMode, 'A') as ZenModeId,
      }).expectedPayoutRate,
  },
  {
    id: 'shinuchi-yoshimune',
    name: '真打 吉宗',
    shortName: '真打吉宗',
    fields: [
      { key: 'atGames', label: 'AT間G', type: 'number', min: 0 },
      { key: 'czGames', label: 'CZ間G', type: 'number', min: 0 },
      { key: 'cycle', label: '周期', type: 'number', min: 1, max: 6 },
      {
        key: 'situation',
        label: '状況',
        type: 'select',
        options: selectOptions(YOSHI_SIT_LABEL),
      },
      {
        key: 'czMode',
        label: 'CZモード',
        type: 'select',
        options: selectOptions(YOSHI_CZ_LABEL, YOSHI_CZ_IDS),
      },
    ],
    defaultInputs: () => ({
      atGames: 400,
      czGames: 80,
      cycle: 1,
      situation: 'normal',
      czMode: 'A',
    }),
    expectedPayoutRate: (inputs) =>
      calculateYoshimune({
        atGames: num(inputs.atGames),
        czGames: num(inputs.czGames),
        cycle: Math.min(6, Math.max(1, Math.floor(num(inputs.cycle, 1)))),
        situation: str(inputs.situation, 'normal') as YoshiSituation,
        czMode: str(inputs.czMode, 'A') as YoshiCzModeId,
      }).expectedPayoutRate,
  },
  {
    id: 'karakuri2',
    name: 'Lパチスロ からくりサーカス2',
    shortName: 'からくりサーカス2',
    fields: [
      { key: 'actualGames', label: '実G', type: 'number', min: 0 },
      { key: 'displayGames', label: '表示G', type: 'number', min: 0 },
      {
        key: 'situation',
        label: '状況',
        type: 'select',
        options: selectOptions(KARAKURI_SIT_LABEL),
      },
      {
        key: 'mode',
        label: 'モード',
        type: 'select',
        options: selectOptions(KARAKURI_MODE_LABEL, KARAKURI_MODE_IDS),
      },
      {
        key: 'throughCount',
        label: 'CZスルー回数',
        type: 'number',
        min: 0,
        max: 4,
      },
    ],
    defaultInputs: () => ({
      actualGames: 400,
      displayGames: 100,
      situation: 'normal',
      mode: 'A',
      throughCount: 0,
    }),
    expectedPayoutRate: (inputs) =>
      calculateKarakuri2({
        actualGames: num(inputs.actualGames),
        displayGames: num(inputs.displayGames),
        situation: str(inputs.situation, 'normal') as KarakuriSituation,
        mode: str(inputs.mode, 'A') as KarakuriModeId,
        throughCount: Math.min(4, Math.max(0, Math.floor(num(inputs.throughCount)))),
      }).expectedPayoutRate,
  },
  {
    id: 'valvrave',
    name: 'パチスロ 革命機ヴァルヴレイヴ',
    shortName: 'ヴヴヴ',
    fields: [
      { key: 'actualGames', label: '実G（ボーナス間）', type: 'number', min: 0 },
      { key: 'displayGames', label: '表示G（CZ間）', type: 'number', min: 0 },
      {
        key: 'czMode',
        label: 'CZモード',
        type: 'select',
        options: [
          { value: 'unknown', label: '不明（A想定）' },
          ...selectOptions(VALVRAVE_CZ_LABEL, VALVRAVE_CZ_IDS),
        ],
      },
      {
        key: 'throughCount',
        label: 'CZスルー回数',
        type: 'number',
        min: 0,
        max: 7,
      },
    ],
    defaultInputs: () => ({
      actualGames: 520,
      displayGames: 200,
      czMode: 'unknown',
      throughCount: 0,
    }),
    expectedPayoutRate: (inputs) =>
      calculateValvrave({
        actualGames: num(inputs.actualGames),
        displayGames: num(inputs.displayGames),
        czMode: str(inputs.czMode, 'unknown') as ValvraveCzMode,
        throughCount: Math.min(7, Math.max(0, Math.floor(num(inputs.throughCount)))),
      }).expectedPayoutRate,
  },
  {
    id: 'valvrave2',
    name: 'Lパチスロ 革命機ヴァルヴレイヴ2',
    shortName: 'ヴヴヴ2',
    fields: [
      { key: 'actualGames', label: '実G（ボーナス間）', type: 'number', min: 0 },
      { key: 'czGames', label: 'CZ間G', type: 'number', min: 0 },
      { key: 'cycle', label: '周期', type: 'number', min: 1, max: 6 },
      {
        key: 'mode',
        label: '周期モード',
        type: 'select',
        options: [
          { value: 'unknown', label: '不明（A想定）' },
          ...selectOptions(VALVRAVE2_MODE_LABEL, VALVRAVE2_MODE_IDS),
        ],
      },
      { key: 'shortened', label: '短縮天井（設定変更）', type: 'boolean' },
      {
        key: 'kessenThrough',
        label: '決戦スルー回数',
        type: 'number',
        min: 0,
        max: 3,
      },
    ],
    defaultInputs: () => ({
      actualGames: 540,
      czGames: 200,
      cycle: 1,
      mode: 'unknown',
      shortened: false,
      kessenThrough: 0,
    }),
    expectedPayoutRate: (inputs) =>
      calculateValvrave2({
        actualGames: num(inputs.actualGames),
        czGames: num(inputs.czGames),
        cycle: Math.min(6, Math.max(1, Math.floor(num(inputs.cycle, 1)))),
        mode: str(inputs.mode, 'unknown') as Valvrave2Mode,
        shortened: bool(inputs.shortened),
        kessenThrough: Math.min(
          3,
          Math.max(0, Math.floor(num(inputs.kessenThrough))),
        ),
      }).expectedPayoutRate,
  },
  {
    id: 'enen2',
    name: 'Lパチスロ 炎炎ノ消防隊2',
    shortName: '炎炎ノ消防隊2',
    fields: [
      { key: 'actualGames', label: '実G（ボーナス間）', type: 'number', min: 0 },
      {
        key: 'mode',
        label: 'モード',
        type: 'select',
        options: [
          { value: 'unknown', label: '不明（表のみ）' },
          ...selectOptions(ENEN_MODE_LABEL, ENEN_MODE_IDS),
        ],
      },
      { key: 'shortened', label: '短縮天井（設定変更）', type: 'boolean' },
      {
        key: 'trapThrough',
        label: '伝導者スルー回数',
        type: 'number',
        min: 0,
        max: 5,
      },
    ],
    defaultInputs: () => ({
      actualGames: 310,
      mode: 'unknown',
      shortened: false,
      trapThrough: 0,
    }),
    expectedPayoutRate: (inputs) =>
      calculateEnen2({
        actualGames: num(inputs.actualGames),
        mode: str(inputs.mode, 'unknown') as EnenMode,
        shortened: bool(inputs.shortened),
        trapThrough: Math.min(
          5,
          Math.max(0, Math.floor(num(inputs.trapThrough))),
        ),
      }).expectedPayoutRate,
  },
  {
    id: 'bakemonogatari',
    name: 'スマスロ 化物語',
    shortName: '化物語',
    fields: [
      { key: 'actualGames', label: '実G（AT後）', type: 'number', min: 0 },
      { key: 'shortened', label: '短縮天井（設定変更）', type: 'boolean' },
    ],
    defaultInputs: () => ({
      actualGames: 400,
      shortened: false,
    }),
    expectedPayoutRate: (inputs) =>
      calculateBake({
        actualGames: num(inputs.actualGames),
        shortened: bool(inputs.shortened),
      }).expectedPayoutRate,
  },
  {
    id: 'magireco',
    name: 'スマスロ マギアレコード',
    shortName: 'マギレコ',
    fields: [
      { key: 'actualGames', label: '実G（ボーナス間）', type: 'number', min: 0 },
      { key: 'shortened', label: '短縮天井（設定変更）', type: 'boolean' },
    ],
    defaultInputs: () => ({
      actualGames: 350,
      shortened: false,
    }),
    expectedPayoutRate: (inputs) =>
      calculateMagireco({
        actualGames: num(inputs.actualGames),
        shortened: bool(inputs.shortened),
      }).expectedPayoutRate,
  },
]

/** catalog と id が揃っているか確認用 */
export function assertRegistryCoversCatalog(): void {
  const ids = new Set(sessionMachines.map((m) => m.id))
  for (const c of machineCards) {
    if (!ids.has(c.id)) {
      console.warn(`[sessions] missing registry for ${c.id}`)
    }
  }
}

export function getSessionMachine(
  id: string,
): SessionMachineDef | undefined {
  return sessionMachines.find((m) => m.id === id)
}

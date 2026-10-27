import HazardCeilingPage from './HazardCeilingPage'
import type { defineAnchoredMachine } from '../lib/anchoredCeiling'

type Machine<S extends string> = ReturnType<typeof defineAnchoredMachine<S>>

export default function AnchoredMachinePage<S extends string>(props: {
  machineId: string
  title: string
  tagline: string
  machine: Machine<S>
  defaultSituation: S
  defaultGames: number
  inputNote?: string
  footnote: string
  provisional?: boolean
}) {
  const m = props.machine
  return (
    <HazardCeilingPage<S>
      machineId={props.machineId}
      title={props.title}
      tagline={props.tagline}
      gamesLabel="実G数"
      gamesLabelFor={m.gamesLabelFor}
      situationIds={m.order}
      situationLabel={m.situationLabel}
      defaultSituation={props.defaultSituation}
      defaultGames={props.defaultGames}
      ceilingFor={m.ceilingFor}
      pureIncPerGame={m.pureInc}
      calculate={m.calculate}
      premises={m.premises}
      inputNote={props.inputNote}
      premisesNote={
        props.provisional
          ? '【暫定】実戦値の表が未公開のため、目安値に合わせた推定→閉店補正。'
          : '公開されている実戦値の期待値表をそのまま補間→閉店補正。'
      }
      footnote={props.footnote}
    />
  )
}

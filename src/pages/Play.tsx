import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { Link, useParams } from "react-router-dom"
import { PaperShell } from "../components/Layout"
import { Button, Field, Kpi, Pill } from "../components/ui"
import { simById } from "../data/catalog"
import { teamForUser, useApp } from "../store"
import { getCompetitorSignal, type CompetitorSignal } from "../lib/typesafe"
import { NORTHWIND } from "../engine/northwind"
import type { AetherDecisions, HarborDecisions, MarklineDecisions, Session } from "../lib/types"
import { PerformanceDashboard } from "./Debrief"
import { metricsFor } from "../lib/performance"

export function Play() {
  const { code = "" } = useParams()
  const session = useApp((state) => state.getSession(code))
  const user = useApp((state) => state.user)
  const saveDecisions = useApp((state) => state.saveDecisions)
  const chooseNorthwind = useApp((state) => state.chooseNorthwind)
  const [signal, setSignal] = useState<CompetitorSignal | null>(null)
  const simId = session?.simId
  const catalogId = session?.catalogId
  const round = session?.round
  const competitorNames = session?.teams.filter((item) => item.isNpc).map((competitor) => competitor.name).join("|") ?? ""
  const team = session ? (user ? teamForUser(session, user.id) : session.teams.find((item) => !item.isNpc)) : undefined
  const [draft, setDraft] = useState<unknown>(team?.decisions)
  useEffect(() => {
    if (!simId || !catalogId || round === undefined) return
    const currentSim = simById(catalogId)
    void getCompetitorSignal({
      simulation: currentSim.name,
      round,
      competitors: competitorNames.split("|").filter(Boolean),
    }).then(setSignal)
  }, [session?.code, simId, catalogId, round, competitorNames])
  if (!session) return <PaperShell><Empty title="Room not found" /></PaperShell>
  const activeSim = simById(session.catalogId)
  const competitors = session.teams.filter((item) => item.isNpc)
  const currentState = team?.state as { cash?: number; stockPrice?: number } | undefined
  const latestResult = team?.history.at(-1) as { marketShare?: { value?: number }; fillRate?: number; scorecard?: { total?: number } } | undefined
  const submitRound = () => {
    if (!team) return
    if (session.simId === "northwind" && typeof draft === "string") chooseNorthwind(session.code, team.id, draft)
    else saveDecisions(session.code, team.id, draft, true)
  }
  return (
    <PaperShell>
      <main className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="font-mono text-xs uppercase tracking-[0.16em] text-ink/45">Room {session.code}</p><h1 className="mt-2 font-display text-5xl">{activeSim.name}</h1><p className="mt-2 text-ink/65">Round {session.round} of {session.totalRounds} · {team?.name ?? "Your team"}</p></div>
          <Button variant="ink" href={`/debrief/${session.code}`}>Open debrief</Button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <Kpi label={session.simId === "harborline" ? "Cash position" : "Stock price"} value={session.simId === "harborline" ? `$${((currentState?.cash ?? 4_200_000) / 1_000_000).toFixed(2)}M` : `$${(currentState?.stockPrice ?? 28).toFixed(2)}`} tone="brass" />
          <Kpi label={session.simId === "harborline" ? "Service level" : session.simId === "northwind" ? "Leadership score" : "Value share"} value={session.simId === "harborline" ? `${Math.round((latestResult?.fillRate ?? 1) * 100)}%` : session.simId === "northwind" ? `${Math.round(latestResult?.scorecard?.total ?? 0)}` : `${Math.round((latestResult?.marketShare?.value ?? 0.224) * 100)}%`} tone="good" />
          <Kpi label="Round status" value={session.status} />
        </div>
        <section className="mt-6 rounded-3xl bg-ink p-6 text-paper">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-xs uppercase tracking-[0.16em] text-brass-2">Competitive field</p><h2 className="mt-2 font-display text-3xl">Your room has {competitors.length} simulated competitors.</h2></div>
            <span className="font-mono text-xs text-paper/50">LIVE MARKET</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {competitors.map((competitor, index) => <div key={competitor.id} className="rounded-2xl border border-paper/15 bg-paper/5 p-4"><div className="flex items-center justify-between"><span className="font-medium">{competitor.name}</span><span className="font-mono text-xs text-brass-2">#{index + 2}</span></div><div className="mt-2 text-xs text-paper/50">Autonomous strategy · round {session.round + 1}</div></div>)}
          </div>
          <div className="mt-5 border-t border-paper/10 pt-4 text-xs text-paper/50">{signal ? <>Jev market read: <span className="text-brass-2">{signal.posture}</span> · {Math.round(signal.confidence * 100)}% confidence</> : "Jev market read will appear when the room connects."}</div>
        </section>
        <RoundLeaderboard session={session} playerTeamId={team?.id} />
        {session.status === "complete" ? <PerformanceDashboard session={session} /> : <DecisionBoard
          key={`${session.code}-${session.round}-${team?.id ?? "empty"}`}
          simId={session.simId}
          team={team}
          draft={draft}
          setDraft={setDraft}
          saveDraft={() => team && saveDecisions(session.code, team.id, draft, false)}
          submit={submitRound}
          disabled={!team}
        />}
      </main>
    </PaperShell>
  )
}

function RoundLeaderboard({ session, playerTeamId }: { session: Session; playerTeamId?: string }) {
  const rows = session.teams
    .map((team) => ({ team, score: metricsFor(team, session.simId).score }))
    .sort((a, b) => b.score - a.score)
  const playerIndex = rows.findIndex((row) => row.team.id === playerTeamId)
  const playerScore = playerIndex >= 0 ? rows[playerIndex].score : 0
  const completedRounds = Math.min(session.round, session.totalRounds)
  return (
    <section className="mt-6 rounded-3xl border border-ink/10 bg-paper-2/50 p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-ink/45">Round {Math.min(session.round + 1, session.totalRounds)} leaderboard</p>
          <h2 className="mt-2 font-display text-3xl">Stay ahead of the market.</h2>
        </div>
        <div className="min-w-48 text-right">
          <div className="flex justify-between text-[11px] uppercase tracking-[0.12em] text-ink/45"><span>Simulation progress</span><span>{completedRounds} / {session.totalRounds}</span></div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-brass transition-all" style={{ width: `${Math.max(3, (completedRounds / session.totalRounds) * 100)}%` }} /></div>
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {rows.map((row, index) => {
          const isPlayer = row.team.id === playerTeamId
          const previous = row.team.history.length > 1 ? metricsFor({ ...row.team, history: row.team.history.slice(0, -1) }, session.simId).score : row.score
          const movement = row.score - previous
          return <div key={row.team.id} className={`rounded-2xl border p-4 ${isPlayer ? "border-brass bg-brass/10" : "border-ink/10 bg-paper"}`}>
            <div className="flex items-center gap-3">
              <span className="w-7 font-mono text-sm text-ink/45">#{index + 1}</span>
              <div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><span className="truncate font-medium">{row.team.name}{isPlayer ? " · You" : ""}</span><span className="font-mono text-sm">{Math.round(row.score)}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10"><div className={`h-full rounded-full ${isPlayer ? "bg-brass" : "bg-ink/30"}`} style={{ width: `${Math.min(100, Math.max(4, row.score))}%` }} /></div></div>
              <span className={`w-12 text-right font-mono text-xs ${movement > 0 ? "text-sea" : movement < 0 ? "text-signal" : "text-ink/35"}`}>{movement > 0 ? `↑${Math.round(movement)}` : movement < 0 ? `↓${Math.abs(Math.round(movement))}` : "—"}</span>
            </div>
          </div>
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4 text-xs text-ink/55">
        <span>{playerIndex >= 0 ? `You are #${playerIndex + 1} of ${rows.length} this round.` : "Your team will appear after joining the room."}</span>
        <span className="font-mono text-brass">+{Math.max(0, Math.round(playerScore))} XP earned</span>
      </div>
    </section>
  )
}

function DecisionBoard({
  simId,
  team,
  draft,
  setDraft,
  saveDraft,
  submit,
  disabled,
}: {
  simId: string
  team?: { state: unknown; decisions: unknown | null }
  draft: unknown
  setDraft: (value: unknown) => void
  saveDraft: () => void
  submit: () => void
  disabled: boolean
}) {
  return (
    <section className="mt-6 rounded-3xl border border-ink/10 bg-paper-2/50 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><Pill>Decision board</Pill><h2 className="mt-3 font-display text-3xl">Make the call. See what the market does.</h2><p className="mt-2 max-w-2xl text-sm text-ink/65">Tune the levers for this round. Your competitors are making their own decisions in parallel.</p></div>
        <div className="rounded-2xl bg-paper px-4 py-3 text-right"><div className="text-[11px] uppercase tracking-[0.14em] text-ink/45">Decision status</div><div className="mt-1 font-mono text-sm">{disabled ? "Complete" : "Draft"}</div></div>
      </div>
      <div className="mt-8">
        {simId === "aether" && <AetherBoard value={draft as AetherDecisions} onChange={setDraft} />}
        {simId === "harborline" && <HarborBoard value={draft as HarborDecisions} onChange={setDraft} />}
        {simId === "markline" && <MarklineBoard value={draft as MarklineDecisions} onChange={setDraft} />}
        {simId === "northwind" && <NorthwindBoard state={team?.state as { chapter: number }} selected={typeof draft === "string" ? draft : undefined} onChange={setDraft} />}
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-5">
        <p className="text-xs text-ink/50">You can save a draft and adjust it before submitting.</p>
        <div className="flex gap-2"><Button variant="ghost" onClick={saveDraft} disabled={disabled}>Save draft</Button><Button onClick={submit} disabled={disabled}>Submit decisions ↗</Button></div>
      </div>
    </section>
  )
}

function AetherBoard({ value, onChange }: { value: AetherDecisions; onChange: (value: AetherDecisions) => void }) {
  if (!value) return null
  const update = (section: "marketing" | "production", segment: "value" | "prestige", key: string, next: number) =>
    onChange({ ...value, [section]: { ...value[section], [segment]: { ...value[section][segment], [key]: next } } })
  return <div className="grid gap-6 lg:grid-cols-2">
    <DecisionPanel title="01 · Product & marketing" description="Move toward the customer ideal, then decide how loudly to sell it.">
      <Field theme="light" label="Value performance R&D" value={value.rAndD.value.performance} min={4} max={11} step={0.1} onChange={(performance) => onChange({ ...value, rAndD: { ...value.rAndD, value: { ...value.rAndD.value, performance } } })} />
      <Field theme="light" label="Prestige performance R&D" value={value.rAndD.prestige.performance} min={9} max={18} step={0.1} onChange={(performance) => onChange({ ...value, rAndD: { ...value.rAndD, prestige: { ...value.rAndD.prestige, performance } } })} />
      <Field theme="light" label="Value price" value={value.marketing.value.price} min={16} max={32} step={0.5} prefix="$" onChange={(n) => update("marketing", "value", "price", n)} />
      <Field theme="light" label="Value promotion" value={value.marketing.value.promo} min={0} max={2200} step={50} prefix="$" onChange={(n) => update("marketing", "value", "promo", n)} />
      <Field theme="light" label="Prestige price" value={value.marketing.prestige.price} min={28} max={52} step={0.5} prefix="$" onChange={(n) => update("marketing", "prestige", "price", n)} />
      <Field theme="light" label="Prestige promotion" value={value.marketing.prestige.promo} min={0} max={2200} step={50} prefix="$" onChange={(n) => update("marketing", "prestige", "promo", n)} />
    </DecisionPanel>
    <DecisionPanel title="02 · Capacity & finance" description="Capacity arrives next year. Cash arrives only if you protect it.">
      <Field theme="light" label="Value production" value={value.production.value.units} min={0} max={4000} step={50} suffix=" units" onChange={(n) => update("production", "value", "units", n)} />
      <Field theme="light" label="Value capacity investment" value={value.production.value.capacityDelta} min={0} max={800} step={100} suffix=" units" onChange={(n) => update("production", "value", "capacityDelta", n)} />
      <Field theme="light" label="Prestige production" value={value.production.prestige.units} min={0} max={3000} step={50} suffix=" units" onChange={(n) => update("production", "prestige", "units", n)} />
      <Field theme="light" label="Dividend" value={value.finance.dividend} min={0} max={1.2} step={0.1} prefix="$" onChange={(n) => onChange({ ...value, finance: { ...value.finance, dividend: n } })} />
    </DecisionPanel>
  </div>
}

function HarborBoard({ value, onChange }: { value: HarborDecisions; onChange: (value: HarborDecisions) => void }) {
  if (!value) return null
  return <DecisionPanel title="Operations control tower" description="Balance service level, inventory, and the cost of an expedite.">
    <Field theme="light" label="Demand forecast" value={value.forecast} min={300} max={1800} step={10} suffix=" units" onChange={(forecast) => onChange({ ...value, forecast })} />
    <Field theme="light" label="Plant production" value={value.produce} min={0} max={1500} step={10} suffix=" units" onChange={(produce) => onChange({ ...value, produce })} />
    <Field theme="light" label="Import order" value={value.importOrder} min={0} max={1800} step={10} suffix=" units" onChange={(importOrder) => onChange({ ...value, importOrder })} />
    <Field theme="light" label="Local spot order" value={value.localOrder} min={0} max={800} step={10} suffix=" units" onChange={(localOrder) => onChange({ ...value, localOrder })} />
    <label className="flex items-center gap-3 rounded-xl border border-ink/10 bg-paper px-3 py-3 text-sm"><input type="checkbox" checked={value.expedite} onChange={(e) => onChange({ ...value, expedite: e.target.checked })} /> Expedite 280 units this month</label>
  </DecisionPanel>
}

function MarklineBoard({ value, onChange }: { value: MarklineDecisions; onChange: (value: MarklineDecisions) => void }) {
  if (!value) return null
  const first = value.brands[0]
  return <DecisionPanel title="Portfolio studio" description="Position the brand, fund awareness, and decide whether to launch a second offer.">
    <Field theme="light" label="Performance" value={first.performance} min={1} max={10} step={0.1} onChange={(performance) => onChange({ ...value, brands: [{ ...first, performance }, value.brands[1]] })} />
    <Field theme="light" label="Convenience" value={first.convenience} min={1} max={10} step={0.1} onChange={(convenience) => onChange({ ...value, brands: [{ ...first, convenience }, value.brands[1]] })} />
    <Field theme="light" label="Price" value={first.price} min={80} max={600} step={5} prefix="$" onChange={(price) => onChange({ ...value, brands: [{ ...first, price }, value.brands[1]] })} />
    <Field theme="light" label="Research budget" value={value.buyResearch ? 420000 : 0} min={0} max={420000} step={420000} prefix="$" onChange={(n) => onChange({ ...value, buyResearch: n > 0 })} />
    <label className="flex items-center gap-3 rounded-xl border border-ink/10 bg-paper px-3 py-3 text-sm"><input type="checkbox" checked={value.launchSecond} onChange={(e) => onChange({ ...value, launchSecond: e.target.checked })} /> Launch second brand</label>
  </DecisionPanel>
}

function NorthwindBoard({ state, selected, onChange }: { state: { chapter: number }; selected?: string; onChange: (value: unknown) => void }) {
  const chapter = NORTHWIND[state?.chapter ?? 0]
  if (!chapter) return <p className="text-sm text-ink/60">This leadership case has concluded. Review the debrief.</p>
  return <div><p className="text-xs uppercase tracking-[0.16em] text-ink/45">{chapter.kicker} · {chapter.title}</p><p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink/70">{chapter.body}</p><div className="mt-6 grid gap-3">{chapter.choices.map((choice) => {
    const isSelected = selected === choice.id
    return <button
      key={choice.id}
      type="button"
      aria-pressed={isSelected}
      onClick={() => onChange(choice.id)}
      className={`group relative rounded-2xl border p-4 pr-12 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2 focus-visible:ring-offset-paper-2 ${isSelected ? "border-brass bg-brass/15 shadow-[0_0_0_2px_rgba(196,163,90,0.25)]" : "border-ink/10 bg-paper hover:border-brass/70 hover:shadow-sm"}`}
    >
      <span className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full border text-xs transition ${isSelected ? "border-brass bg-brass text-ink" : "border-ink/20 text-transparent group-hover:border-brass/60"}`} aria-hidden="true">✓</span>
      <div className={`font-medium ${isSelected ? "text-ink" : ""}`}>{choice.label}</div>
      <div className="mt-1 text-sm text-ink/60">{choice.body}</div>
      {isSelected ? <div className="mt-3 text-[11px] font-medium uppercase tracking-[0.14em] text-signal">Selected for this round</div> : null}
    </button>
  })}</div></div>
}

function DecisionPanel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="rounded-2xl border border-ink/10 bg-paper p-5"><h3 className="font-display text-2xl">{title}</h3><p className="mt-1 text-sm text-ink/60">{description}</p><div className="mt-5 space-y-5">{children}</div></div>
}

function Empty({ title }: { title: string }) { return <main className="mx-auto max-w-3xl px-5 py-20"><h1 className="font-display text-4xl">{title}</h1><Link to="/join" className="mt-4 inline-block underline">Join another room</Link></main> }

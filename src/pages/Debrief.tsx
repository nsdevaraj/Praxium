import { useParams } from "react-router-dom"
import { PaperShell } from "../components/Layout"
import { Kpi } from "../components/ui"
import { simById } from "../data/catalog"
import { useApp } from "../store"
import type { Session } from "../lib/types"
import { metricsFor, type Metrics } from "../lib/performance"

export function Debrief() {
  const { code = "" } = useParams()
  const session = useApp((state) => state.getSession(code))
  if (!session) return <PaperShell><main className="mx-auto max-w-3xl px-5 py-20"><h1 className="font-display text-4xl">Debrief not found.</h1></main></PaperShell>
  const sim = simById(session.catalogId)
  return <PaperShell><main className="mx-auto max-w-6xl px-5 py-12"><p className="text-xs uppercase tracking-[0.18em] text-ink/45">Performance dashboard · {session.code}</p><h1 className="mt-2 font-display text-5xl">Here is what your strategy did.</h1><p className="mt-3 max-w-2xl text-ink/65">{sim.debriefPrompt}</p><PerformanceDashboard session={session} /></main></PaperShell>
}

export function PerformanceDashboard({ session }: { session: Session }) {
  if (!session) return null
  const teams = session.teams.map((team) => ({ team, metrics: metricsFor(team, session.simId) }))
  const sorted = [...teams].sort((a, b) => b.metrics.score - a.metrics.score)
  const player = teams.find(({ team }) => !team.isNpc) ?? teams[0]
  const rank = sorted.findIndex(({ team }) => team.id === player?.team.id) + 1
  const best = player ? sorted.slice(1).reduce((top, row) => row.metrics.score > top.metrics.score ? row : top, sorted[0]) : null
  const insights = player ? explain(player.metrics, best?.metrics) : []
  return <div className="mt-10">
    <div className="grid gap-4 sm:grid-cols-3">
      <Kpi label="Final rank" value={`#${rank} / ${teams.length}`} tone={rank === 1 ? "good" : "brass"} />
      <Kpi label="Performance score" value={`${Math.round(player?.metrics.score ?? 0)}`} tone="brass" />
      <Kpi label="Rounds completed" value={`${session.totalRounds} / ${session.totalRounds}`} tone="good" />
    </div>
    <section className="mt-6 rounded-3xl border border-ink/10 bg-paper-2/50 p-6">
      <div className="flex items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.16em] text-ink/45">Competitive result</p><h2 className="mt-2 font-display text-3xl">Your company vs. the field</h2></div><span className="font-mono text-xs text-ink/45">{session.simId.toUpperCase()}</span></div>
      <div className="mt-6 space-y-3">{sorted.map((row, index) => <div key={row.team.id} className={`rounded-2xl border p-4 ${row.team.id === player?.team.id ? "border-brass bg-brass/10" : "border-ink/10 bg-paper"}`}><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-3"><span className="font-mono text-sm text-ink/45">#{index + 1}</span><span className="font-medium">{row.team.name}</span>{row.team.id === player?.team.id ? <span className="rounded-full bg-brass px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]">You</span> : null}</div><span className="font-mono text-lg">{Math.round(row.metrics.score)}</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-brass" style={{ width: `${Math.min(100, Math.max(4, row.metrics.score))}%` }} /></div><div className="mt-2 text-xs text-ink/50">{row.metrics.label}</div></div>)}</div>
    </section>
    <section className="mt-6 grid gap-6 md:grid-cols-2">
      <div className="rounded-3xl border border-ink/10 p-6"><p className="text-xs uppercase tracking-[0.16em] text-sea">What went well</p><div className="mt-4 space-y-3">{insights.filter((item) => item.tone === "good").map((item) => <Insight key={item.text} {...item} />)}</div></div>
      <div className="rounded-3xl border border-ink/10 p-6"><p className="text-xs uppercase tracking-[0.16em] text-signal">What to improve</p><div className="mt-4 space-y-3">{insights.filter((item) => item.tone === "bad").map((item) => <Insight key={item.text} {...item} />)}</div></div>
    </section>
    <section className="mt-6 rounded-3xl bg-ink p-6 text-paper"><p className="text-xs uppercase tracking-[0.16em] text-brass-2">Debrief prompt</p><p className="mt-3 max-w-2xl font-display text-3xl">{simById(session.catalogId).debriefPrompt}</p></section>
  </div>
}

function explain(metrics: Metrics, competitor?: Metrics) {
  const delta = competitor ? metrics.score - competitor.score : 0
  return [
    { tone: metrics.primary >= 60 || delta >= 0 ? "good" : "bad", text: metrics.primary >= 60 ? "You built a meaningful operating advantage instead of only chasing the headline score." : "Your primary business outcome stayed below a healthy operating level." },
    { tone: metrics.secondary >= 0 || delta >= 0 ? "good" : "bad", text: delta >= 0 ? "Your choices held up against the strongest simulated competitor in the room." : `The strongest competitor finished ${Math.abs(Math.round(delta))} points ahead. Look for the round where the gap opened.` },
    { tone: metrics.secondary < 0 ? "bad" : "good", text: metrics.secondary < 0 ? "Your secondary signal is a warning: the strategy created pressure that will compound in the next round." : "Your secondary signal stayed constructive, giving the business room to keep learning." },
  ] as { tone: "good" | "bad"; text: string }[]
}

function Insight({ tone, text }: { tone: "good" | "bad"; text: string }) {
  return <div className={`rounded-2xl p-4 text-sm leading-relaxed ${tone === "good" ? "bg-sea/10 text-ink/75" : "bg-signal/10 text-ink/75"}`}><span className={`mr-2 font-mono ${tone === "good" ? "text-sea" : "text-signal"}`}>{tone === "good" ? "↑" : "!"}</span>{text}</div>
}

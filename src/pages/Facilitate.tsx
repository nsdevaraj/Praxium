import { useParams } from "react-router-dom"
import { PaperShell } from "../components/Layout"
import { Button } from "../components/ui"
import { simById } from "../data/catalog"
import { useApp } from "../store"

export function FacilitateHome() {
  return <PaperShell><main className="mx-auto max-w-4xl px-5 py-20"><p className="text-xs uppercase tracking-[0.18em] text-ink/45">Instructor desk</p><h1 className="mt-2 font-display text-5xl">Run the room, not the spreadsheet.</h1><p className="mt-4 max-w-2xl text-ink/70">Choose a simulation from the catalog to start a facilitator-led cohort.</p><Button className="mt-8" href="/catalog">Choose a simulation</Button></main></PaperShell>
}

export function Facilitate() {
  const { code = "" } = useParams()
  const session = useApp((state) => state.getSession(code))
  if (!session) return <PaperShell><main className="mx-auto max-w-3xl px-5 py-20"><h1 className="font-display text-4xl">Facilitator room not found.</h1></main></PaperShell>
  return <PaperShell><main className="mx-auto max-w-6xl px-5 py-12"><p className="font-mono text-xs uppercase tracking-[0.16em] text-ink/45">Live room · {session.code}</p><h1 className="mt-2 font-display text-5xl">{simById(session.catalogId).name}</h1><p className="mt-3 text-ink/65">Share the code with participants, then close each round when every team has submitted.</p><div className="mt-8 rounded-3xl border border-ink/10 p-6"><div className="font-mono text-4xl">{session.code}</div><div className="mt-6 space-y-3">{session.teams.map((team) => <div key={team.id} className="flex justify-between rounded-xl bg-paper-2/50 px-4 py-3"><span>{team.name}</span><span className="text-sm text-ink/55">{team.submitted ? "Submitted" : "Thinking"}</span></div>)}</div><Button className="mt-6" href={`/debrief/${session.code}`}>View debrief</Button></div></main></PaperShell>
}

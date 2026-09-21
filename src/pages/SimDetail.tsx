import { Link, useNavigate, useParams } from "react-router-dom"
import { CoverCard } from "../components/Covers"
import { PaperShell } from "../components/Layout"
import { Button } from "../components/ui"
import { CATALOG } from "../data/catalog"
import { useApp } from "../store"

export function SimDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const signIn = useApp((s) => s.signIn)
  const startSession = useApp((s) => s.startSession)
  const sim = CATALOG.find((s) => s.id === id)

  if (!sim) {
    return (
      <PaperShell>
        <div className="mx-auto max-w-3xl px-5 py-20">
          <h1 className="font-display text-4xl">That simulation is not in the catalog.</h1>
          <Link to="/catalog" className="mt-4 inline-block underline">
            Back to catalog
          </Link>
        </div>
      </PaperShell>
    )
  }

  function playSolo() {
    signIn("Player", "participant")
    const session = startSession(sim!.id, "solo", `${sim!.name} · self-paced`)
    navigate(`/play/${session.code}`)
  }

  return (
    <PaperShell>
      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.1fr_0.9fr] md:items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink/45">{sim.studio}</p>
          <h1 className="mt-2 font-display text-5xl">{sim.name}</h1>
          <p className="mt-4 text-lg text-ink/70">{sim.tagline}</p>
          <p className="mt-6 leading-relaxed text-ink/75">{sim.overview}</p>
          <ul className="mt-6 space-y-2 text-sm text-ink/75">
            {sim.learning.map((l) => (
              <li key={l} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brass" />
                {l}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm italic text-ink/55">{sim.analog}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={playSolo}>Start a room</Button>
            <span className="self-center text-sm text-ink/55">Simulated competitors join automatically.</span>
          </div>
        </div>
        <div>
          <CoverCard id={sim.engine} />
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Meta k="Length" v={sim.duration} />
            <Meta k="Players" v={sim.players} />
            <Meta k="Level" v={sim.level} />
            <Meta k="Best for" v={sim.bestFor} />
          </div>
        </div>
      </section>
    </PaperShell>
  )
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 p-3">
      <div className="text-[11px] uppercase tracking-[0.14em] text-ink/45">{k}</div>
      <div className="mt-1">{v}</div>
    </div>
  )
}

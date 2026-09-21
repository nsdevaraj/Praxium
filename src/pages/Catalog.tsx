import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { CoverCard } from "../components/Covers"
import { PaperShell } from "../components/Layout"
import { CATALOG } from "../data/catalog"

export function Catalog() {
  const [filter, setFilter] = useState("All")
  const filters = ["All", "Strategy", "Marketing", "Operations", "Leadership"]
  const simulations = useMemo(
    () => filter === "All" ? CATALOG : CATALOG.filter((sim) => sim.studio.toLowerCase().includes(filter.toLowerCase())),
    [filter],
  )

  return (
    <PaperShell>
      <section className="mx-auto max-w-6xl px-5 py-14">
        <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Studio catalog</p>
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <h1 className="mt-2 font-display text-5xl">Fourteen rooms. One serious advantage.</h1>
          <span className="font-mono text-xs text-ink/45">14 EXPERIENCES · 01 SHARED STANDARD</span>
        </div>
        <p className="mt-4 max-w-2xl text-ink/70">
          Ready-to-run simulations across strategy, marketing, operations, and leadership — spanning industries from
          automotive and banking to healthcare, retail, energy, telecom, and manufacturing. Each one supports
          self-paced play and a facilitator-led cohort with a join code.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button key={item} onClick={() => setFilter(item)} className={`rounded-full border px-4 py-2 text-xs transition ${filter === item ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink/60 hover:border-ink/40"}`}>
              {item}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {simulations.map((sim) => (
            <Link
              key={sim.id}
              to={`/sim/${sim.id}`}
              className="group overflow-hidden rounded-[28px] border border-ink/10 bg-paper-2/40 transition hover:border-brass/50"
            >
              <CoverCard id={sim.engine} />
              <div className="p-5">
                <div className="text-xs uppercase tracking-[0.16em] text-ink/45">{sim.studio}</div>
                <h2 className="mt-1 font-display text-3xl group-hover:text-signal">{sim.name}</h2>
                <p className="mt-2 text-sm text-ink/70">{sim.tagline}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {sim.topics.slice(0, 4).map((t) => (
                    <span key={t} className="rounded-full bg-ink/5 px-2.5 py-1 text-xs text-ink/60">
                      {t}
                    </span>
                  ))}
                </div>
                <p className="mt-4 font-mono text-xs text-ink/45">
                  {sim.duration} · {sim.players}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PaperShell>
  )
}

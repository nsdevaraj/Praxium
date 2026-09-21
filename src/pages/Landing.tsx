import { Link, useNavigate } from "react-router-dom"
import { CoverCard } from "../components/Covers"
import { PaperShell } from "../components/Layout"
import { Button, Pill } from "../components/ui"
import { CATALOG } from "../data/catalog"
import { useApp } from "../store"
import boardroomImage from "../assets/boardroom.png"
import yardImage from "../assets/yard.png"
import deskImage from "../assets/desk.png"

export function Landing() {
  const navigate = useNavigate()
  const signIn = useApp((s) => s.signIn)
  const startSession = useApp((s) => s.startSession)

  function playNow() {
    signIn("Player", "participant")
    const session = startSession("aether", "solo", "Aether Motors · self-paced")
    navigate(`/play/${session.code}`)
  }

  return (
    <PaperShell>
      <section className="bg-ink text-snow">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-16 pt-14 md:grid-cols-[1fr_0.9fr] md:items-center md:pb-24 md:pt-20">
          <div>
            <Pill>Business simulations · MBA · corporate L&amp;D</Pill>
            <h1 className="mt-6 max-w-3xl font-display text-5xl leading-[1.02] tracking-tight text-paper md:text-7xl">
              Put them in the chair before they have the title.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-snow/70">
              Decision-making under pressure, without the cost of getting it wrong in real life. Praxium turns strategy,
              operations, marketing, and change into rooms that talk back.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={playNow}>Play Aether Motors <span aria-hidden="true">↗</span></Button>
              <Button variant="paper" href="/catalog">
                Browse the catalog
              </Button>
              <Button variant="ghost" href="/facilitate" className="border-snow/20 text-snow hover:border-snow/50">
                Open instructor desk
              </Button>
            </div>
            <div className="mt-12 grid max-w-xl grid-cols-3 gap-4 border-t border-snow/15 pt-5">
              {[
                ["14", "simulation rooms"],
                ["08", "rounds in flagship"],
                ["1", "shared market reality"],
              ].map(([value, label]) => (
                <div key={label}>
                  <div className="font-mono text-2xl text-brass-2">{value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.12em] text-snow/45">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[36px] bg-brass/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[30px] border border-snow/15 bg-ink-2 shadow-2xl">
              <img src={boardroomImage} alt="A facilitation team reviewing a live simulation dashboard" className="aspect-[4/3] w-full object-cover" />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-snow/20 bg-ink/80 p-4 backdrop-blur">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-snow/55">
                  <span>Live room · Aether Motors</span>
                  <span className="text-sea-2">● In progress</span>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="font-mono text-2xl text-paper">$214.8M</div>
                    <div className="text-xs text-snow/45">enterprise value · year 4</div>
                  </div>
                  <div className="font-mono text-sm text-sea-2">+18.4%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-ink/10 bg-ink text-paper">
        <div className="ticker flex whitespace-nowrap py-3 font-mono text-xs uppercase tracking-[0.18em] text-brass-2">
          {[0, 1].map((k) => (
            <span key={k} className="flex gap-10 px-6">
              <span>AETH 28.4</span>
              <span>Value share 22%</span>
              <span>Harborline fill 94%</span>
              <span>Northwind board 61</span>
              <span>Markline Explorers 0.31</span>
              <span>Emergency loan: none</span>
              <span>Round close in 04:00</span>
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-2 md:items-center">
        <div className="relative">
          <CoverCard id="aether" />
          <div className="absolute -bottom-5 -right-4 hidden w-44 overflow-hidden rounded-2xl border-4 border-paper shadow-xl md:block">
            <img src={deskImage} alt="Strategy workshop desk with perceptual maps" className="aspect-square object-cover" />
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink/50">Flagship</p>
          <h2 className="mt-2 font-display text-4xl">Aether Motors</h2>
          <p className="mt-4 text-ink/70 leading-relaxed">
            Two segments, four functions, eight years, and three house competitors who will not play nice. R&amp;D lands next year.
            Capacity lands next year. Cash is this year. A balanced scorecard waits at the close.
          </p>
          <Link to="/sim/aether" className="mt-5 inline-block text-sm font-medium underline decoration-brass underline-offset-4">
            Open the briefing
          </Link>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-ink text-paper">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-14 md:grid-cols-[0.85fr_1.15fr] md:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brass-2">Made for the debrief</p>
            <h2 className="mt-3 font-display text-4xl leading-tight">The market is the teacher. The room is the classroom.</h2>
            <p className="mt-4 max-w-md leading-relaxed text-paper/65">
              Every decision leaves a trace. Compare teams, replay the turning point, then give the facilitator the data to ask a better question.
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-paper/15">
            <img src={yardImage} alt="Container port at dusk representing a live operations environment" className="h-64 w-full object-cover md:h-80" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-3xl">The catalog</h2>
          <Link to="/catalog" className="text-sm underline decoration-brass underline-offset-4">
            All 14 simulations
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {CATALOG.slice(0, 6).map((sim) => (
            <Link key={sim.id} to={`/sim/${sim.id}`} className="group rounded-[28px] border border-ink/10 bg-paper-2/50 p-3 transition hover:border-brass/50">
              <CoverCard id={sim.engine} />
              <div className="px-3 pb-3 pt-4">
                <div className="text-xs uppercase tracking-[0.16em] text-ink/45">{sim.studio}</div>
                <div className="mt-1 font-display text-2xl group-hover:text-signal">{sim.name}</div>
                <p className="mt-2 text-sm text-ink/70">{sim.tagline}</p>
                <p className="mt-3 font-mono text-xs text-ink/45">{sim.duration}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-ink/10 bg-paper-2/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-3">
          {[
            { n: "01", t: "Stand up a room", d: "Pick a simulation, get a join code, set rounds. Solo play closes the books on submit. Cohorts wait for the facilitator." },
            { n: "02", t: "Make the year", d: "Decision boards, live forecasts, a coach that reads the same numbers the debrief will. House competitors keep a solo run honest." },
            { n: "03", t: "Debrief the damage", d: "Industry charts, scorecards, teaching notes, discussion prompts. The point is the conversation after the last round." },
          ].map((s) => (
            <div key={s.n}>
              <div className="font-mono text-xs text-brass">{s.n}</div>
              <h3 className="mt-2 font-display text-2xl">{s.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/70">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <h2 className="font-display text-3xl">Built next to the programs you already know</h2>
        <p className="mt-4 max-w-3xl text-ink/70">
          Forio, Capsim, Cesim, Marketplace Simulations, Markstrat, KNOLSKAPE, Virtonomics, GingrTech, BranchTrack,
          MonsoonSIM — different catalogs, the same job: put a team in a market that talks back. Praxium is a working
          studio for that job, with four playable rooms and an instructor desk.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Strategy capstone", "Aether Motors"],
            ["Marketing strategy", "Markline"],
            ["Operations", "Harborline"],
            ["Leadership & change", "Northwind"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-ink/10 p-4">
              <div className="text-xs uppercase tracking-[0.16em] text-ink/45">{k}</div>
              <div className="mt-1 font-display text-xl">{v}</div>
            </div>
          ))}
        </div>
      </section>
    </PaperShell>
  )
}

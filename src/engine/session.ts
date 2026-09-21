import { CATALOG, TEAM_COLORS, simById } from "../data/catalog"
import { sessionCode, uid } from "../lib/format"
import type { Session, SimId, Team } from "../lib/types"
import {
  defaultAetherState,
  holdDecisions,
  npcAetherDecisions,
  runAetherYear,
} from "./aether"
import { defaultHarborState, holdHarbor, runHarborMonth } from "./harborline"
import {
  defaultMarkline,
  holdMarkline,
  npcMarkline,
  runMarklinePeriod,
} from "./markline"
import { applyNorthwindChoice, defaultNorthwind } from "./northwind"

const NPC_AETHER = [
  { id: "npc-helios", name: "Helios", kind: "helios" as const, color: "#8a8f99" },
  { id: "npc-vesper", name: "Vesper", kind: "vesper" as const, color: "#6e5b73" },
  { id: "npc-northline", name: "Northline", kind: "northline" as const, color: "#4d5e56" },
]

const NPC_MARK = [
  { id: "npc-lumen", name: "Lumen", kind: "lumen" as const, color: "#8a8f99" },
  { id: "npc-arc", name: "Arc", kind: "arc" as const, color: "#6e5b73" },
]

const NPC_GENERIC = [
  { id: "npc-atlas", name: "Atlas", color: "#8a8f99" },
  { id: "npc-ember", name: "Ember", color: "#6e5b73" },
]

function humanTeam(name: string, color: string, member?: { id: string; name: string }): Team {
  return {
    id: uid("team"),
    name,
    color,
    isNpc: false,
    members: member ? [member] : [],
    submitted: false,
    decisions: null,
    state: null,
    history: [],
  }
}

function initTeamState(simId: SimId, team: Team, npcKind?: string): Team {
  if (simId === "aether") {
    const kind = (npcKind as "human" | "helios" | "vesper" | "northline") ?? "human"
    const state = defaultAetherState(kind)
    return { ...team, state, decisions: holdDecisions(state) }
  }
  if (simId === "harborline") {
    const state = defaultHarborState()
    return { ...team, state, decisions: holdHarbor(state) }
  }
  if (simId === "northwind") {
    return { ...team, state: defaultNorthwind(), decisions: null }
  }
  const kind = (npcKind as "human" | "lumen" | "arc") ?? "human"
  const state = defaultMarkline(kind)
  return { ...team, state, decisions: holdMarkline(state) }
}

export function createSession(opts: {
  simId: SimId
  catalogId?: string
  name?: string
  instructorName: string
  mode: "solo" | "cohort"
  player?: { id: string; name: string }
}): Session {
  const catalogId = opts.catalogId ?? opts.simId
  const sim = simById(catalogId)
  const teams: Team[] = []
  if (opts.mode === "solo" && opts.player) {
    teams.push(initTeamState(opts.simId, humanTeam("House", TEAM_COLORS[0], opts.player)))
  }
  if (opts.simId === "aether") {
    for (const npc of NPC_AETHER) {
      teams.push(
        initTeamState(
          opts.simId,
          {
            id: npc.id,
            name: npc.name,
            color: npc.color,
            isNpc: true,
            members: [{ id: npc.id, name: "House model" }],
            submitted: true,
            decisions: null,
            state: null,
            history: [],
          },
          npc.kind,
        ),
      )
    }
  }
  if (opts.simId === "markline") {
    for (const npc of NPC_MARK) {
      teams.push(
        initTeamState(
          opts.simId,
          {
            id: npc.id,
            name: npc.name,
            color: npc.color,
            isNpc: true,
            members: [{ id: npc.id, name: "House model" }],
            submitted: true,
            decisions: null,
            state: null,
            history: [],
          },
          npc.kind,
        ),
      )
    }
  }
  if (opts.simId === "harborline" || opts.simId === "northwind") {
    for (const npc of NPC_GENERIC) {
      teams.push(
        initTeamState(
          opts.simId,
          {
            id: `${npc.id}-${opts.simId}`,
            name: npc.name,
            color: npc.color,
            isNpc: true,
            members: [{ id: npc.id, name: "Simulated competitor" }],
            submitted: true,
            decisions: null,
            state: null,
            history: [],
          },
          "npc",
        ),
      )
    }
  }
  return {
    id: uid("ses"),
    code: sessionCode(),
    name: opts.name ?? `${sim.name} · ${opts.mode === "solo" ? "Self-paced" : "Cohort"}`,
    simId: opts.simId,
    catalogId,
    instructorName: opts.instructorName,
    mode: opts.mode,
    status: opts.mode === "solo" ? "playing" : "lobby",
    round: 0,
    totalRounds: sim.rounds,
    teams,
    broadcasts: [
      {
        id: uid("bc"),
        at: Date.now(),
        text:
          opts.mode === "solo"
            ? "Self-paced run. Submitting a round closes the books immediately."
            : "Lobby open. Share the join code. Advance the round when the room is ready.",
      },
    ],
    createdAt: Date.now(),
    notes: sim.debriefPrompt,
  }
}

export function addHumanTeam(session: Session, name: string, member: { id: string; name: string }): Session {
  const used = session.teams.filter((t) => !t.isNpc).length
  const team = initTeamState(session.simId, humanTeam(name, TEAM_COLORS[used % TEAM_COLORS.length], member))
  return { ...session, teams: [...session.teams, team] }
}

export function joinTeam(session: Session, teamId: string, member: { id: string; name: string }): Session {
  return {
    ...session,
    teams: session.teams.map((t) =>
      t.id === teamId && !t.members.some((m) => m.id === member.id)
        ? { ...t, members: [...t.members, member] }
        : t,
    ),
  }
}

function npcDecisionsFor(session: Session, team: Team): unknown {
  if (session.simId === "aether") {
    const kind = team.id.includes("helios") ? "helios" : team.id.includes("vesper") ? "vesper" : "northline"
    return npcAetherDecisions(kind, team.state as never, session.round)
  }
  if (session.simId === "markline") {
    const kind = team.id.includes("lumen") ? "lumen" : "arc"
    return npcMarkline(kind, team.state as never, session.round)
  }
  return team.decisions
}

export function advanceRound(session: Session, postures: Record<string, string> = {}): Session {
  if (session.status === "complete") return session
  if (session.simId === "northwind") {
    const teams = session.teams.map((team) => {
      if (!team.isNpc || (team.state as { ended?: boolean })?.ended) return team
      const choice = (team.state as { chapter: number }).chapter % 3
      const state = applyNorthwindChoice(team.state as never, ["listen", "triangle", "pride"][choice])
      return { ...team, state, submitted: false, history: state.log }
    })
    return {
      ...session,
      teams,
      round: Math.min(session.totalRounds, session.round + 1),
      status: teams.every((t) => (t.state as { ended?: boolean })?.ended) ? "complete" : "playing",
    }
  }

  const teams = session.teams.map((t) => {
    if (t.isNpc) return { ...t, decisions: applyPosture(session, t, npcDecisionsFor(session, t), postures[t.id]), submitted: true }
    if (!t.submitted || !t.decisions) {
      return { ...t, decisions: t.decisions ?? defaultHold(session, t), submitted: true }
    }

    function applyPosture(session: Session, _team: Team, decisions: unknown, posture?: string): unknown {
      if (!posture || session.simId === "northwind") return decisions
      if (session.simId === "aether") {
        const next = structuredClone(decisions) as ReturnType<typeof holdDecisions>
        if (posture === "defend") {
          next.marketing.value.price += 1
          next.marketing.prestige.price += 1.5
          next.finance.dividend = 0.35
        } else if (posture === "expand") {
          next.production.value.capacityDelta += 250
          next.production.prestige.capacityDelta += 200
          next.finance.dividend = 0.1
        } else {
          next.marketing.value.price -= 1.2
          next.marketing.prestige.price -= 1.5
          next.marketing.value.promo += 350
          next.marketing.prestige.promo += 350
        }
        return next
      }
      if (session.simId === "harborline") {
        const next = structuredClone(decisions) as ReturnType<typeof holdHarbor>
        if (posture === "defend") next.importOrder = Math.max(0, next.importOrder - 120)
        if (posture === "expand") next.importOrder += 220
        if (posture === "disrupt") {
          next.localOrder += 240
          next.expedite = true
        }
        return next
      }
      const next = structuredClone(decisions) as ReturnType<typeof holdMarkline>
      if (posture === "defend") next.brands[0].price += 12
      if (posture === "expand") {
        next.brands[0].ad.explorers += 300
        next.brands[0].ad.followers += 300
      }
      if (posture === "disrupt") {
        next.brands[0].price -= 18
        next.brands[0].ad.conservatives += 250
      }
      return next
    }
    return t
  })

  let nextTeams: Team[] = teams
  if (session.simId === "aether") {
    const ran = runAetherYear(
      teams.map((t) => ({ id: t.id, state: t.state as never, decisions: t.decisions as never })),
      session.round,
    )
    nextTeams = teams.map((t) => {
      const r = ran.find((x) => x.id === t.id)!
      return { ...t, state: r.state, history: [...t.history, r.result], submitted: false, decisions: holdDecisions(r.state) }
    })
  } else if (session.simId === "harborline") {
    nextTeams = teams.map((t) => {
      const r = runHarborMonth(t.state as never, t.decisions as never, session.round)
      return { ...t, state: r.state, history: [...t.history, r.result], submitted: false, decisions: holdHarbor(r.state) }
    })
  } else if (session.simId === "markline") {
    const ran = runMarklinePeriod(
      teams.map((t) => ({ id: t.id, state: t.state as never, decisions: t.decisions as never })),
      session.round,
    )
    nextTeams = teams.map((t) => {
      const r = ran.find((x) => x.id === t.id)!
      return { ...t, state: r.state, history: [...t.history, r.result], submitted: false, decisions: holdMarkline(r.state) }
    })
  }

  const nextRound = session.round + 1
  const done = nextRound >= session.totalRounds
  return {
    ...session,
    teams: nextTeams,
    round: done ? session.totalRounds : nextRound,
    status: done ? "complete" : "playing",
    broadcasts: done
      ? [...session.broadcasts, { id: uid("bc"), at: Date.now(), text: "Books are closed. Open the debrief." }]
      : session.broadcasts,
  }
}

function defaultHold(session: Session, team: Team): unknown {
  if (session.simId === "aether") return holdDecisions(team.state as never)
  if (session.simId === "harborline") return holdHarbor(team.state as never)
  if (session.simId === "markline") return holdMarkline(team.state as never)
  return team.decisions
}

export function teachingNote(simId: SimId, round: number): { title: string; body: string } {
  const sim = CATALOG.find((s) => s.id === simId)!
  if (simId === "aether") {
    const notes = [
      { title: "Year 1 — Do not confuse motion with strategy", body: "Most teams over-produce and over-advertise. Ask what they are optimizing: share, cash, or the stock. The industry report is public; the temptation is to copy Helios on price." },
      { title: "Year 2 — Capacity is a year late", body: "Anyone who added plant last year is just now receiving it. Anyone adding it now is paying for a market they cannot see. This is the compounding lesson." },
      { title: "Year 3 — Drift is visible", body: "Value wants cheaper and slightly better. Prestige wants performance. Teams still sitting on year-0 specs are quietly becoming leftovers." },
      { title: "Year 4 — The middle is a trap", body: "A product that is almost right for both segments is right for neither. Pull the perceptual discussion even though this is a full-firm sim." },
      { title: "Year 5 — Recession", body: "Economy prints 0.91. Inventory and debt show. Emergency loans are a teaching gift. Do not rescue teams." },
      { title: "Year 6 — Recovery and revenge", body: "Demand returns. Who still has capacity? Who still has cash? Who still has awareness?" },
      { title: "Year 7 — Harvest or double", body: "Two years left. Dividends and buybacks reveal the real objective function." },
      { title: "Year 8 — Close the books", body: "Balanced scorecard, not just profit. A high-share unprofitable team and a quiet cash machine should fight in the debrief." },
    ]
    return notes[Math.min(round, notes.length - 1)]
  }
  if (simId === "harborline") {
    if (round === 6) return { title: "Month 7 — The shock", body: "Do not announce it. Let them live it. Then show inbound versus finished goods. The beer game in one slide." }
    return { title: `${sim.roundLabel} ${round + 1}`, body: "Ask for the forecast rationale before they see demand. Service level without a cost-to-serve is a slogan." }
  }
  if (simId === "northwind") {
    const ch = ["90 days", "Coalition", "Narrative", "Pilot", "Resistance", "Board"][round] ?? "Close"
    return { title: `Episode ${round + 1} — ${ch}`, body: sim.debriefPrompt }
  }
  return { title: `Period ${round + 1}`, body: "Draw the map before the share table. Positioning errors are geometric, not verbal." }
}

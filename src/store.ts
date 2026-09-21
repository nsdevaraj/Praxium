import { create } from "zustand"
import { persist } from "zustand/middleware"
import { simById } from "./data/catalog"
import { applyNorthwindChoice } from "./engine/northwind"
import { addHumanTeam, advanceRound, createSession, joinTeam } from "./engine/session"
import { uid } from "./lib/format"
import type { Session, User } from "./lib/types"
import { getCompetitorPostures } from "./lib/typesafe"

interface AppState {
  user: User | null
  sessions: Session[]
  signIn: (name: string, role: User["role"]) => User
  signOut: () => void
  startSession: (catalogId: string, mode: "solo" | "cohort", name?: string) => Session
  upsertSession: (session: Session) => void
  getSession: (code: string) => Session | undefined
  joinWithCode: (code: string, teamName?: string, teamId?: string) => Session | null
  saveDecisions: (code: string, teamId: string, decisions: unknown, submit: boolean) => Promise<void>
  chooseNorthwind: (code: string, teamId: string, choiceId: string) => void
  closeRound: (code: string) => Promise<void>
  broadcast: (code: string, text: string) => void
  resetAll: () => void
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      sessions: [],
      signIn: (name, role) => {
        const user: User = { id: uid("user"), name: name.trim() || (role === "instructor" ? "Facilitator" : "Participant"), role }
        set({ user })
        return user
      },
      signOut: () => set({ user: null }),
      startSession: (catalogId, mode, name) => {
        const user = get().user ?? get().signIn(mode === "solo" ? "Player" : "Facilitator", mode === "solo" ? "participant" : "instructor")
        const sim = simById(catalogId)
        const session = createSession({
          simId: sim.engine,
          catalogId: sim.id,
          name,
          instructorName: user.role === "instructor" ? user.name : "Self-paced",
          mode,
          player: mode === "solo" ? user : undefined,
        })
        set({ sessions: [session, ...get().sessions] })
        return session
      },
      upsertSession: (session) =>
        set({
          sessions: get().sessions.some((s) => s.id === session.id)
            ? get().sessions.map((s) => (s.id === session.id ? session : s))
            : [session, ...get().sessions],
        }),
      getSession: (code) => get().sessions.find((s) => s.code.toLowerCase() === code.toLowerCase()),
      joinWithCode: (code, teamName, teamId) => {
        const user = get().user
        const session = get().getSession(code)
        if (!user || !session) return null
        let next = session
        if (teamId) next = joinTeam(next, teamId, user)
        else next = addHumanTeam(next, teamName || `${user.name}'s team`, user)
        if (next.status === "lobby") next = { ...next, status: "playing" }
        get().upsertSession(next)
        return next
      },
      saveDecisions: (code, teamId, decisions, submit) => {
        const session = get().getSession(code)
        if (!session) return Promise.resolve()
        let next: Session = {
          ...session,
          teams: session.teams.map((t) => (t.id === teamId ? { ...t, decisions, submitted: submit || t.submitted } : t)),
        }
        if (submit && session.mode === "solo") {
          return getCompetitorPostures(
            next.teams.filter((team) => team.isNpc).map((team) => ({
              id: team.id,
              name: team.name,
              state: team.state,
              round: next.round,
              simulation: next.simId,
            })),
          ).then((signals) => {
            const postures = Object.fromEntries(Object.entries(signals).map(([id, signal]) => [id, signal.posture]))
            get().upsertSession(advanceRound(next, postures))
          })
        }
        get().upsertSession(next)
        return Promise.resolve()
      },
      chooseNorthwind: (code, teamId, choiceId) => {
        const session = get().getSession(code)
        if (!session) return
        let next: Session = {
          ...session,
          teams: session.teams.map((t) => {
            if (t.id !== teamId) return t
            const state = applyNorthwindChoice(t.state as never, choiceId)
            return {
              ...t,
              state,
              submitted: true,
              history: state.log,
            }
          }),
        }
        if (session.mode === "solo") next = { ...next, round: (next.teams.find((t) => t.id === teamId)?.state as { chapter: number }).chapter, status: (next.teams.find((t) => t.id === teamId)?.state as { ended?: boolean }).ended ? "complete" : "playing" }
        get().upsertSession(next)
      },
      closeRound: (code) => {
        const session = get().getSession(code)
        if (!session) return Promise.resolve()
        return getCompetitorPostures(
          session.teams.filter((team) => team.isNpc).map((team) => ({
            id: team.id,
            name: team.name,
            state: team.state,
            round: session.round,
            simulation: session.simId,
          })),
        ).then((signals) => {
          const postures = Object.fromEntries(Object.entries(signals).map(([id, signal]) => [id, signal.posture]))
          get().upsertSession(advanceRound(session, postures))
        })
      },
      broadcast: (code, text) => {
        const session = get().getSession(code)
        if (!session) return
        get().upsertSession({
          ...session,
          broadcasts: [...session.broadcasts, { id: uid("bc"), at: Date.now(), text }],
        })
      },
      resetAll: () => set({ sessions: [], user: get().user }),
    }),
    { name: "praxium-v1" },
  ),
)

export function teamForUser(session: Session, userId: string) {
  return session.teams.find((t) => t.members.some((m) => m.id === userId) && !t.isNpc)
}

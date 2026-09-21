import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PaperShell } from "../components/Layout"
import { Button } from "../components/ui"
import { useApp } from "../store"

export function Join() {
  const navigate = useNavigate()
  const signIn = useApp((s) => s.signIn)
  const startSession = useApp((s) => s.startSession)
  const getSession = useApp((s) => s.getSession)
  const joinWithCode = useApp((s) => s.joinWithCode)
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [teamName, setTeamName] = useState("")
  const [teamId, setTeamId] = useState("")
  const [error, setError] = useState("")
  const session = getSession(code)

  function go() {
    setError("")
    const user = signIn(name || "Participant", "participant")
    const found = getSession(code)
    if (!found) {
      const room = startSession("aether", "solo", "Aether Motors · open room")
      navigate(`/play/${room.code}`)
      return
    }
    const next = joinWithCode(found.code, teamName || `${user.name}'s team`, teamId || undefined)
    if (!next) {
      setError("Could not join that room.")
      return
    }
    navigate(`/play/${next.code}`)
  }

  return (
    <PaperShell>
      <section className="mx-auto max-w-lg px-5 py-16">
        <p className="text-xs uppercase tracking-[0.18em] text-ink/45">Participant</p>
        <h1 className="mt-2 font-display text-4xl">Join a room</h1>
        <p className="mt-3 text-ink/70">Enter a room code to join another player, or start any simulation from the catalog. Every room includes simulated competitors.</p>
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            go()
          }}
        >
          <label className="block text-sm">
            Your name
            <input
              className="mt-1 w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dana Okonkwo"
            />
          </label>
          <label className="block text-sm">
            Room code
            <input
              className="mt-1 w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3 font-mono uppercase"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="PX-7K2M"
            />
          </label>
          {session ? (
            <label className="block text-sm">
              Team
              <select
                className="mt-1 w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3"
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
              >
                <option value="">Start a new team</option>
                {session.teams
                  .filter((t) => !t.isNpc)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.members.length})
                    </option>
                  ))}
              </select>
            </label>
          ) : null}
          {!teamId ? (
            <label className="block text-sm">
              New team name
              <input
                className="mt-1 w-full rounded-2xl border border-ink/15 bg-paper px-4 py-3"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Keystone"
              />
            </label>
          ) : null}
          {error ? <p className="text-sm text-signal">{error}</p> : null}
          <Button type="submit">Enter the cockpit</Button>
          <p className="text-sm text-ink/55">Looking for a new room? <a href="/catalog" className="underline decoration-brass underline-offset-4">Browse simulations</a>.</p>
        </form>
      </section>
    </PaperShell>
  )
}

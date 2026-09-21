import type { Team } from "./types"

export type Metrics = { score: number; label: string; primary: number; secondary: number }

export function metricsFor(team: Team, simId: string): Metrics {
  const state = team.state as Record<string, unknown>
  const latest = (team.history.at(-1) ?? {}) as Record<string, unknown>
  if (simId === "aether") {
    const score = Number((latest.scorecard as { total?: number } | undefined)?.total ?? 0)
    return { score, label: `Balanced scorecard · ${score}/100`, primary: score, secondary: Number(state.stockPrice ?? 0) }
  }
  if (simId === "harborline") {
    const service = Number(state.serviceLevel ?? 0) * 100
    const cash = Number(state.cash ?? 0) / 100000
    return { score: Math.max(0, Math.min(100, service * 0.7 + Math.min(100, cash / 50) * 0.3)), label: `${Math.round(service)}% service level · $${(Number(state.cash ?? 0) / 1000000).toFixed(2)}M cash`, primary: service, secondary: cash }
  }
  if (simId === "markline") {
    const contribution = Number(latest.contribution ?? 0)
    const cash = Number(state.cash ?? 0) / 1000000
    return { score: Math.max(0, Math.min(100, 50 + contribution / 100000 + cash * 2)), label: `$${(contribution / 1000000).toFixed(2)}M contribution · $${cash.toFixed(2)}M cash`, primary: contribution, secondary: cash }
  }
  const leadership = (Number(state.storeBuyIn ?? 0) + Number(state.boardConfidence ?? 0) + Number(state.digitalCapability ?? 0) + Number(state.marcusTrust ?? 0)) / 4
  return { score: leadership, label: `${Math.round(leadership)}/100 coalition strength · ${state.ending ?? "case outcome"}`, primary: leadership, secondary: Number(state.nps ?? 0) }
}

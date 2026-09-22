export interface CompetitorSignal {
  posture: string
  confidence: number
}

export async function getCompetitorSignal(state: object): Promise<CompetitorSignal | null> {
  try {
    const response = await fetch('/api/laya', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state,
        questions: {
          posture: {
            type: 'choice',
            instructions: 'Choose the simulated competitor posture for this business simulation round.',
            criteria: {
              defend: 'Protect margin and cash while competitors are aggressive.',
              expand: 'Invest ahead of demand to capture share and build capacity.',
              disrupt: 'Use a bold price or positioning move to change the market.',
            },
          },
        },
      }),
    })
    if (!response.ok) return null
    const data = (await response.json()) as { answers?: { posture?: { choice?: string; confidence?: number } } }
    const answer = data.answers?.posture
    return answer?.choice ? { posture: answer.choice, confidence: answer.confidence ?? 0 } : null
  } catch {
    return null
  }
}

export async function getCompetitorPostures(
  competitors: { id: string; name: string; state: unknown; round: number; simulation: string }[],
): Promise<Record<string, CompetitorSignal>> {
  const entries = await Promise.all(
    competitors.map(async (competitor) => {
      const signal = await getCompetitorSignal({
        simulation: competitor.simulation,
        round: competitor.round,
        competitor: competitor.name,
        currentState: competitor.state,
        instruction: "Choose the strongest financially viable posture for this competitor. Play to win, but avoid reckless decisions.",
      })
      return signal ? ([competitor.id, signal] as const) : null
    }),
  )
  return Object.fromEntries(entries.filter((entry): entry is readonly [string, CompetitorSignal] => entry !== null))
}

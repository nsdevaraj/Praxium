import { clamp, mulberry32 } from "../lib/format"
import type { MarkBrand, MarklineDecisions, MarklineResult, MarklineState } from "../lib/types"

export const MARK_ROUNDS = 6

export const SEGMENTS = [
  { id: "explorers", name: "Explorers", performance: 8.5, convenience: 4.2, priceSens: 0.35, size: 2200 },
  { id: "followers", name: "Followers", performance: 6.2, convenience: 6.4, priceSens: 0.55, size: 3100 },
  { id: "conservatives", name: "Conservatives", performance: 4.4, convenience: 7.8, priceSens: 0.7, size: 2600 },
  { id: "specialists", name: "Specialists", performance: 9.2, convenience: 3.1, priceSens: 0.25, size: 1400 },
] as const

export type SegId = (typeof SEGMENTS)[number]["id"]

function brand(p: Partial<MarkBrand> & Pick<MarkBrand, "name">): MarkBrand {
  return {
    performance: 5,
    convenience: 5,
    price: 280,
    awareness: { explorers: 0.25, followers: 0.3, conservatives: 0.28, specialists: 0.2 },
    distribution: 0.4,
    active: true,
    ...p,
  }
}

export function defaultMarkline(kind: "human" | "lumen" | "arc"): MarklineState {
  if (kind === "lumen") {
    return {
      cash: 8_500_000,
      researchUnlocked: true,
      brands: [
        brand({
          name: "Lumen One",
          performance: 7.4,
          convenience: 4.8,
          price: 340,
          awareness: { explorers: 0.55, followers: 0.4, conservatives: 0.22, specialists: 0.48 },
          distribution: 0.55,
        }),
        brand({ name: "Lumen Go", active: false, performance: 5, convenience: 6.5, price: 220 }),
      ],
    }
  }
  if (kind === "arc") {
    return {
      cash: 7_200_000,
      researchUnlocked: false,
      brands: [
        brand({
          name: "Arc Home",
          performance: 4.8,
          convenience: 7.2,
          price: 210,
          awareness: { explorers: 0.18, followers: 0.45, conservatives: 0.6, specialists: 0.12 },
          distribution: 0.62,
        }),
        brand({ name: "Arc Pro", active: false, performance: 8, convenience: 4, price: 380 }),
      ],
    }
  }
  return {
    cash: 9_000_000,
    researchUnlocked: false,
    brands: [
      brand({
        name: "House",
        performance: 6,
        convenience: 5.5,
        price: 260,
        awareness: { explorers: 0.32, followers: 0.34, conservatives: 0.3, specialists: 0.22 },
        distribution: 0.42,
      }),
      brand({ name: "House 2", active: false, performance: 7, convenience: 4.5, price: 320 }),
    ],
  }
}

export function holdMarkline(state: MarklineState): MarklineDecisions {
  return {
    launchSecond: state.brands[1].active,
    buyResearch: false,
    brands: [
      {
        performance: state.brands[0].performance,
        convenience: state.brands[0].convenience,
        price: state.brands[0].price,
        ad: { explorers: 400, followers: 400, conservatives: 300, specialists: 200 },
        sales: 900,
      },
      {
        performance: state.brands[1].performance,
        convenience: state.brands[1].convenience,
        price: state.brands[1].price,
        ad: { explorers: 200, followers: 200, conservatives: 200, specialists: 200 },
        sales: 400,
      },
    ],
  }
}

export function npcMarkline(kind: "lumen" | "arc", state: MarklineState, period: number): MarklineDecisions {
  const d = holdMarkline(state)
  if (kind === "lumen") {
    d.brands[0].performance = clamp(7.4 + period * 0.25, 4, 10)
    d.brands[0].price = 330 + period * 8
    d.brands[0].ad.explorers = 900
    d.brands[0].ad.specialists = 700
    if (period >= 2) {
      d.launchSecond = true
      d.brands[1].convenience = 6.8
      d.brands[1].performance = 5.4
      d.brands[1].price = 230
      d.brands[1].ad.followers = 600
    }
  } else {
    d.brands[0].convenience = clamp(7.2 + period * 0.15, 3, 10)
    d.brands[0].price = 205 - period * 4
    d.brands[0].ad.conservatives = 800
    d.brands[0].ad.followers = 600
    if (period >= 3) {
      d.launchSecond = true
      d.brands[1].performance = 8.4
      d.brands[1].price = 390
      d.brands[1].ad.specialists = 500
    }
  }
  return d
}

function pref(brand: MarkBrand, seg: (typeof SEGMENTS)[number]): number {
  if (!brand.active) return 0
  const dist =
    ((brand.performance - seg.performance) / 3.2) ** 2 + ((brand.convenience - seg.convenience) / 3.2) ** 2
  const fit = Math.exp(-dist)
  const price = Math.exp(-seg.priceSens * (brand.price / 260 - 1) * 2.2)
  const aw = 0.15 + 0.85 * clamp(brand.awareness[seg.id] ?? 0.2, 0, 1)
  const distro = 0.2 + 0.8 * clamp(brand.distribution, 0, 1)
  return fit * price * aw * distro
}

export function runMarklinePeriod(
  entries: { id: string; state: MarklineState; decisions: MarklineDecisions }[],
  period: number,
): { id: string; state: MarklineState; result: MarklineResult }[] {
  const rand = mulberry32(44 + period * 19)
  const growth = [1, 1.04, 1.02, 0.97, 1.06, 1.03][period] ?? 1

  const prepared = entries.map((e) => {
    const brands: [MarkBrand, MarkBrand] = [
      { ...e.state.brands[0] },
      { ...e.state.brands[1] },
    ]
    const d = e.decisions
    for (let i = 0; i < 2; i++) {
      const dec = d.brands[i]
      const active = i === 0 || d.launchSecond || e.state.brands[1].active
      brands[i] = {
        ...brands[i],
        active,
        performance: clamp(dec.performance, 1, 10),
        convenience: clamp(dec.convenience, 1, 10),
        price: clamp(dec.price, 80, 600),
      }
    }
    return { ...e, brands }
  })

  const allBrands = prepared.flatMap((p) =>
    p.brands.map((b, i) => ({ key: `${p.id}:${i}`, brand: b })),
  )

  const share: Record<string, Record<string, number>> = {}
  const segmentSizes: Record<string, number> = {}

  for (const seg of SEGMENTS) {
    const scored = allBrands.map((b) => ({ key: b.key, score: pref(b.brand, seg) }))
    const tot = scored.reduce((s, x) => s + x.score, 0) + 0.15
    segmentSizes[seg.id] = Math.round(seg.size * growth * (0.97 + rand() * 0.06))
    for (const row of scored) {
      share[row.key] ??= {}
      share[row.key][seg.id] = row.score / tot
    }
  }

  return prepared.map((row, idx) => {
    const start = entries[idx].state
    const d = row.decisions
    let cash = start.cash
    let revenue = 0
    let variable = 0
    let spend = 0
    if (d.buyResearch) {
      cash -= 420_000
      spend += 420_000
    }
    const nextBrands: [MarkBrand, MarkBrand] = [{ ...row.brands[0] }, { ...row.brands[1] }]
    const teamShare: Record<string, Record<string, number>> = {}

    for (let i = 0; i < 2; i++) {
      const b = nextBrands[i]
      if (!b.active) continue
      if (i === 1 && !start.brands[1].active) {
        cash -= 1_100_000
        spend += 1_100_000
      }
      const dec = d.brands[i]
      const unitCost = 70 + b.performance * 14 + b.convenience * 8
      let units = 0
      teamShare[b.name] = {}
      for (const seg of SEGMENTS) {
        const s = share[`${row.id}:${i}`][seg.id]
        const u = Math.round(segmentSizes[seg.id] * s)
        units += u
        teamShare[b.name][seg.id] = s
        const lift = 1 - Math.exp(-(dec.ad[seg.id] ?? 0) / 700)
        b.awareness[seg.id] = clamp((b.awareness[seg.id] ?? 0.2) * 0.84 + lift * 0.5, 0.05, 0.95)
      }
      b.distribution = clamp(b.distribution * 0.9 + (1 - Math.exp(-dec.sales / 1200)) * 0.45, 0.1, 0.95)
      revenue += units * b.price
      variable += units * unitCost
      const adSpend = Object.values(dec.ad).reduce((a, b) => a + b, 0) * 1000
      spend += adSpend + dec.sales * 1000
      const repo = Math.abs(dec.performance - start.brands[i].performance) + Math.abs(dec.convenience - start.brands[i].convenience)
      spend += repo * 180_000
    }

    const contribution = revenue - variable - spend
    cash += contribution

    const state: MarklineState = {
      cash,
      brands: nextBrands,
      researchUnlocked: start.researchUnlocked || d.buyResearch,
    }
    const result: MarklineResult = {
      period,
      share: teamShare,
      revenue,
      contribution,
      cash,
      segmentSizes,
    }
    return { id: row.id, state, result }
  })
}

export function marklineCoach(state: MarklineState, d: MarklineDecisions): string[] {
  const tips: string[] = []
  const b = d.brands[0]
  const nearest = SEGMENTS.map((s) => ({
    s,
    dist: (b.performance - s.performance) ** 2 + (b.convenience - s.convenience) ** 2,
  })).sort((a, c) => a.dist - c.dist)[0]
  tips.push(`House is closest to ${nearest.s.name}. Advertising into the other three is mostly manners.`)
  if (d.launchSecond) {
    const b2 = d.brands[1]
    const overlap =
      (b.performance - b2.performance) ** 2 + (b.convenience - b2.convenience) ** 2
    if (overlap < 4) tips.push("Your two brands are standing on the same tile. You are paying twice to fight yourself.")
  }
  if (!state.researchUnlocked) tips.push("You are positioning from last period’s rumor. The research is expensive. Flying blind is more expensive.")
  if (b.price > 400) tips.push("A prestige price needs Explorers or Specialists to actually see you.")
  return tips.slice(0, 3)
}

export function isMarklineState(x: unknown): x is MarklineState {
  return Boolean(x && typeof x === "object" && "brands" in x && "researchUnlocked" in x)
}

export function isMarklineResult(x: unknown): x is MarklineResult {
  return Boolean(x && typeof x === "object" && "segmentSizes" in x && "contribution" in x)
}

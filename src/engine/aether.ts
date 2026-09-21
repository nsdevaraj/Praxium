import { clamp, mulberry32 } from "../lib/format"
import type {
  AetherDecisions,
  AetherState,
  AetherYearResult,
  Product,
  Scorecard,
  Segment,
  Team,
} from "../lib/types"

export const SEGMENTS: Segment[] = ["value", "prestige"]

export const AETHER_ROUNDS = 8

const IDEAL = {
  value: {
    price: [24, 23.5, 23, 22.4, 21.8, 21.2, 20.6, 20],
    performance: [5.5, 6, 6.6, 7.2, 7.9, 8.5, 9.1, 9.8],
    size: [15, 14.7, 14.4, 14.1, 13.8, 13.5, 13.2, 12.9],
    reliability: [12, 12.4, 12.8, 13.2, 13.7, 14.1, 14.6, 15],
  },
  prestige: {
    price: [36, 36.4, 37, 37.6, 38.2, 38.8, 39.4, 40],
    performance: [11.5, 12.1, 12.8, 13.5, 14.2, 15, 15.8, 16.6],
    size: [9, 8.8, 8.6, 8.4, 8.2, 8, 7.8, 7.6],
    reliability: [11, 11.4, 11.8, 12.3, 12.8, 13.3, 13.8, 14.4],
  },
}

const BASE_DEMAND = {
  value: [7200, 7600, 8000, 8400, 8900, 8200, 9600, 10200],
  prestige: [2800, 3000, 3300, 3600, 3900, 3400, 4300, 4700],
}

const ECONOMY = [1, 1.03, 0.97, 1.05, 1.02, 0.91, 1.07, 1.04]

function product(p: Partial<Product> & Pick<Product, "performance" | "size" | "reliability" | "price">): Product {
  return {
    awareness: 0.4,
    accessibility: 0.45,
    ...p,
  }
}

export function defaultAetherState(kind: "human" | "helios" | "vesper" | "northline"): AetherState {
  const base: AetherState = {
    cash: 12_000_000,
    debt: 8_000_000,
    shares: 2_000_000,
    stockPrice: 28,
    retained: 14_000_000,
    capacity: { value: 2200, prestige: 1400 },
    nextCapacity: { value: 2200, prestige: 1400 },
    automation: { value: 4, prestige: 5 },
    inventory: { value: 180, prestige: 90 },
    products: {
      value: product({ performance: 6, size: 14, reliability: 12, price: 24, awareness: 0.42, accessibility: 0.48 }),
      prestige: product({ performance: 11.5, size: 9, reliability: 11, price: 36, awareness: 0.38, accessibility: 0.4 }),
    },
    pipeline: {
      value: { performance: 6, size: 14, reliability: 12 },
      prestige: { performance: 11.5, size: 9, reliability: 11 },
    },
    employees: 420,
    morale: 72,
  }
  if (kind === "helios") {
    base.automation = { value: 7, prestige: 5 }
    base.capacity = { value: 2800, prestige: 900 }
    base.nextCapacity = { ...base.capacity }
    base.products.value.price = 21.5
    base.products.value.performance = 5.4
    base.cash = 9_000_000
    base.stockPrice = 24
  }
  if (kind === "vesper") {
    base.products.prestige = product({
      performance: 13,
      size: 8.4,
      reliability: 12.5,
      price: 39,
      awareness: 0.55,
      accessibility: 0.5,
    })
    base.pipeline.prestige = { performance: 13, size: 8.4, reliability: 12.5 }
    base.capacity = { value: 1400, prestige: 1800 }
    base.nextCapacity = { ...base.capacity }
    base.cash = 11_000_000
    base.stockPrice = 31
  }
  if (kind === "northline") {
    base.products.value.price = 23.5
    base.products.prestige.price = 35
    base.stockPrice = 26
  }
  return base
}

export function holdDecisions(state: AetherState): AetherDecisions {
  return {
    rAndD: {
      value: { ...state.pipeline.value },
      prestige: { ...state.pipeline.prestige },
    },
    marketing: {
      value: { price: state.products.value.price, promo: 900, sales: 1100 },
      prestige: { price: state.products.prestige.price, promo: 800, sales: 900 },
    },
    production: {
      value: {
        units: Math.round(state.capacity.value * 0.85),
        capacityDelta: 0,
        automation: state.automation.value,
      },
      prestige: {
        units: Math.round(state.capacity.prestige * 0.8),
        capacityDelta: 0,
        automation: state.automation.prestige,
      },
    },
    finance: { issueStock: 0, buyback: 0, issueDebt: 0, repayDebt: 0, dividend: 0.4 },
  }
}

export function npcAetherDecisions(kind: "helios" | "vesper" | "northline", state: AetherState, year: number): AetherDecisions {
  const d = holdDecisions(state)
  const i = Math.min(year, 7)
  if (kind === "helios") {
    d.marketing.value.price = clamp(IDEAL.value.price[i] - 2.2, 16, 28)
    d.marketing.prestige.price = clamp(IDEAL.prestige.price[i] - 3, 28, 42)
    d.rAndD.value = {
      performance: IDEAL.value.performance[i] - 0.6,
      size: IDEAL.value.size[i] + 0.4,
      reliability: IDEAL.value.reliability[i] - 0.3,
    }
    d.production.value.automation = clamp(state.automation.value + 0.4, 1, 10)
    d.production.value.units = Math.round(state.capacity.value * 0.95)
    d.production.value.capacityDelta = year % 2 === 0 ? 200 : 0
    d.marketing.value.promo = 700
    d.marketing.value.sales = 1400
    d.finance.dividend = 0.2
  }
  if (kind === "vesper") {
    d.marketing.prestige.price = clamp(IDEAL.prestige.price[i] + 1.8, 32, 48)
    d.rAndD.prestige = {
      performance: IDEAL.prestige.performance[i] + 0.8,
      size: IDEAL.prestige.size[i] - 0.3,
      reliability: IDEAL.prestige.reliability[i] + 0.4,
    }
    d.marketing.prestige.promo = 1600
    d.marketing.prestige.sales = 1300
    d.production.prestige.units = Math.round(state.capacity.prestige * 0.88)
    d.production.prestige.capacityDelta = year === 2 || year === 5 ? 250 : 0
    d.finance.dividend = 0.55
  }
  if (kind === "northline") {
    d.rAndD.value = {
      performance: IDEAL.value.performance[i] - 0.1,
      size: IDEAL.value.size[i],
      reliability: IDEAL.value.reliability[i],
    }
    d.rAndD.prestige = {
      performance: IDEAL.prestige.performance[i] - 0.2,
      size: IDEAL.prestige.size[i],
      reliability: IDEAL.prestige.reliability[i],
    }
    d.marketing.value.price = IDEAL.value.price[i]
    d.marketing.prestige.price = IDEAL.prestige.price[i] - 0.5
    d.marketing.value.promo = 1000
    d.marketing.prestige.promo = 1000
  }
  return d
}

function unitCost(p: Product, automation: number): number {
  const labor = (12 - automation) * 1.15
  const material = 3.4 + p.performance * 0.32 + p.reliability * 0.38 + (20 - p.size) * 0.12
  return labor + material
}

function attractiveness(p: Product, seg: Segment, year: number): number {
  const i = Math.min(year, 7)
  const ideal = IDEAL[seg]
  const priceFit = Math.exp(-Math.abs(p.price - ideal.price[i]) / (seg === "value" ? 6.5 : 8.5))
  const spec =
    ((p.performance - ideal.performance[i]) / 4) ** 2 +
    ((p.size - ideal.size[i]) / 4) ** 2 +
    ((p.reliability - ideal.reliability[i]) / 5) ** 2
  const specFit = Math.exp(-spec)
  const awareness = 0.12 + 0.88 * clamp(p.awareness, 0, 1)
  const access = 0.18 + 0.82 * clamp(p.accessibility, 0, 1)
  return Math.max(0.02, awareness * access * priceFit * specFit)
}

function rdCost(from: Product, to: { performance: number; size: number; reliability: number }): number {
  const delta =
    Math.abs(to.performance - from.performance) +
    Math.abs(to.size - from.size) +
    Math.abs(to.reliability - from.reliability)
  if (delta < 0.05) return 80_000
  return 120_000 + delta * 95_000
}

function scorecard(args: {
  ros: number
  profit: number
  stock: number
  startStock: number
  share: number
  survey: number
  util: number
  invTurns: number
  morale: number
  rdSpend: number
}): Scorecard {
  const financial = clamp(40 + args.ros * 180 + Math.tanh(args.profit / 4_000_000) * 18 + (args.stock / args.startStock - 1) * 20, 0, 100)
  const customer = clamp(args.share * 220 + args.survey * 0.55, 0, 100)
  const utilScore = 100 - Math.abs(args.util - 0.85) * 180
  const internal = clamp(0.6 * utilScore + 0.4 * clamp(args.invTurns * 12, 0, 100), 0, 100)
  const learning = clamp(args.morale * 0.7 + Math.min(20, args.rdSpend / 200_000), 0, 100)
  const total = 0.35 * financial + 0.25 * customer + 0.2 * internal + 0.2 * learning
  return {
    financial: Math.round(financial),
    customer: Math.round(customer),
    internal: Math.round(internal),
    learning: Math.round(learning),
    total: Math.round(total),
  }
}

export function aetherIdeals(year: number) {
  const i = Math.min(year, 7)
  return {
    value: {
      price: IDEAL.value.price[i],
      performance: IDEAL.value.performance[i],
      size: IDEAL.value.size[i],
      reliability: IDEAL.value.reliability[i],
      demand: Math.round(BASE_DEMAND.value[i] * ECONOMY[i]),
    },
    prestige: {
      price: IDEAL.prestige.price[i],
      performance: IDEAL.prestige.performance[i],
      size: IDEAL.prestige.size[i],
      reliability: IDEAL.prestige.reliability[i],
      demand: Math.round(BASE_DEMAND.prestige[i] * ECONOMY[i]),
    },
    economy: ECONOMY[i],
  }
}

export function runAetherYear(
  entries: { id: string; state: AetherState; decisions: AetherDecisions }[],
  year: number,
): { id: string; state: AetherState; result: AetherYearResult }[] {
  const rand = mulberry32(1400 + year * 97)
  const ideals = aetherIdeals(year)

  const prepared = entries.map((e) => {
    const d = e.decisions
    const products = { ...e.state.products }
    for (const seg of SEGMENTS) {
      const next = e.state.pipeline[seg]
      products[seg] = {
        ...products[seg],
        performance: next.performance,
        size: next.size,
        reliability: next.reliability,
        price: clamp(d.marketing[seg].price, 12, 55),
      }
    }
    return { ...e, products }
  })

  const scores: Record<Segment, { id: string; score: number }[]> = { value: [], prestige: [] }
  for (const row of prepared) {
    for (const seg of SEGMENTS) {
      scores[seg].push({ id: row.id, score: attractiveness(row.products[seg], seg, year) })
    }
  }

  const totals: Record<Segment, number> = {
    value: scores.value.reduce((s, x) => s + x.score, 0),
    prestige: scores.prestige.reduce((s, x) => s + x.score, 0),
  }

  return prepared.map((row, idx) => {
    const start = entries[idx].state
    const d = row.decisions
    let cash = start.cash
    let debt = start.debt
    let shares = start.shares
    let emergency = 0
    let rd = 0
    let sga = 0
    let cogs = 0
    let revenue = 0
    let depreciation = 0

    const salesUnits: Record<Segment, number> = { value: 0, prestige: 0 }
    const demandGot: Record<Segment, number> = { value: 0, prestige: 0 }
    const stockout: Record<Segment, number> = { value: 0, prestige: 0 }
    const endingInventory: Record<Segment, number> = { value: 0, prestige: 0 }
    const marketShare: Record<Segment, number> = { value: 0, prestige: 0 }
    const customerSurvey: Record<Segment, number> = { value: 0, prestige: 0 }
    const utilization: Record<Segment, number> = { value: 0, prestige: 0 }
    const unitCosts: Record<Segment, number> = { value: 0, prestige: 0 }
    const nextProducts = { ...row.products }
    const nextAuto = { ...start.automation }
    const nextCap = { ...start.nextCapacity }

    for (const seg of SEGMENTS) {
      const share = scores[seg].find((s) => s.id === row.id)!.score / Math.max(0.0001, totals[seg])
      marketShare[seg] = share
      const demand = Math.round(ideals[seg].demand * share * (0.97 + rand() * 0.06))
      demandGot[seg] = demand
      const produced = Math.min(d.production[seg].units, start.capacity[seg])
      utilization[seg] = produced / Math.max(1, start.capacity[seg])
      const available = start.inventory[seg] + produced
      const sold = Math.min(available, demand)
      salesUnits[seg] = sold
      stockout[seg] = Math.max(0, demand - sold)
      endingInventory[seg] = available - sold

      const p = row.products[seg]
      const uc = unitCost(p, start.automation[seg])
      unitCosts[seg] = uc
      revenue += sold * p.price * 1000
      cogs += sold * uc * 1000
      cogs += endingInventory[seg] * uc * 1000 * 0.12

      rd += rdCost(start.products[seg], d.rAndD[seg])
      sga += (d.marketing[seg].promo + d.marketing[seg].sales) * 1000

      const decayA = 0.88
      const decayX = 0.9
      nextProducts[seg] = {
        ...p,
        awareness: clamp(1 - (1 - p.awareness * decayA) * Math.exp(-d.marketing[seg].promo / 2200), 0.05, 0.98),
        accessibility: clamp(1 - (1 - p.accessibility * decayX) * Math.exp(-d.marketing[seg].sales / 2400), 0.08, 0.98),
      }
      if (stockout[seg] > demand * 0.15) nextProducts[seg].awareness *= 0.92

      const survey =
        55 +
        attractiveness(nextProducts[seg], seg, year) * 28 +
        (1 - Math.abs(p.price - ideals[seg].price) / 10) * 12 -
        (stockout[seg] > 0 ? 8 : 0)
      customerSurvey[seg] = clamp(survey, 20, 98)

      const autoTarget = clamp(d.production[seg].automation, 1, 10)
      const autoDelta = autoTarget - start.automation[seg]
      nextAuto[seg] = start.automation[seg] + clamp(autoDelta, -1.5, 1.5)
      cash -= Math.abs(autoDelta) * 1_200_000
      depreciation += start.capacity[seg] * 180 + nextAuto[seg] * 80_000

      const capDelta = clamp(d.production[seg].capacityDelta, -800, 1200)
      cash -= Math.max(0, capDelta) * 6_200
      nextCap[seg] = Math.max(400, start.capacity[seg] + capDelta)

      cash -= produced * uc * 1000
      cash += sold * p.price * 1000
    }

    cash -= rd + sga + depreciation

    const stockIssue = Math.max(0, d.finance.issueStock)
    const buyback = Math.max(0, d.finance.buyback)
    const issueDebt = Math.max(0, d.finance.issueDebt)
    const repay = Math.max(0, d.finance.repayDebt)
    shares += stockIssue
    cash += stockIssue * start.stockPrice * 0.95
    const actualBuy = Math.min(buyback, Math.max(0, shares - 800_000))
    shares -= actualBuy
    cash -= actualBuy * start.stockPrice * 1.05
    debt += issueDebt
    cash += issueDebt
    const actualRepay = Math.min(repay, debt)
    debt -= actualRepay
    cash -= actualRepay

    const interest = debt * 0.075
    cash -= interest
    const ebit = revenue - cogs - rd - sga - depreciation - interest
    const tax = Math.max(0, ebit) * 0.21
    cash -= tax
    let net = ebit - tax

    const dividend = clamp(d.finance.dividend, 0, 2.5) * shares
    if (cash - dividend < 0) {
      emergency = Math.abs(cash - dividend) + 250_000
      debt += emergency
      cash += emergency
      net -= emergency * 0.04
    }
    cash -= dividend

    const overtime = SEGMENTS.some((seg) => utilization[seg] > 0.95)
    const idle = SEGMENTS.every((seg) => utilization[seg] < 0.55)
    let morale = start.morale + (net > 0 ? 2 : -4) + (overtime ? -5 : 1) + (idle ? -3 : 0)
    morale = clamp(morale, 35, 95)

    const book = cash - debt + 18_000_000
    const eps = net / Math.max(1, shares)
    const stockPrice = clamp(
      start.stockPrice * 0.55 + (book / shares) * 0.25 + eps * 9 + (emergency > 0 ? -4 : 1.2),
      6,
      90,
    )

    const shareAvg = (marketShare.value + marketShare.prestige) / 2
    const surveyAvg = (customerSurvey.value + customerSurvey.prestige) / 2
    const utilAvg = (utilization.value + utilization.prestige) / 2
    const inv = endingInventory.value + endingInventory.prestige
    const sold = salesUnits.value + salesUnits.prestige
    const sc = scorecard({
      ros: revenue > 0 ? net / revenue : 0,
      profit: net,
      stock: stockPrice,
      startStock: start.stockPrice,
      share: shareAvg,
      survey: surveyAvg,
      util: utilAvg,
      invTurns: inv > 0 ? sold / inv : 4,
      morale,
      rdSpend: rd,
    })

    const state: AetherState = {
      cash,
      debt,
      shares,
      stockPrice,
      retained: start.retained + net - dividend,
      capacity: { ...start.nextCapacity },
      nextCapacity: nextCap,
      automation: nextAuto,
      inventory: endingInventory,
      products: nextProducts,
      pipeline: {
        value: { ...d.rAndD.value },
        prestige: { ...d.rAndD.prestige },
      },
      employees: Math.round(start.employees * (0.98 + utilAvg * 0.06)),
      morale,
    }

    const result: AetherYearResult = {
      year,
      salesUnits,
      demand: demandGot,
      revenue,
      cogs,
      rd,
      sga,
      depreciation,
      interest,
      ebit,
      tax,
      netIncome: net,
      marketShare,
      stockPrice,
      emergencyLoan: emergency,
      stockout,
      endingInventory,
      customerSurvey,
      utilization,
      unitCost: unitCosts,
      scorecard: sc,
      cash,
    }
    return { id: row.id, state, result }
  })
}

export function aetherCoach(state: AetherState, d: AetherDecisions, year: number): string[] {
  const tips: string[] = []
  const ideals = aetherIdeals(year)
  for (const seg of SEGMENTS) {
    const priceGap = d.marketing[seg].price - ideals[seg].price
    if (Math.abs(priceGap) > 3) {
      tips.push(
        `${seg === "value" ? "Value" : "Prestige"} is priced ${priceGap > 0 ? "above" : "below"} the segment ideal (${ideals[seg].price.toFixed(1)}k). Expect share to move.`,
      )
    }
    const util = d.production[seg].units / Math.max(1, state.capacity[seg])
    if (util > 1) tips.push(`${seg} production exceeds current capacity. The plant will cap you.`)
    if (util < 0.6) tips.push(`${seg} is scheduled well below capacity. Depreciation does not care.`)
    const inv = state.inventory[seg]
    if (inv > state.capacity[seg] * 0.35) tips.push(`${seg} inventory is heavy. You are paying to store last year's miss.`)
  }
  if (state.cash < 3_000_000) tips.push("Cash is thin. An emergency loan will punish the stock.")
  if (d.finance.dividend > 1.2 && state.cash < 8_000_000) tips.push("That dividend is a statement. Make sure it is the one you want the street to hear.")
  const rdMove =
    Math.abs(d.rAndD.value.performance - state.products.value.performance) +
    Math.abs(d.rAndD.prestige.performance - state.products.prestige.performance)
  if (rdMove > 3) tips.push("R&D is leaping. Specs land next year — the market you are designing for is the one after this.")
  if (tips.length === 0) tips.push("The books look composed. Watch Helios on Value price and Vesper on Prestige awareness.")
  return tips.slice(0, 4)
}

export function isAetherState(x: unknown): x is AetherState {
  return Boolean(x && typeof x === "object" && "products" in x && "automation" in x)
}

export function isAetherResult(x: unknown): x is AetherYearResult {
  return Boolean(x && typeof x === "object" && "marketShare" in x && "scorecard" in x)
}

export function aetherFromTeam(team: Team): AetherState {
  if (!isAetherState(team.state)) throw new Error("Team is not on Aether")
  return team.state
}

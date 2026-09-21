import { mulberry32 } from "../lib/format"
import type { HarborDecisions, HarborResult, HarborState } from "../lib/types"

export const HARBOR_ROUNDS = 12

const SEASON = [0.92, 0.88, 0.95, 1.02, 1.08, 1.14, 1.48, 1.22, 1.05, 0.96, 1.1, 1.18]
const BASE = 820

export function defaultHarborState(): HarborState {
  return {
    cash: 4_200_000,
    finished: 900,
    wip: 700,
    inboundLocal: 0,
    inboundImport: [600, 500],
    lastDemand: 820,
    lastOrder: 700,
    fillRate: 1,
    holdingCost: 0,
    stockoutCost: 0,
    purchaseCost: 0,
    expediteCost: 0,
    serviceLevel: 1,
    bullwhip: 1,
    orderHistory: [700],
    demandHistory: [820],
  }
}

export function holdHarbor(state: HarborState): HarborDecisions {
  return {
    forecast: Math.round(state.lastDemand * 1.02),
    produce: Math.round(state.wip),
    importOrder: 550,
    localOrder: 0,
    expedite: false,
  }
}

export function monthDemand(month: number): { demand: number; note: string } {
  const rand = mulberry32(900 + month * 13)
  const noise = 0.92 + rand() * 0.16
  const demand = Math.round(BASE * SEASON[month] * noise)
  const note =
    month === 6
      ? "A coastal storm closed two competing ports. Demand spiked. This was the shock."
      : month === 5
        ? "Buyers are building inventory ahead of summer. The signal is real, and it is also a trap."
        : SEASON[month] > 1.1
          ? "High season. Service failures will be remembered."
          : "Quiet freight. A good month to rebuild the buffer — or to get greedy."
  return { demand, note }
}

export function runHarborMonth(state: HarborState, d: HarborDecisions, month: number): { state: HarborState; result: HarborResult } {
  const { demand, note } = monthDemand(month)
  const produce = Math.max(0, Math.round(d.produce))
  const produced = Math.min(produce, state.wip)
  const importArriving = state.inboundImport[0] ?? 0
  const localArriving = state.inboundLocal
  const received = importArriving + localArriving
  let finished = state.finished + produced + received

  const unitHold = 38
  const unitMiss = 220
  const unitImport = 92
  const unitLocal = 148
  const unitProduce = 70
  const expediteFee = d.expedite ? 180_000 : 0

  if (d.expedite) finished += 280

  const sold = Math.min(finished, demand)
  const missed = demand - sold
  finished -= sold

  const importOrder = Math.max(0, Math.round(d.importOrder))
  const localOrder = Math.max(0, Math.round(d.localOrder))
  const nextImport = [...state.inboundImport.slice(1), importOrder]
  while (nextImport.length < 2) nextImport.push(0)

  const purchase = importOrder * unitImport + localOrder * unitLocal + produced * unitProduce
  const hold = finished * unitHold
  const stockout = missed * unitMiss
  const totalCost = purchase + hold + stockout + expediteFee
  const cash = state.cash + sold * 210 - totalCost

  const orderHistory = [...state.orderHistory, importOrder + localOrder + produce].slice(-8)
  const demandHistory = [...state.demandHistory, demand].slice(-8)
  const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
  const variance = (xs: number[]) => {
    const m = avg(xs)
    return avg(xs.map((x) => (x - m) ** 2))
  }
  const bullwhip = variance(demandHistory) < 1 ? 1 : variance(orderHistory) / Math.max(1, variance(demandHistory))
  const fill = sold / Math.max(1, demand)
  const service = state.serviceLevel * 0.7 + fill * 0.3

  const next: HarborState = {
    cash,
    finished,
    wip: Math.max(0, state.wip - produced) + Math.round(d.forecast * 0.15),
    inboundLocal: localOrder,
    inboundImport: nextImport,
    lastDemand: demand,
    lastOrder: importOrder + localOrder,
    fillRate: fill,
    holdingCost: state.holdingCost + hold,
    stockoutCost: state.stockoutCost + stockout,
    purchaseCost: state.purchaseCost + purchase,
    expediteCost: state.expediteCost + expediteFee,
    serviceLevel: service,
    bullwhip,
    orderHistory,
    demandHistory,
  }

  return {
    state: next,
    result: {
      month,
      demand,
      sold,
      missed,
      produced,
      received,
      endingInventory: finished,
      cash,
      totalCost,
      fillRate: fill,
      note,
    },
  }
}

export function harborCoach(state: HarborState, d: HarborDecisions, month: number): string[] {
  const tips: string[] = []
  if (state.finished < state.lastDemand * 0.4) tips.push("Finished goods are thin relative to last month's demand.")
  if (state.finished > 1600) tips.push("You are running a warehouse, not a port. Holding cost is eating contribution.")
  if (d.localOrder > 200) tips.push("Local spot buys close gaps. They also train the plant to miss.")
  if (d.expedite) tips.push("Expedite is a confession. Use it as a last resort, then change the forecast.")
  if (month === 5) tips.push("Next month is the one people remember in the debrief. Look at inbound, not at last week's quiet.")
  if (state.bullwhip > 3) tips.push(`Bullwhip is ${state.bullwhip.toFixed(1)}×. You are amplifying the market.`)
  if (tips.length === 0) tips.push("Buffer looks adult. Keep the import pipeline smooth through the seasonal rise.")
  return tips.slice(0, 3)
}

export function isHarborState(x: unknown): x is HarborState {
  return Boolean(x && typeof x === "object" && "inboundImport" in x && "finished" in x)
}

export function isHarborResult(x: unknown): x is HarborResult {
  return Boolean(x && typeof x === "object" && "fillRate" in x && "demand" in x && "month" in x)
}

export type Role = "instructor" | "participant"
export type SimId = "aether" | "harborline" | "northwind" | "markline"
export type SessionMode = "solo" | "cohort"
export type SessionStatus = "lobby" | "playing" | "debrief" | "complete"
export type Segment = "value" | "prestige"

export interface User {
  id: string
  name: string
  role: Role
}

export interface CatalogSim {
  id: string
  engine: SimId
  name: string
  studio: string
  tagline: string
  duration: string
  players: string
  level: string
  topics: string[]
  bestFor: string
  rounds: number
  roundLabel: string
  analog: string
  competitive: boolean
  overview: string
  learning: string[]
  debriefPrompt: string
}

export interface Member {
  id: string
  name: string
}

export interface Team {
  id: string
  name: string
  color: string
  isNpc: boolean
  members: Member[]
  submitted: boolean
  decisions: unknown | null
  state: unknown
  history: unknown[]
}

export interface Broadcast {
  id: string
  at: number
  text: string
}

export interface Session {
  id: string
  code: string
  name: string
  simId: SimId
  catalogId: string
  instructorName: string
  mode: SessionMode
  status: SessionStatus
  round: number
  totalRounds: number
  teams: Team[]
  broadcasts: Broadcast[]
  createdAt: number
  notes: string
}

export interface Scorecard {
  financial: number
  customer: number
  internal: number
  learning: number
  total: number
}

export interface Product {
  performance: number
  size: number
  reliability: number
  price: number
  awareness: number
  accessibility: number
}

export interface AetherState {
  cash: number
  debt: number
  shares: number
  stockPrice: number
  retained: number
  capacity: Record<Segment, number>
  nextCapacity: Record<Segment, number>
  automation: Record<Segment, number>
  inventory: Record<Segment, number>
  products: Record<Segment, Product>
  pipeline: Record<Segment, Pick<Product, "performance" | "size" | "reliability">>
  employees: number
  morale: number
}

export interface AetherDecisions {
  rAndD: Record<Segment, { performance: number; size: number; reliability: number }>
  marketing: Record<Segment, { price: number; promo: number; sales: number }>
  production: Record<Segment, { units: number; capacityDelta: number; automation: number }>
  finance: {
    issueStock: number
    buyback: number
    issueDebt: number
    repayDebt: number
    dividend: number
  }
}

export interface AetherYearResult {
  year: number
  salesUnits: Record<Segment, number>
  demand: Record<Segment, number>
  revenue: number
  cogs: number
  rd: number
  sga: number
  depreciation: number
  interest: number
  ebit: number
  tax: number
  netIncome: number
  marketShare: Record<Segment, number>
  stockPrice: number
  emergencyLoan: number
  stockout: Record<Segment, number>
  endingInventory: Record<Segment, number>
  customerSurvey: Record<Segment, number>
  utilization: Record<Segment, number>
  unitCost: Record<Segment, number>
  scorecard: Scorecard
  cash: number
}

export interface HarborState {
  cash: number
  finished: number
  wip: number
  inboundLocal: number
  inboundImport: number[]
  lastDemand: number
  lastOrder: number
  fillRate: number
  holdingCost: number
  stockoutCost: number
  purchaseCost: number
  expediteCost: number
  serviceLevel: number
  bullwhip: number
  orderHistory: number[]
  demandHistory: number[]
}

export interface HarborDecisions {
  forecast: number
  produce: number
  importOrder: number
  localOrder: number
  expedite: boolean
}

export interface HarborResult {
  month: number
  demand: number
  sold: number
  missed: number
  produced: number
  received: number
  endingInventory: number
  cash: number
  totalCost: number
  fillRate: number
  note: string
}

export interface NorthwindState {
  chapter: number
  storeBuyIn: number
  boardConfidence: number
  digitalCapability: number
  attrition: number
  nps: number
  cashMonths: number
  marcusTrust: number
  priyaRoom: number
  log: { chapter: number; choiceId: string; title: string; consequence: string }[]
  ended: boolean
  ending?: string
}

export interface MarkBrand {
  name: string
  performance: number
  convenience: number
  price: number
  awareness: Record<string, number>
  distribution: number
  active: boolean
}

export interface MarklineState {
  cash: number
  brands: [MarkBrand, MarkBrand]
  researchUnlocked: boolean
}

export interface MarklineDecisions {
  brands: [
    { performance: number; convenience: number; price: number; ad: Record<string, number>; sales: number },
    { performance: number; convenience: number; price: number; ad: Record<string, number>; sales: number },
  ]
  launchSecond: boolean
  buyResearch: boolean
}

export interface MarklineResult {
  period: number
  share: Record<string, Record<string, number>>
  revenue: number
  contribution: number
  cash: number
  segmentSizes: Record<string, number>
}

import { clamp } from "../lib/format"
import type { NorthwindState } from "../lib/types"

export const NORTHWIND_ROUNDS = 6

export interface NorthwindChoice {
  id: string
  label: string
  body: string
  effects: Partial<Omit<NorthwindState, "log" | "ended" | "ending" | "chapter">>
  consequence: string
}

export interface NorthwindChapter {
  id: number
  title: string
  kicker: string
  body: string
  voice?: { who: string; line: string }
  choices: NorthwindChoice[]
}

export const NORTHWIND: NorthwindChapter[] = [
  {
    id: 0,
    title: "The first 90 days",
    kicker: "Week 1",
    body: "Elena Voss, CEO, gives you an office that still has the last COO’s nameplate in the drawer. Same-store sales are flat for five quarters. A $40M “digital store of the future” program produced two flagship remodels that the other 178 stores treat as a corporate hobby. A national discounter has permits for 12 sites in your footprint. Elena wants a board pack in six weeks. Marcus Chen, SVP Stores, has already booked your first week with store walks — or you can cancel them and sit with Priya Nair, the CDO hired eight months ago and left without a mandate.",
    voice: {
      who: "Elena Voss, CEO",
      line: "I did not hire you to make friends in Dayton. I hired you because the last person did.",
    },
    choices: [
      {
        id: "listen",
        label: "Walk the stores with Marcus",
        body: "Three states, eleven stores, night crews included. You take notes. You do not announce a program.",
        effects: { storeBuyIn: 12, marcusTrust: 14, boardConfidence: -4, digitalCapability: 0, priyaRoom: -6 },
        consequence: "Store managers start returning your calls. The board asks why there is no slide yet.",
      },
      {
        id: "mandate",
        label: "Issue a transformation memo week one",
        body: "A single operating model, a date, a steering committee you chair. Priya’s team is thrilled. The field is not.",
        effects: { storeBuyIn: -10, marcusTrust: -12, boardConfidence: 8, digitalCapability: 6, priyaRoom: 10, attrition: 6 },
        consequence: "You look decisive in the building that files the 8-K. You look like the last person in the building that sells milk.",
      },
      {
        id: "hybrid",
        label: "Listen in public, decide in 21 days",
        body: "You walk six stores with Marcus, sit with Priya’s architects, and put a date on a decision forum. You ask Tom Hale for a clean P&L of the failed program.",
        effects: { storeBuyIn: 6, marcusTrust: 6, boardConfidence: 3, digitalCapability: 3, priyaRoom: 4, cashMonths: -0.3 },
        consequence: "You spend political capital on process. People wait to see if the date is real.",
      },
    ],
  },
  {
    id: 1,
    title: "The coalition",
    kicker: "Week 2",
    body: "You need a steering group that can survive contact with Tuesday afternoon in a store. Marcus expects to chair anything that touches labor. Priya expects to own anything that touches software. Tom Hale wants a cost-out workstream or he will brief the board himself. Jamila Brooks, a Dayton store manager, ran a curbside program on a spreadsheet that actually works — and has never been in the headquarters cafeteria.",
    voice: {
      who: "Marcus Chen, SVP Stores",
      line: "If this is another committee that tells my people how to bag groceries, I will not sell it for you.",
    },
    choices: [
      {
        id: "old-guard",
        label: "Marcus chairs. Priya presents. Jamila is ‘input.’",
        body: "You keep the unofficial mayor close. Digital is a workstream, not a vote.",
        effects: { marcusTrust: 10, storeBuyIn: 8, priyaRoom: -10, digitalCapability: -4, boardConfidence: 2 },
        consequence: "The field relaxes. Priya’s best engineer updates her LinkedIn.",
      },
      {
        id: "digital-lead",
        label: "Priya chairs. Marcus is vice-chair. You back her in the room.",
        body: "You signal that the failed program failed from neglect, not from software.",
        effects: { priyaRoom: 12, digitalCapability: 10, marcusTrust: -8, storeBuyIn: -6, boardConfidence: 4, attrition: 4 },
        consequence: "A real architect is in the chair. The stores hear a rumor that ops has been captured.",
      },
      {
        id: "triangle",
        label: "You chair. Marcus, Priya, and Jamila all vote.",
        body: "Odd number, mixed altitude, one store manager who will say the quiet part.",
        effects: { marcusTrust: 4, priyaRoom: 6, storeBuyIn: 7, digitalCapability: 5, boardConfidence: 1, cashMonths: -0.2 },
        consequence: "Meetings get slower and more honest. Jamila becomes a symbol, which is useful until it is a burden.",
      },
    ],
  },
  {
    id: 2,
    title: "The burning platform",
    kicker: "Week 3",
    body: "Internal comms wants a narrative. Legal wants nothing that admits the last program failed. Tom has a one-pager: close 14 weak stores, freeze hiring, outsource e-commerce. Priya has a different one-pager: a shared inventory graph and a single last-mile promise. The discounter’s first three leases leak to the local paper.",
    voice: {
      who: "Tom Hale, CFO",
      line: "We can afford a story or we can afford a runway. I know which one the board can count.",
    },
    choices: [
      {
        id: "fear",
        label: "Name the discounter. Show the 12 dots on a map.",
        body: "A town hall, a map, a sentence: we have eighteen months of relevance if we do not change how a store makes money after 4 p.m.",
        effects: { storeBuyIn: 8, boardConfidence: 6, attrition: 7, nps: -2, marcusTrust: -3 },
        consequence: "Urgency arrives. So does rumor. Two strong store managers take recruiter calls.",
      },
      {
        id: "pride",
        label: "Lead with Jamila’s curbside. Make it the Northwind way.",
        body: "You film Dayton. You do not mention the discounter in the all-hands. You talk about a grocery chain that already knows its neighborhoods.",
        effects: { storeBuyIn: 10, nps: 4, digitalCapability: 3, boardConfidence: -3, marcusTrust: 6 },
        consequence: "The field feels seen. Elena texts you after: ‘Charm is not a strategy.’",
      },
      {
        id: "cuts",
        label: "Tom’s plan, with a digital appendix",
        body: "Close 9 stores, freeze, and fund Priya from the savings. The story is discipline.",
        effects: { cashMonths: 2.5, boardConfidence: 10, storeBuyIn: -12, attrition: 11, nps: -6, marcusTrust: -10, digitalCapability: 4 },
        consequence: "The board exhales. The remaining stores learn that transformation is a euphemism for shrinkage.",
      },
    ],
  },
  {
    id: 3,
    title: "The pilot",
    kicker: "Week 4",
    body: "You can only do this once before the board meeting. Priya wants the two failed flagships — the wiring is already there. Marcus wants a ‘normal’ cluster of eight suburban stores, including Dayton. Tom wants a single urban store so the write-off is small if it dies. A vendor offers a turnkey app in 19 days if you sign exclusive last-mile.",
    voice: {
      who: "Jamila Brooks, Dayton store",
      line: "If you pilot in the pretty stores, my people will know what you think of them.",
    },
    choices: [
      {
        id: "flagships",
        label: "Pilot the two flagships",
        body: "Reuse the sunk cost. A clean demo for the board. The field calls it theater.",
        effects: { digitalCapability: 8, boardConfidence: 7, storeBuyIn: -8, priyaRoom: 6, cashMonths: -0.4 },
        consequence: "The demo works in a store that already had the ceiling opened. Nothing is proved about Tuesday in Dayton.",
      },
      {
        id: "dayton",
        label: "Pilot Dayton plus seven ordinary stores",
        body: "Ugly parking lots, real labor, Jamila’s spreadsheet as the seed. Slower to polish.",
        effects: { storeBuyIn: 12, marcusTrust: 8, digitalCapability: 6, boardConfidence: -2, nps: 5, cashMonths: -0.8, priyaRoom: 3 },
        consequence: "You get a noisy truth. Elena will have to sell a messy chart.",
      },
      {
        id: "vendor",
        label: "Sign the turnkey vendor",
        body: "An app with your logo in 19 days. Exclusive last-mile. Priya calls it a hostage deal.",
        effects: { digitalCapability: 4, boardConfidence: 5, priyaRoom: -12, cashMonths: -1.2, nps: 3, attrition: 3 },
        consequence: "You bought speed and sold the architecture. Priya stops bringing unsolicited ideas.",
      },
    ],
  },
  {
    id: 4,
    title: "The resistance",
    kicker: "Week 5",
    body: "Marcus circulates a memo — not to you — about ‘labor model risk’ in the pilot. Two district managers pause scheduling for the new promise. A shop steward in Columbus asks if click-and-collect is a bargaining item. Elena forwards you a board member’s email: ‘Is Chen with us?’ Priya has a private offer from a marketplace. You have 72 hours before the story hardens.",
    voice: {
      who: "Elena Voss, CEO",
      line: "I can survive a slow pilot. I cannot survive a COO who lost the stores and kept the CDO.",
    },
    choices: [
      {
        id: "confront",
        label: "Call Marcus in. Put the memo on the table.",
        body: "You ask him to walk it back, in writing, by Friday, or you will staff Stores without him.",
        effects: { marcusTrust: -16, boardConfidence: 6, storeBuyIn: -8, attrition: 8, priyaRoom: 6 },
        consequence: "The building learns you will draw blood. Some people like that. The unofficial mayor’s people do not.",
      },
      {
        id: "absorb",
        label: "Give Marcus the labor design. Keep the customer promise.",
        body: "He owns hours and roles. You own the offer to the shopper. You kill the side memo by making it a workstream.",
        effects: { marcusTrust: 8, storeBuyIn: 6, digitalCapability: -3, boardConfidence: 1, priyaRoom: -4 },
        consequence: "Resistance becomes process. It is slower. It is still alive.",
      },
      {
        id: "jamila",
        label: "Put Jamila on the all-hands with you",
        body: "A store manager tells 180 peers what changed in her parking lot. You stand slightly to the side.",
        effects: { storeBuyIn: 10, nps: 3, marcusTrust: -4, boardConfidence: 2, attrition: -2 },
        consequence: "The field hears one of its own. Marcus hears that you will go around him.",
      },
    ],
  },
  {
    id: 5,
    title: "The board pack",
    kicker: "Week 6",
    body: "The discounter’s first supercenter opens in 11 months. You have a noisy pilot, a coalition with bruises, and a CEO who will not read a 40-page appendix. Tom wants a number. Priya wants a multi-year platform. Marcus wants a freeze on anything that adds a task at the front end. You write one recommendation.",
    voice: {
      who: "Board chair, in the pre-meet",
      line: "Tell me if this is a grocery company that delivers, or a delivery company that happens to have stores. I can fund one of those.",
    },
    choices: [
      {
        id: "scale",
        label: "Scale the promise to 80 stores in 12 months",
        body: "Fund from working capital, hire a last-mile lead, keep Marcus on labor. You bet the year.",
        effects: { digitalCapability: 10, boardConfidence: 4, cashMonths: -2.2, storeBuyIn: 4, attrition: 5, nps: 6 },
        consequence: "You asked the board to be operators. Some of them came to be landlords.",
      },
      {
        id: "pause",
        label: "Hold at the pilot. Prove unit economics for two more quarters.",
        body: "Discipline. Tom smiles. Priya starts taking the marketplace call.",
        effects: { cashMonths: 1.4, boardConfidence: 6, digitalCapability: -6, priyaRoom: -8, storeBuyIn: -4, nps: -2 },
        consequence: "You kept the powder dry. The discounter does not pause with you.",
      },
      {
        id: "spin",
        label: "Spin digital into a subsidiary. Stores stay stores.",
        body: "A clean story for capital. A wound for anyone who believed this was one company.",
        effects: { boardConfidence: 8, digitalCapability: 8, storeBuyIn: -10, marcusTrust: -8, priyaRoom: 8, nps: -4, cashMonths: 0.6 },
        consequence: "Investors understand a box on a slide. Customers still think you are one name.",
      },
    ],
  },
]

export function defaultNorthwind(): NorthwindState {
  return {
    chapter: 0,
    storeBuyIn: 48,
    boardConfidence: 52,
    digitalCapability: 34,
    attrition: 18,
    nps: 22,
    cashMonths: 9.5,
    marcusTrust: 55,
    priyaRoom: 40,
    log: [],
    ended: false,
  }
}

function apply(state: NorthwindState, patch: NorthwindChoice["effects"]): NorthwindState {
  const next = { ...state }
  for (const [k, v] of Object.entries(patch)) {
    if (typeof v === "number" && k in next) {
      const key = k as keyof NorthwindState
      const current = next[key]
      if (typeof current === "number") {
        ;(next[key] as number) = current + v
      }
    }
  }
  next.storeBuyIn = clamp(next.storeBuyIn, 0, 100)
  next.boardConfidence = clamp(next.boardConfidence, 0, 100)
  next.digitalCapability = clamp(next.digitalCapability, 0, 100)
  next.attrition = clamp(next.attrition, 0, 80)
  next.nps = clamp(next.nps, -20, 70)
  next.cashMonths = clamp(next.cashMonths, 1, 18)
  next.marcusTrust = clamp(next.marcusTrust, 0, 100)
  next.priyaRoom = clamp(next.priyaRoom, 0, 100)
  return next
}

function endingFor(state: NorthwindState): { ending: string; title: string } {
  if (state.attrition > 42 && state.storeBuyIn < 40) {
    return { ending: "revolt", title: "The field leaves the building" }
  }
  if (state.boardConfidence < 35) {
    return { ending: "vote-of-no-confidence", title: "A search firm is retained" }
  }
  if (state.digitalCapability > 60 && state.storeBuyIn > 58 && state.marcusTrust > 40) {
    return { ending: "transformation", title: "A grocery company that can still be a grocery company" }
  }
  if (state.digitalCapability > 58 && state.storeBuyIn < 45) {
    return { ending: "hollow", title: "A platform nobody will staff on Saturday" }
  }
  if (state.cashMonths < 5 && state.nps < 15) {
    return { ending: "austerity", title: "The discounter writes the rest of the story" }
  }
  return { ending: "slow", title: "Still in the fight, still unfinished" }
}

export function applyNorthwindChoice(state: NorthwindState, choiceId: string): NorthwindState {
  const chapter = NORTHWIND[state.chapter]
  const choice = chapter.choices.find((c) => c.id === choiceId)
  if (!choice) return state
  let next = apply(state, choice.effects)
  next = {
    ...next,
    log: [...next.log, { chapter: state.chapter, choiceId, title: choice.label, consequence: choice.consequence }],
  }
  if (state.chapter >= NORTHWIND.length - 1) {
    const end = endingFor(next)
    next.ended = true
    next.ending = `${end.title} (${end.ending})`
    next.chapter = state.chapter
  } else {
    next.chapter = state.chapter + 1
  }
  return next
}

export function northwindCoach(state: NorthwindState): string[] {
  const tips: string[] = []
  if (state.marcusTrust < 35) tips.push("Marcus is below the line where he will sell for you. Repair or replace — do not ignore.")
  if (state.priyaRoom < 30) tips.push("Priya has stopped arguing in the room. That is not alignment. That is a résumé.")
  if (state.boardConfidence < 40) tips.push("The board is restless. They do not need more narrative. They need a number with an owner.")
  if (state.storeBuyIn < 40) tips.push("The stores will nod in the town hall and starve the pilot on the schedule.")
  if (state.attrition > 30) tips.push("Attrition is now a strategy tax. Every new task lands on fewer people.")
  if (tips.length === 0) tips.push("The coalition is still a coalition. Spend the next episode on one relationship, not on the slides.")
  return tips.slice(0, 3)
}

export function isNorthwindState(x: unknown): x is NorthwindState {
  return Boolean(x && typeof x === "object" && "marcusTrust" in x && "chapter" in x)
}

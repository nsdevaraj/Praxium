# Praxium

Praxium is a web-based business simulation studio in the spirit of Forio, Capsim, Cesim, and Markstrat. It lets a
learner drop straight into a room, make real multi-round business decisions, and see the market — including a set of
AI-driven simulated competitors — respond.

There is no facilitator gate to get in the door: opening a simulation or entering a room code always puts you in a
playable room. Every room ships with simulated competitor companies so there is always a market to compete against,
solo or in a cohort.

## What's in the catalog

Four playable simulations, each with its own decision model and a distinct business discipline:

| Simulation | Studio | What you run | Rounds |
| --- | --- | --- | --- |
| **Aether Motors** | Strategy | A two-segment EV manufacturer — R&D, pricing, production/capacity, and finance | 8 years |
| **Harborline** | Operations | A port's finished-goods node — forecasting, production, sourcing, and expedites | 12 months |
| **Markline** | Marketing | A four-segment consumer electronics portfolio — positioning, pricing, and brand launches | 6 periods |
| **Northwind** | Leadership | A branching change-management case at a grocery chain — coalition and sequencing choices | 6 episodes |

The catalog and each simulation's briefing content live in [`src/data/catalog.ts`](src/data/catalog.ts).

## How a room works

1. **Start or join.** Opening a simulation from the catalog (or entering any code on `/join`) creates or resumes a
   room and drops you straight into `/play/:code` — no facilitator setup required.
2. **Make decisions.** Each simulation has its own decision board (R&D sliders, pricing, production, case choices,
   and so on) driven by the engines in [`src/engine`](src/engine).
3. **Compete against the field.** Every room is seeded with simulated competitor companies. Their strategy is chosen
   by TypeSafe AI's Jev model (via a small dev-server proxy in [`vite.config.ts`](vite.config.ts) that keeps
   `TYPESAFE_API_KEY` server-side) and mapped onto real in-engine decisions, with a strong deterministic fallback if
   the API is unavailable.
4. **Track the leaderboard.** A live, round-by-round leaderboard shows your rank against simulated competitors as the
   simulation progresses, gamifying the run instead of hiding the score until the end.
5. **Debrief.** When the rounds run out, the room shows a performance dashboard: final rank, scorecards, a
   side-by-side comparison against the competitive field, and plain-language notes on what worked and what to fix
   next time.

## Project structure

```
src/
  App.tsx           routes: catalog, sim detail, join, play, facilitate, debrief
  store.ts          zustand store — sessions, teams, decisions, round advancement
  engine/           per-simulation rules (aether, harborline, markline, northwind)
  data/catalog.ts   simulation metadata shown in the catalog and briefing pages
  lib/typesafe.ts   client for the TypeSafe AI competitor-strategy proxy
  pages/            Landing, Catalog, SimDetail, Join, Play, Facilitate, Debrief
  components/       shared UI (Layout, Logo, Covers, form controls)
```

## Getting started

```bash
npm install
npm run dev      # start the app at http://localhost:5173
npm run build    # type-check and produce a production build
npm run lint     # oxlint
```

To let simulated competitors use TypeSafe AI's Jev model instead of the deterministic fallback strategies, set
`TYPESAFE_API_KEY` in a `.env` file at the project root before running `npm run dev` or `npm run build`. The key is
only read server-side by the Vite dev/build proxy and is never sent to the browser.

## Stack

React 19, React Router, Zustand, Tailwind CSS v4, Recharts, and Vite, with TypeScript throughout.

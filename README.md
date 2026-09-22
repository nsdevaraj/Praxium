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
   by Laya (via the optional local service in [`laya_server.py`](laya_server.py), reached through the dev-server
   proxy in [`vite.config.ts`](vite.config.ts)) and mapped onto real in-engine decisions, with a strong deterministic
   fallback if the service is unavailable.
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
  lib/laya.ts       client for the Laya competitor-strategy proxy
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

To let simulated competitors use Laya instead of the deterministic fallback strategies, install the Python
dependencies and start the local adapter in a second terminal:

```bash
python3 -m pip install -r requirements.txt
python3 laya_server.py
```

The Vite proxy sends requests to `http://127.0.0.1:8000/predict` by default. Set `LAYA_API_URL` in `.env` to
override that URL. The adapter loads Laya's model on first start and keeps it in memory.

## Deploying to Vercel

Praxium is a single-page app using React Router's `BrowserRouter`. Paths such as `/catalog`, `/facilitate`,
`/sim/aether`, and `/play/:code` are client-side routes, not separate HTML files. Without a server-side rewrite,
opening or refreshing these URLs on Vercel returns `404 NOT_FOUND` before React can load.

The root [`vercel.json`](vercel.json) configures the Vite build and rewrites client-side URLs to `/index.html`.
It excludes `/api` and `/assets` so API requests and missing build assets do not receive the app's HTML instead.

1. Set the Vercel project's **Root Directory** to the directory containing `package.json` and `vercel.json`
   (the repository root for this layout).
2. Use **Vite** as the framework, **`npm run build`** as the build command, and **`dist`** as the output directory.
   These values are also declared in `vercel.json`.
3. Include `vercel.json` in the source deployed to Vercel, then create a new production deployment. An existing
   deployment will not pick up local configuration changes.
4. Verify direct navigation and browser refresh on `/catalog`, `/facilitate`, and `/sim/aether`, as well as `/`.
   Each should load the app without a Vercel `NOT_FOUND` page.

**Laya in production:** [`api/laya.py`](api/laya.py) is deployed as a Vercel Python Function at `/api/laya`.
Vercel installs the dependency from [`requirements.txt`](requirements.txt) during deployment. The first request
may be slow while the model is downloaded, and Vercel's function-size and execution-time limits may make a
dedicated Python host (such as Cloud Run or Modal) a better choice for production traffic. If using a dedicated
host instead, set `LAYA_API_URL` in Vercel's environment settings to its HTTPS `/predict` endpoint; the Vite
proxy's local default remains `http://127.0.0.1:8000/predict`.

## Stack

React 19, React Router, Zustand, Tailwind CSS v4, Recharts, and Vite, with TypeScript throughout.

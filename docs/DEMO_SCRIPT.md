# Working demo story — presenter script

Use this verbatim or as bullet prompts. **Target length:** ~3 minutes for demo + 1 minute for architecture slide.

---

## Easiest path: one command (recommended)

From project root (network on **first** run — downloads embedded Temporal CLI):

```bash
npm install   # once
npm run present
```

This starts an **embedded dev server**, runs the **worker**, executes **one workflow**, prints **activity logs + JSON result**, then shuts down. Ideal for **projector / recording**.

*Static transcript for slides:* see [`EXAMPLE_OUTPUT.md`](EXAMPLE_OUTPUT.md).

---

## Before you go on stage (2 minutes) — multi-terminal option

| Step | Action |
|------|--------|
| 1 | Install Temporal CLI if needed: [Install CLI](https://docs.temporal.io/cli#install) |
| 2 | `temporal server start-dev` — leave running |
| 3 | In project root: `npm install` (once) |
| 4 | Terminal A: `npm run start.worker` — wait for `Worker listening on task queue: smart-fallback` |
| 5 | Zoom / font size: make terminals **readable** from the back row |
| 6 | Optional: browser tab **Temporal Web** → `http://localhost:8233` |

**Pre-run once** with `npm run start.workflow` so you know the output looks right.

---

## Slide flow (suggested)

1. **Title** — name + one line: “parallel race, first success, cancel the rest.”
2. **Problem** — serial fallback = stacked latency.
3. **Solution** — parallel + Temporal cancellation.
4. **Architecture** — `slide-architecture.svg` or `PRESENTATION.md` slide.
5. **Three APIs table** — A slow, B fails, C wins.
6. **Live demo** — switch to terminals (or split screen).
7. **Pitch slide** — one-liner + Q&A.

---

## Opening (15 seconds)

> “Most integrations do **call, wait, fail, retry, fallback**. We flipped that: **call everyone that matters in parallel**, take the **first success**, and **cancel** the stragglers. It’s **speculative execution** for APIs — implemented as a **Temporal workflow** so it’s **durable** and **cancellable**.”

*[Pause — switch to demo layout.]*

---

## Demo narration — Terminal layout

**Show three windows** (or tabs labeled clearly):

- **Left:** `temporal server start-dev` *(or minimize — only show if someone asks)*  
- **Center:** `npm run start.worker` *(this is the star — activity logs)*  
- **Right:** `npm run start.workflow` *(short — shows final JSON)*

---

## Step 1 — Point at the worker (5 seconds)

Say:

> “Worker is connected to the **smart-fallback** queue. When I start the workflow, it will run **three activities in parallel** — our stand-ins for three HTTP providers.”

---

## Step 2 — Run the client (10 seconds)

In the **right** terminal:

```bash
npm run start.workflow
```

Say while it runs:

> “Watch the **middle** terminal — all three paths start together.”

---

## Step 3 — Read the logs as they appear (~15 seconds)

**When you see three “started / running” lines**, say:

> “**Parallel execution** — nobody is waiting on B to fail before we try C.”

**When C’s success appears (~1s),** say:

> “**C is the fastest success** — that’s our winner.”

**When B fails (~2s),** say:

> “B still **fails** — but the workflow **already chose** C. We’re not doing a **second round trip** because B died.”

**If A logs “still running” then stops without a full success** (cancel path), say:

> “A was the **slow path** — once C won, we **cancelled** the remaining work. That’s **wasted latency we don’t pay** for the user-facing result.”

---

## Step 4 — Show the result (10 seconds)

Point at the **right** terminal output:

```text
Result: { winner: 'C', value: 'response-C' }
```

Say:

> “The client gets a **single, deterministic outcome**: winner **C**, payload **response-C**. That’s the **race** plus **cancellation** contract.”

---

## Step 5 — Optional: Temporal Web (20 seconds)

If time:

1. Open **Workflows** → find `smart-fallback-<timestamp>`.
2. Say: “Every step is in **history** — replayable, debuggable, **not** a one-off script.”

---

## Closing line (10 seconds)

> “Same pattern with **real HTTP**, regions, or **primary + backup** vendors — **orchestration** stays this clean; only the activities change.”

*[Back to pitch slide or Q&A.]*

---

## If something breaks (cheat sheet)

| Symptom | Fix |
|---------|-----|
| `Connection refused` on `7233` | Start `temporal server start-dev` |
| Worker exits immediately | Check server is up; retry `npm run start.worker` |
| Workflow stuck | Restart worker; check only **one** worker on same queue for demo |
| No logs | Scroll **worker** terminal — client only prints the final result |

**Plan B (no CLI install):** Say: “Here’s a **recording** / **screenshot** of the run” — keep `PRESENTATION.md` slides as backup.

---

## Timing cheat card

| Segment | ~Time |
|---------|--------|
| Problem + solution slides | 45 s |
| Architecture | 30 s |
| Live demo | 90 s |
| Result + Web UI optional | 30 s |
| Pitch + Q&A | 45 s+ |

**Total ~4–5 minutes** without deep questions.

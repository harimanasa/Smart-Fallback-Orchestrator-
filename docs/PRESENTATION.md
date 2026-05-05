---
marp: true
theme: gaia
paginate: true
size: 16:9
footer: Smart Fallback Orchestrator · Temporal
style: |
  section.lead { justify-content: center; }
  section.small-table table { font-size: 0.85em; }
---

<!-- _class: lead -->

# Smart Fallback Orchestrator
## Parallel API race — first success wins

**Temporal · Node · TypeScript**

Hackathon demo · *speculative execution, without the complexity*

---

# The usual pattern hurts latency

**Serial fallback**

1. Call provider A → wait  
2. Timeout or error → retry  
3. Finally call provider B → wait again  

**Cost:** You pay for **every failure in sequence**, even when a faster path would have worked.

---

# What we built instead

**Parallel race + smart selection**

- Fire **multiple providers at once** (mocked as API A, B, C)
- **First successful response wins**
- **Cancel** what is still in flight — *stop paying for losers*

> “We don’t wait for failures — we **outrun** them.”

---

# Why Temporal fits this story

| Capability | How we use it |
|------------|----------------|
| **Durable execution** | Workflow survives process restarts; state is in history |
| **Parallel activities** | Real concurrent work, not fake `Promise` theatre on one box |
| **Cancellation scopes** | Clean **cancel remaining** after the winner is known |
| **Observability** | Clear logs + Temporal Web UI on `localhost:8233` (dev server) |

---

# Architecture (slide asset)

![width:820px center](./slide-architecture.svg)

*Client starts workflow → server schedules tasks → worker runs workflow + activities.*

---

# The three mocked “providers”

| API | Behavior | Role in demo |
|-----|----------|----------------|
| **A** | ~3s, then success | Slow but valid |
| **B** | ~2s, then **error** | Unreliable |
| **C** | ~1s, then success | **Fastest success — wins** |

**Expected outcome:** Result is **C**; A is cancelled before it finishes; B fails on its own timeline.

---

# Workflow logic (high level)

1. Open a **`CancellationScope.cancellable`**
2. Start **`apiA`**, **`apiB`**, **`apiC`** in parallel
3. **`Promise.race`** on wrappers that **ignore failures** so B does not blow the race
4. On first success → **`scope.cancel()`** → tear down the rest
5. Return **`{ winner, value }`** to the client

*Code: `src/workflows.ts` · Activities: `src/activities.ts`*

---

# Live demo — one command (best for presenting)

```bash
cd /path/to/Temporal2 && npm install && npm run present
```

Embeds Temporal dev server + worker + workflow; prints **API A/B/C** lines and **`winner: C`**. First run may download the CLI (needs network).

*Fallback / full stack:* three terminals — `temporal server start-dev`, `npm run start.worker`, `npm run start.workflow`.

*Optional:* with full dev server, open **Temporal Web** at `http://localhost:8233`.

---

# What the audience should see

**Worker / activity logs (story arc)**

1. All three APIs **start**
2. **C** succeeds first (~1s)
3. **B** fails (~2s) — *does not block the result*
4. **A** was on the slow path — **cancelled** after C wins
5. Client prints: **`winner: "C"`**, **`value: "response-C"`**

---

# Tests & success criteria

- **Happy path:** First **successful** provider determines outcome; matches timings table
- **Cancellation:** Slow winner not needed once fastest success returns
- **Failure isolation:** B’s error does **not** force serial retry logic in app code

*Details: `slides-smart-fallback.md` (TC-1 … TC-6)*

---

# Stretch idea (if asked “what’s next?”)

**Strategy modes** *(same engine, different policies)*

- **Fastest** — current demo  
- **Cheapest** — prefer a slower cheap provider unless SLA timer fires  
- **Most reliable** — weight or order by historical success  

*All orchestration; swap real HTTP for mocks.*

---

# One-line pitch

> “We built a **smart orchestration** layer that **executes multiple paths in parallel**, takes the **first successful outcome**, and **cancels the rest** — cutting tail latency and avoiding naive serial fallback.”

**Repo:** `Temporal2` · **Docs:** `docs/DEMO_SCRIPT.md` · **Export slides:** `npm run slides:pdf`

---

<!-- _class: lead -->

# Thank you

**Questions?**

*Demo script + troubleshooting: `docs/DEMO_SCRIPT.md`*

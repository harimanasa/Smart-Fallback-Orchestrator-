# Smart Fallback Orchestrator

Temporal demo: **parallel mocked “APIs”**, **first success wins**, **cancel the rest** — good for a hackathon slide + live run.

**Repository:** [github.com/harimanasa/Smart-Fallback-Orchestrator-](https://github.com/harimanasa/Smart-Fallback-Orchestrator-)  
**Temporal Code Exchange:** ready-to-paste text in [`docs/CODE_EXCHANGE_SUBMISSION.md`](docs/CODE_EXCHANGE_SUBMISSION.md)

## Run the demo (pick one)

### 1. One command (try embedded server, then fall back to `localhost:7233`)

```bash
npm install
npm run present
```

- First tries an **embedded** dev server (may download the Temporal CLI; needs network).
- If that fails but something is already on **`localhost:7233`** (Docker, `temporal server start-dev`, etc.), it **attaches** automatically.

### 2. Docker + demo (clean machine)

```bash
docker compose up -d
npm run present:attach
```

Or all-in-one (waits for port 7233):

```bash
npm run present:docker
```

- **gRPC:** `localhost:7233`
- **Web UI:** [http://localhost:8233](http://localhost:8233)

If **`7233` is already in use**, skip `docker compose up` and run `npm run present:attach` only.

### 3. Manual three-process setup

```bash
temporal server start-dev   # terminal 1
npm run start.worker        # terminal 2
npm run start.workflow      # terminal 3
```

### Quieter logs (projector-friendly)

Hides most SDK `INFO` lines; **activity `console.log` lines stay**.

```bash
npm run present:quiet
# or
npm run present:attach:quiet
```

## What's in here

| Asset | Path |
|--------|------|
| Slide deck (source) | [`docs/PRESENTATION.md`](docs/PRESENTATION.md) |
| Slide deck (HTML) | Open [`docs/presentation.html`](docs/presentation.html) in a browser |
| Architecture SVG | [`docs/slide-architecture.svg`](docs/slide-architecture.svg) |
| **timing** | [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) |
| Example terminal transcript | [`docs/EXAMPLE_OUTPUT.md`](docs/EXAMPLE_OUTPUT.md) |
| Test matrix | [`docs/slides-smart-fallback.md`](docs/slides-smart-fallback.md) |

**Export PDF slides:** `npm run slides:pdf` (needs local Chrome/Chromium for Marp).

## Expected result

```json
{
  "winner": "C",
  "value": "response-C"
}
```

API **C** (~1s) beats **A** (~3s); **B** fails (~2s) after the workflow has already picked **C**. You may still see **A**/**B** finish in the worker after the workflow completes — that is normal in-flight activity behavior; the **workflow result** is what you show judges.

## Big Point

“We execute multiple paths in parallel, take the **first successful outcome**, and **cancel** what is still running — durable orchestration with **Temporal**, not serial retry loops.”

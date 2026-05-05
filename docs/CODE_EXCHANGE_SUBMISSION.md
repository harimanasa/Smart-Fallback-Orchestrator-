# Temporal Code Exchange — submission copy

Use this text when opening a **Code Exchange** issue on GitHub.

## Issue title

**Smart Fallback Orchestrator — parallel API race with CancellationScope**

## Project link

https://github.com/harimanasa/Smart-Fallback-Orchestrator-

## Language

TypeScript (Node.js, Temporal TypeScript SDK)

## Short description (≤256 characters)

Temporal workflow demo: run multiple activity "providers" in parallel, return the first success, and cancel the rest using CancellationScope—clear pattern for multi-path latency and resilience without serial retry chains.

## Long description

See below (Markdown for the issue body).

---

## Long description (paste into GitHub)

```markdown
## What this is

A **minimal, demo-ready** [Temporal](https://temporal.io/) project that shows **parallel speculative execution** for integrations: start several activities (mocked APIs with different delays and failure modes), **race on the first successful result**, then **cancel remaining work** with **`CancellationScope`**.

## Problems it helps Temporal users solve

- **Tail latency:** avoid waiting for slow or failing paths before trying faster ones.
- **Multi-provider / fallback:** same pattern as calling several vendors, regions, or model endpoints in parallel.
- **Clean cancellation:** demonstrates **scoped cancellation** so losers do not drive workflow logic after a winner is chosen.
- **Hackathon / teaching:** one-command demo (`npm run present` / `present:attach`), slides, and a narrated script in-repo.

## What’s included

- **Workflow:** `smartFallbackRace` — parallel `apiA` / `apiB` / `apiC`, `Promise.race`-style first success, then `scope.cancel()`.
- **Activities:** mocked delays (e.g. C ≈ 1s success, B ≈ 2s failure, A ≈ 3s success) plus console-friendly logs.
- **Run modes:** attach to `localhost:7233`, optional Docker Compose for dev server, embedded server attempt via `@temporalio/testing`.
- **Presenter assets:** Marp deck (`docs/PRESENTATION.md`, `docs/presentation.html`), architecture SVG, demo script, example output, test notes.

## Try it

```bash
npm install
npm run present          # or: docker compose up -d && npm run present:attach
```

**Web UI (dev server):** http://localhost:8233

## Screenshots / video

- **Architecture:** `docs/slide-architecture.svg`
- **Deck:** open `docs/presentation.html` in a browser (or export PDF via `npm run slides:pdf` if Chrome/Chromium available)
- **Sample terminal story:** `docs/EXAMPLE_OUTPUT.md`

## License

MIT — see [LICENSE](../LICENSE) in the repository.
```

## Author(s)

- **Name:** Hari Manasa (update if you prefer a different credit)
- **GitHub:** [@harimanasa](https://github.com/harimanasa)
- **Repository:** [Smart-Fallback-Orchestrator-](https://github.com/harimanasa/Smart-Fallback-Orchestrator-)

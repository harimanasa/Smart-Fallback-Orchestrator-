# Example output (for slides or rehearsal)

Copy snippets below if you need a **screenshot story** without running live.

---

## Command

```bash
npm run present
```

---

## What you should see (abbreviated)

```text
════════════════════════════════════════════════════════════
  Smart Fallback Orchestrator — live demo
════════════════════════════════════════════════════════════

Starting embedded Temporal dev server (may download CLI on first run)...

Server: 127.0.0.1:xxxxx  |  namespace: default  |  queue: smart-fallback

── Parallel race starting (A=3s OK, B=2s fail, C=1s OK) ──

Workflow ID: present-demo-1745000123456

API A → still running (slow, 3s)...
API B → running (will fail at 2s)...
API C → running (fast, 1s)...
API C → success ✅ (selected path)
API B → failed ❌

════════════════════════════════════════════════════════════
  Workflow completed
════════════════════════════════════════════════════════════

Result (JSON):
{
  "winner": "C",
  "value": "response-C"
}

Interpretation:
  • winner = which mocked API returned the first success
  • value  = payload from that provider
  • API C wins at ~1s; B fails ~2s; A (~3s) is cancelled after C wins.

Embedded server stopped.
```

*Exact port and timestamps will differ.*

**Note:** After the workflow completes, the worker may still print **API A** finishing or **SDK warnings** about activity completion — the workflow has already returned **`winner: C`**. That is normal when activities were cancelled or the run finished first.

---

## Result object (TypeScript shape)

```ts
interface SmartFallbackResult {
  winner: 'A' | 'B' | 'C'; // first successful path in the race
  value: string;           // e.g. "response-C"
}
```

---

## Timeline (to narrate)

| ~Time | Event |
|-------|--------|
| 0s | A, B, C activities start |
| 1s | C succeeds → workflow selects C, cancels scope |
| 2s | B fails (does not change outcome) |
| 3s | A would have finished, but was cancelled |

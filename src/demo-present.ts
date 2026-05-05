/**
 * Presenter demo: run workflow with activity logs + JSON result.
 *
 * Modes:
 * 1. Default: embedded dev server via @temporalio/testing (first run may download CLI).
 * 2. TEMPORAL_ADDRESS=host:port or SKIP_EMBEDDED=1 — use existing server (e.g. after `docker compose up`).
 */
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { Connection, Client } from '@temporalio/client';
import { DefaultLogger, NativeConnection, Runtime, Worker } from '@temporalio/worker';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import * as activities from './activities';

const TASK_QUEUE = 'smart-fallback';
const DEFAULT_ADDRESS = 'localhost:7233';

function banner(title: string): void {
  const line = '═'.repeat(Math.max(60, title.length + 8));
  console.log(`\n${line}\n  ${title}\n${line}\n`);
}

async function tryConnect(address: string): Promise<boolean> {
  try {
    const c = await NativeConnection.connect({ address });
    await c.close();
    return true;
  } catch {
    return false;
  }
}

async function runDemo(
  nativeConnection: NativeConnection,
  client: Client,
  teardown: () => Promise<void>,
): Promise<void> {
  const worker = await Worker.create({
    connection: nativeConnection,
    namespace: 'default',
    taskQueue: TASK_QUEUE,
    workflowsPath: path.join(__dirname, 'workflows.ts'),
    activities,
  });

  const workerRun = worker.run();

  try {
    console.log('── Parallel race (A=3s OK, B=2s fail, C=1s OK) ──\n');

    const handle = await client.workflow.start('smartFallbackRace', {
      taskQueue: TASK_QUEUE,
      workflowId: `present-demo-${Date.now()}`,
    });

    console.log(`Workflow ID: ${handle.workflowId}\n`);
    const result = await handle.result();

    banner('Workflow completed');
    console.log('Result (JSON):');
    console.log(JSON.stringify(result, null, 2));
    console.log(`
Interpretation:
  • winner — first successful mocked API
  • value  — payload from that provider
  • C wins ~1s; B fails ~2s; A (~3s) cancelled after C wins.
`);
  } finally {
    await worker.shutdown();
    await workerRun;
    await teardown();
  }
}

function printDockerHelp(): void {
  console.log(`
Could not start or reach Temporal on ${DEFAULT_ADDRESS}.

Option A — Docker (recommended for demos):
  docker compose up -d
  # wait ~5s, then:
  npm run present:attach

Option B — Temporal CLI on host:
  temporal server start-dev
  npm run present:attach

Web UI (with Docker or CLI dev server): http://localhost:8233
`);
}

function setupDemoLogging(): void {
  if (process.env.DEMO_QUIET === '1') {
    Runtime.install({ logger: new DefaultLogger('WARN') });
  }
}

async function main(): Promise<void> {
  setupDemoLogging();
  banner('Smart Fallback Orchestrator — live demo');

  const skipEmbedded = process.env.SKIP_EMBEDDED === '1';
  const address = process.env.TEMPORAL_ADDRESS ?? DEFAULT_ADDRESS;

  if (skipEmbedded || process.env.TEMPORAL_ADDRESS) {
    console.log(`Using existing Temporal at ${address}\n`);
    if (!(await tryConnect(address))) {
      printDockerHelp();
      process.exit(1);
    }
    const nativeConnection = await NativeConnection.connect({ address });
    const connection = await Connection.connect({ address });
    const client = new Client({ connection, namespace: 'default' });
    await runDemo(nativeConnection, client, async () => {
      await nativeConnection.close();
      await connection.close();
    });
    return;
  }

  console.log('Trying embedded dev server (may download CLI on first run)...\n');

  try {
    const testEnv = await TestWorkflowEnvironment.createLocal();
    console.log(`Embedded server: ${testEnv.address}  |  queue: ${TASK_QUEUE}\n`);
    await runDemo(testEnv.nativeConnection, testEnv.client, async () => {
      await testEnv.teardown();
      console.log('Embedded server stopped.\n');
    });
  } catch (err) {
    console.warn('Embedded server failed:', (err as Error).message);
    console.log(`\nFalling back to ${address}...\n`);
    await delay(500);

    if (await tryConnect(address)) {
      const nativeConnection = await NativeConnection.connect({ address });
      const connection = await Connection.connect({ address });
      const client = new Client({ connection, namespace: 'default' });
      await runDemo(nativeConnection, client, async () => {
        await nativeConnection.close();
        await connection.close();
      });
      return;
    }

    printDockerHelp();
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('\nDemo failed:', err);
  printDockerHelp();
  process.exit(1);
});

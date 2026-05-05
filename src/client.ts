import { Connection, Client } from '@temporalio/client';

const TASK_QUEUE = 'smart-fallback';

async function main(): Promise<void> {
  const connection = await Connection.connect({ address: 'localhost:7233' });
  const client = new Client({ connection, namespace: 'default' });

  const handle = await client.workflow.start('smartFallbackRace', {
    taskQueue: TASK_QUEUE,
    workflowId: `smart-fallback-${Date.now()}`,
  });

  console.log('Started workflow:', handle.workflowId);
  const result = await handle.result();
  console.log('Result:', result);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import path from 'node:path';
import { NativeConnection, Worker } from '@temporalio/worker';
import * as activities from './activities';

const TASK_QUEUE = 'smart-fallback';

async function main(): Promise<void> {
  const connection = await NativeConnection.connect({ address: 'localhost:7233' });
  const worker = await Worker.create({
    connection,
    namespace: 'default',
    taskQueue: TASK_QUEUE,
    workflowsPath: path.join(__dirname, 'workflows.ts'),
    activities,
  });

  console.log('Worker listening on task queue:', TASK_QUEUE);
  await worker.run();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

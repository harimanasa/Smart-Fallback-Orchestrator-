import { log } from '@temporalio/activity';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function apiA(): Promise<string> {
  log.info('API A → started (slow path, 3s)');
  console.log('API A → still running (slow, 3s)...');
  await sleep(3000);
  log.info('API A → success');
  console.log('API A → finished (success)');
  return 'response-A';
}

export async function apiB(): Promise<string> {
  log.info('API B → started (will fail after 2s)');
  console.log('API B → running (will fail at 2s)...');
  await sleep(2000);
  log.error('API B → failed ❌');
  console.log('API B → failed ❌');
  throw new Error('API B simulated failure');
}

export async function apiC(): Promise<string> {
  log.info('API C → started (fast path, 1s)');
  console.log('API C → running (fast, 1s)...');
  await sleep(1000);
  log.info('API C → success ✅ (fastest success)');
  console.log('API C → success ✅ (selected path)');
  return 'response-C';
}

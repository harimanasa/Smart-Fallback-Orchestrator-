import {
  CancellationScope,
  log,
  proxyActivities,
  ActivityCancellationType,
} from '@temporalio/workflow';
import type * as acts from './activities';

const { apiA, apiB, apiC } = proxyActivities<typeof acts>({
  startToCloseTimeout: '2 minutes',
  cancellationType: ActivityCancellationType.WAIT_CANCELLATION_COMPLETED,
});

/** Never rejects: failures are swallowed so other paths can still win the race. */
function raceCandidate<T>(label: string, p: Promise<T>): Promise<{ label: string; value: T }> {
  return new Promise((resolve) => {
    p.then(
      (value) => resolve({ label, value }),
      () => {
        /* another candidate may still win */
      },
    );
  });
}

export async function smartFallbackRace(): Promise<{ winner: string; value: string }> {
  log.info('Starting parallel execution...');

  return await CancellationScope.cancellable(async () => {
    const pA = apiA();
    const pB = apiB();
    const pC = apiC();

    const decided = await Promise.race([
      raceCandidate('A', pA),
      raceCandidate('B', pB),
      raceCandidate('C', pC),
    ]);

    log.info(`First success: API ${decided.label} ✅ (selected)`);
    log.info('Cancelling remaining activities...');
    CancellationScope.current().cancel();
    log.info('Workflow completed 🚀');
    return { winner: decided.label, value: decided.value };
  });
}

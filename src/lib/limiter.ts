/**
 * Serializes calls behind a minimum interval. Nominatim's usage policy caps us
 * at 1 request/second; wrap its client in a 1100ms limiter so bursts queue
 * instead of getting us blocked.
 */
export function minInterval(ms: number) {
  let chain: Promise<void> = Promise.resolve();
  let last = 0;

  return function schedule<T>(fn: () => Promise<T>): Promise<T> {
    const run = chain.then(async () => {
      const wait = last + ms - Date.now();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      last = Date.now();
    });
    // Keep the chain alive regardless of individual failures.
    chain = run.then(
      () => undefined,
      () => undefined,
    );
    return run.then(fn);
  };
}

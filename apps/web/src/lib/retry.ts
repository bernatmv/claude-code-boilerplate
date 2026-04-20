export type RetryOptions = {
  retries?: number;
  minDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  jitter?: boolean;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
  signal?: AbortSignal;
};

const DEFAULTS = {
  retries: 3,
  minDelayMs: 100,
  maxDelayMs: 5_000,
  factor: 2,
  jitter: true,
};

export function computeBackoff(
  attempt: number,
  options: Pick<RetryOptions, "minDelayMs" | "maxDelayMs" | "factor" | "jitter"> = {},
): number {
  const minDelayMs = options.minDelayMs ?? DEFAULTS.minDelayMs;
  const maxDelayMs = options.maxDelayMs ?? DEFAULTS.maxDelayMs;
  const factor = options.factor ?? DEFAULTS.factor;
  const jitter = options.jitter ?? DEFAULTS.jitter;

  const exponential = minDelayMs * Math.pow(factor, Math.max(0, attempt - 1));
  const capped = Math.min(exponential, maxDelayMs);
  if (!jitter) return capped;
  return Math.floor(Math.random() * capped);
}

export async function retry<T>(
  fn: (attempt: number) => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const retries = options.retries ?? DEFAULTS.retries;
  const shouldRetry = options.shouldRetry ?? (() => true);

  let attempt = 0;
  while (true) {
    attempt += 1;
    if (options.signal?.aborted) throw options.signal.reason ?? new Error("Aborted");
    try {
      return await fn(attempt);
    } catch (error) {
      if (attempt > retries || !shouldRetry(error, attempt)) throw error;
      const delayMs = computeBackoff(attempt, options);
      options.onRetry?.(error, attempt, delayMs);
      await sleep(delayMs, options.signal);
    }
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (ms <= 0) {
      resolve();
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const abortError = () =>
      signal?.reason instanceof Error ? signal.reason : new Error("Aborted");
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError());
    };
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        reject(abortError());
        return;
      }
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}

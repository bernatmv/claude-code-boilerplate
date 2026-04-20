export type DebouncedFunction<TArgs extends unknown[]> = {
  (...args: TArgs): void;
  cancel: () => void;
  flush: () => void;
};

export function debounce<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  waitMs: number,
): DebouncedFunction<TArgs> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingArgs: TArgs | null = null;

  const debounced = ((...args: TArgs) => {
    pendingArgs = args;
    if (timer !== null) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      const a = pendingArgs;
      pendingArgs = null;
      if (a) fn(...a);
    }, waitMs);
  }) as DebouncedFunction<TArgs>;

  debounced.cancel = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    pendingArgs = null;
  };

  debounced.flush = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
      const a = pendingArgs;
      pendingArgs = null;
      if (a) fn(...a);
    }
  };

  return debounced;
}

export type ThrottledFunction<TArgs extends unknown[]> = {
  (...args: TArgs): void;
  cancel: () => void;
};

export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => void,
  intervalMs: number,
): ThrottledFunction<TArgs> {
  let lastRunAt = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let trailingArgs: TArgs | null = null;

  const invoke = (args: TArgs) => {
    lastRunAt = Date.now();
    fn(...args);
  };

  const throttled = ((...args: TArgs) => {
    const now = Date.now();
    const remaining = intervalMs - (now - lastRunAt);
    if (remaining <= 0) {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      invoke(args);
    } else {
      trailingArgs = args;
      if (timer === null) {
        timer = setTimeout(() => {
          timer = null;
          const a = trailingArgs;
          trailingArgs = null;
          if (a) invoke(a);
        }, remaining);
      }
    }
  }) as ThrottledFunction<TArgs>;

  throttled.cancel = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    trailingArgs = null;
    lastRunAt = 0;
  };

  return throttled;
}

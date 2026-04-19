type Level = "debug" | "info" | "warn" | "error";

const LEVEL_ORDER: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function threshold(): number {
  const raw = process.env.LOG_LEVEL?.toLowerCase() as Level | undefined;
  return LEVEL_ORDER[raw ?? (process.env.NODE_ENV === "production" ? "info" : "debug")];
}

function emit(level: Level, message: string, fields?: Record<string, unknown>): void {
  if (LEVEL_ORDER[level] < threshold()) return;
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...fields,
  };
  const line = JSON.stringify(entry);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  // eslint-disable-next-line no-console
  else console.log(line);
}

export const logger = {
  debug: (msg: string, fields?: Record<string, unknown>) => emit("debug", msg, fields),
  info: (msg: string, fields?: Record<string, unknown>) => emit("info", msg, fields),
  warn: (msg: string, fields?: Record<string, unknown>) => emit("warn", msg, fields),
  error: (msg: string, fields?: Record<string, unknown>) => emit("error", msg, fields),
  child: (context: Record<string, unknown>) => ({
    debug: (msg: string, fields?: Record<string, unknown>) =>
      emit("debug", msg, { ...context, ...fields }),
    info: (msg: string, fields?: Record<string, unknown>) =>
      emit("info", msg, { ...context, ...fields }),
    warn: (msg: string, fields?: Record<string, unknown>) =>
      emit("warn", msg, { ...context, ...fields }),
    error: (msg: string, fields?: Record<string, unknown>) =>
      emit("error", msg, { ...context, ...fields }),
  }),
};

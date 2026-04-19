import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { logger } from "./logger";

describe("logger", () => {
  const originalEnv = process.env.LOG_LEVEL;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    errSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    process.env.LOG_LEVEL = "debug";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.LOG_LEVEL = originalEnv;
  });

  it("emits structured JSON", () => {
    logger.info("hello", { userId: "u1" });
    const line = logSpy.mock.calls[0]?.[0] as string;
    const parsed = JSON.parse(line) as Record<string, unknown>;
    expect(parsed.level).toBe("info");
    expect(parsed.message).toBe("hello");
    expect(parsed.userId).toBe("u1");
    expect(typeof parsed.time).toBe("string");
  });

  it("routes errors to console.error", () => {
    logger.error("boom");
    expect(errSpy).toHaveBeenCalled();
  });

  it("respects LOG_LEVEL threshold", () => {
    process.env.LOG_LEVEL = "warn";
    logger.debug("nope");
    logger.info("nope");
    logger.warn("yep");
    expect(logSpy).not.toHaveBeenCalled();
  });

  it("child loggers merge context", () => {
    const child = logger.child({ requestId: "r1" });
    child.info("ping", { extra: 1 });
    const parsed = JSON.parse(logSpy.mock.calls[0]?.[0] as string) as Record<string, unknown>;
    expect(parsed.requestId).toBe("r1");
    expect(parsed.extra).toBe(1);
  });
});

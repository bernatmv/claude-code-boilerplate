import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { debounce, throttle } from "./debounce";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("debounce", () => {
  it("invokes once after the wait", () => {
    const fn = vi.fn();
    const d = debounce(fn, 50);
    d("a");
    d("b");
    d("c");
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith("c");
  });

  it("cancel clears pending invocation", () => {
    const fn = vi.fn();
    const d = debounce(fn, 50);
    d("a");
    d.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });

  it("flush runs the pending invocation immediately", () => {
    const fn = vi.fn();
    const d = debounce(fn, 50);
    d("a");
    d.flush();
    expect(fn).toHaveBeenCalledWith("a");
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe("throttle", () => {
  it("invokes on the leading edge", () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t("a");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("a");
  });

  it("schedules trailing invocation with latest args", () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t("a");
    t("b");
    t("c");
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("c");
  });

  it("cancel clears trailing", () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t("a");
    t("b");
    t.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect } from "vitest";
import { guessUnixTimestamp } from "@/lib/time/unixTimestamp";

// 2026-11-04T00:00:00Z, so results don't depend on when the tests run
const NOW = Date.UTC(2026, 10, 4);
const ISO = "2025-06-26T17:04:24.000Z";

describe("guessUnixTimestamp", () => {
  it.each([
    [1750957464, "seconds"],
    [1750957464000, "milliseconds"],
    [1750957464000000, "microseconds"],
    [1750957464000000000, "nanoseconds"],
  ])("reads %d as %s", (value, unit) => {
    const guessed = guessUnixTimestamp(value, NOW);
    expect(guessed?.unit).toBe(unit);
    expect(guessed?.date.toISOString()).toBe(ISO);
  });

  it("handles dates before 1970", () => {
    // 1960-01-01T00:00:00Z in seconds
    const guessed = guessUnixTimestamp(-315619200, NOW);
    expect(guessed?.unit).toBe("seconds");
    expect(guessed?.date.toISOString()).toBe("1960-01-01T00:00:00.000Z");
  });

  it("reads 0 as the epoch in seconds", () => {
    const guessed = guessUnixTimestamp(0, NOW);
    expect(guessed?.unit).toBe("seconds");
    expect(guessed?.date.toISOString()).toBe("1970-01-01T00:00:00.000Z");
  });

  it("returns null when no unit gives a valid date", () => {
    expect(guessUnixTimestamp(9e24, NOW)).toBeNull();
    expect(guessUnixTimestamp(Infinity, NOW)).toBeNull();
    expect(guessUnixTimestamp(NaN, NOW)).toBeNull();
  });
});

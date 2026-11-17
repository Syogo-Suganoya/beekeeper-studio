export type UnixTimestampUnit = "seconds" | "milliseconds" | "microseconds" | "nanoseconds";

// Milliseconds per unit, in the order ties are broken (e.g. for 0).
const UNITS: [UnixTimestampUnit, number][] = [
  ["seconds", 1000],
  ["milliseconds", 1],
  ["microseconds", 1e-3],
  ["nanoseconds", 1e-6],
];

export interface GuessedUnixTimestamp {
  date: Date;
  unit: UnixTimestampUnit;
}

/**
 * Reads an integer as a unix timestamp without knowing its precision.
 *
 * Databases store unix time in seconds, milliseconds, microseconds or
 * nanoseconds, and nothing in the value says which. Each unit is tried and
 * the one whose size in milliseconds is closest to `now`'s (compared on a
 * log scale, i.e. by number of digits) wins. Units are 1000x apart, while
 * real timestamps stay within a few digits of today's. For example `1750957464`
 * is read as seconds (2025-06-26) rather than milliseconds (1970-01-21).
 *
 * The log scale matters for negative values (dates before 1970): a plain
 * distance to `now` would always pick nanoseconds, since that lands closest
 * to 1970.
 *
 * Returns null when no unit gives a valid date.
 */
export function guessUnixTimestamp(value: number, now: number = Date.now()): GuessedUnixTimestamp | null {
  if (!Number.isFinite(value)) return null;

  const magnitude = (ms: number) => Math.log10(Math.max(Math.abs(ms), 1));
  const nowMagnitude = magnitude(now);

  let best: (GuessedUnixTimestamp & { distance: number }) | null = null;
  for (const [unit, msPerUnit] of UNITS) {
    const ms = value * msPerUnit;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) continue;

    const distance = Math.abs(magnitude(ms) - nowMagnitude);
    if (!best || distance < best.distance) {
      best = { date, unit, distance };
    }
  }
  return best ? { date: best.date, unit: best.unit } : null;
}

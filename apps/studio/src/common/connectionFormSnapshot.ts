/**
 * A comparable snapshot of the connection form's values, used to tell
 * whether the form has unsaved changes.
 *
 * - Keys are sorted, so the order fields were set in doesn't matter.
 * - `undefined`, `null` and `""` all mean "empty" and compare equal, so typing
 *   into a blank field and clearing it again isn't a change.
 */
export function connectionFormSnapshot(config: unknown): string {
  return JSON.stringify(normalize(config))
}

function normalize(value: unknown): unknown {
  if (value === undefined || value === null || value === "") return null
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(normalize)
  if (typeof value === "object") {
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(value).sort()) {
      const v = normalize(value[key])
      // a missing key and an empty one are the same
      if (v !== null) result[key] = v
    }
    return result
  }
  if (typeof value === "function") return null
  return value
}

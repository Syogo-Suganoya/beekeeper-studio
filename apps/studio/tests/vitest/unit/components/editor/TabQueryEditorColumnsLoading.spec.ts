import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
/**
 * Unit tests for TabQueryEditor.vue `withColumnsLoading`, which drives the
 * "Loading columns..." indicator in the query editor status bar.
 *
 * The method is called with `.call(ctx, ...)` on a plain object instead of
 * mounting the whole editor.
 */
import TabQueryEditor from '@/components/TabQueryEditor.vue'

const withColumnsLoading = (TabQueryEditor as any).methods.withColumnsLoading

function deferred<T = void>() {
  let resolve!: (v: T) => void
  let reject!: (e: unknown) => void
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

describe("TabQueryEditor withColumnsLoading", () => {
  let ctx: { columnsLoadingCount: number, showColumnsLoading: boolean }

  beforeEach(() => {
    vi.useFakeTimers()
    ctx = { columnsLoadingCount: 0, showColumnsLoading: false }
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("does not show the indicator for a fast fetch", async () => {
    const result = await withColumnsLoading.call(ctx, async () => 'cols')
    vi.runAllTimers()

    expect(result).toBe('cols')
    expect(ctx.showColumnsLoading).toBe(false)
    expect(ctx.columnsLoadingCount).toBe(0)
  })

  it("shows the indicator for a slow fetch and hides it when done", async () => {
    const fetch = deferred()
    const pending = withColumnsLoading.call(ctx, () => fetch.promise)

    vi.advanceTimersByTime(299)
    expect(ctx.showColumnsLoading).toBe(false)
    vi.advanceTimersByTime(1)
    expect(ctx.showColumnsLoading).toBe(true)

    fetch.resolve()
    await pending
    expect(ctx.showColumnsLoading).toBe(false)
  })

  it("keeps the indicator while another fetch is still running", async () => {
    const first = deferred()
    const second = deferred()
    const p1 = withColumnsLoading.call(ctx, () => first.promise)
    const p2 = withColumnsLoading.call(ctx, () => second.promise)
    vi.advanceTimersByTime(300)
    expect(ctx.showColumnsLoading).toBe(true)

    first.resolve()
    await p1
    expect(ctx.showColumnsLoading).toBe(true)

    second.resolve()
    await p2
    expect(ctx.showColumnsLoading).toBe(false)
  })

  it("hides the indicator and rethrows when the fetch fails", async () => {
    const fetch = deferred()
    const pending = withColumnsLoading.call(ctx, () => fetch.promise)
    vi.advanceTimersByTime(300)
    expect(ctx.showColumnsLoading).toBe(true)

    fetch.reject(new Error('boom'))
    await expect(pending).rejects.toThrow('boom')
    expect(ctx.showColumnsLoading).toBe(false)
    expect(ctx.columnsLoadingCount).toBe(0)
  })
})

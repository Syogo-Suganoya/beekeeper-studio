import { describe, it, expect, vi } from "vitest";
import EditorModal from "@/components/tableview/EditorModal.vue";
import { Languages } from "@/lib/editor/languageData";

// Regression tests for #5086: clicking outside the modal closed it and threw
// away edits. The modal now only closes on an outside click while the content
// is unchanged. Methods are called on a plain object instead of mounting the
// component (same approach as ResultTable.spec.ts).
const options = (EditorModal as any).options ?? EditorModal;
const { openModal } = options.methods;
const { hasEdits } = options.computed;

const json = Languages.find((l) => l.name === "json");

function open(content: any, language = json) {
  const ctx: any = {
    content: "",
    initialContent: "",
    binaryEncoding: "hex",
    modalName: "test",
    $modal: { show: vi.fn() },
  };
  openModal.call(ctx, content, language);
  return ctx;
}

describe("EditorModal", () => {
  it("has no edits right after opening", () => {
    const ctx = open('{"a":1}');
    expect(hasEdits.call(ctx)).toBe(false);
  });

  it("compares against the beautified content, not the raw value", () => {
    // openModal beautifies JSON, so `{"a":1}` is shown as multi-line text.
    const ctx = open({ a: 1 });
    expect(ctx.content).not.toBe('{"a":1}');
    expect(hasEdits.call(ctx)).toBe(false);
  });

  it("has edits once the content changes", () => {
    const ctx = open('{"a":1}');
    ctx.content = '{"a":2}';
    expect(hasEdits.call(ctx)).toBe(true);
  });

  it("has no edits again if the change is undone", () => {
    const ctx = open('{"a":1}');
    const original = ctx.content;
    ctx.content = '{"a":2}';
    ctx.content = original;
    expect(hasEdits.call(ctx)).toBe(false);
  });

  it("resets when reopened with another value", () => {
    const ctx = open('{"a":1}');
    ctx.content = "edited";
    openModal.call(ctx, '{"b":2}', json);
    expect(hasEdits.call(ctx)).toBe(false);
  });

  it("treats null as empty content", () => {
    const ctx = open(null, Languages[0]);
    expect(ctx.content).toBe("");
    expect(hasEdits.call(ctx)).toBe(false);
  });
});

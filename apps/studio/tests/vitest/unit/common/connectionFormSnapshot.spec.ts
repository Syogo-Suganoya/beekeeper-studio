import { describe, it, expect } from "vitest";
import { connectionFormSnapshot as snap } from "@/common/connectionFormSnapshot";

describe("connectionFormSnapshot", () => {
  it("is equal for the same values", () => {
    expect(snap({ host: "localhost", port: 5432 })).toBe(snap({ host: "localhost", port: 5432 }));
  });

  it("changes when a value changes", () => {
    expect(snap({ host: "localhost" })).not.toBe(snap({ host: "db.example.com" }));
    expect(snap({ port: 5432 })).not.toBe(snap({ port: 5433 }));
    expect(snap({ ssl: false })).not.toBe(snap({ ssl: true }));
  });

  it("ignores key order", () => {
    expect(snap({ host: "a", port: 1 })).toBe(snap({ port: 1, host: "a" }));
  });

  it("treats undefined, null, empty string and a missing key as the same", () => {
    const empty = snap({ host: "a" });
    expect(snap({ host: "a", username: "" })).toBe(empty);
    expect(snap({ host: "a", username: null })).toBe(empty);
    expect(snap({ host: "a", username: undefined })).toBe(empty);
  });

  it("does not treat 0 or false as empty", () => {
    expect(snap({ port: 0 })).not.toBe(snap({}));
    expect(snap({ ssl: false })).not.toBe(snap({}));
  });

  it("compares nested objects and arrays", () => {
    expect(snap({ ssh: { host: "a", port: 22 } })).toBe(snap({ ssh: { port: 22, host: "a" } }));
    expect(snap({ ssh: { host: "a" } })).not.toBe(snap({ ssh: { host: "b" } }));
    expect(snap({ tags: ["a", "b"] })).not.toBe(snap({ tags: ["b", "a"] }));
  });

  it("compares dates by value", () => {
    expect(snap({ at: new Date(0) })).toBe(snap({ at: new Date(0) }));
    expect(snap({ at: new Date(0) })).not.toBe(snap({ at: new Date(1) }));
  });

  it("works on class instances like the saved connection model", () => {
    class Conn { host = "a"; get label() { return "x" } }
    expect(snap(new Conn())).toBe(snap({ host: "a" }));
  });
});

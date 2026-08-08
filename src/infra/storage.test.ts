// Infra unit tests: Storage Repository — graceful fallback (NFR-REL-002),
// corrupt-data safety (AC-6), round-trip (AC-4 substrate).

import { describe, it, expect } from "vitest";
import { createStorageRepo, type StorageLike } from "./storage.ts";

// A Map-backed fake StorageLike.
function fakeStore(seed: Record<string, string> = {}): StorageLike {
  const m = new Map(Object.entries(seed));
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      m.set(k, v);
    },
  };
}

describe("StorageRepo", () => {
  it("round-trips a value through save/load", () => {
    const repo = createStorageRepo(fakeStore());
    repo.save("k", { a: 1, b: [2, 3] });
    expect(repo.load("k", null)).toEqual({ a: 1, b: [2, 3] });
  });

  it("returns the fallback for a missing key", () => {
    const repo = createStorageRepo(fakeStore());
    expect(repo.load("nope", "fallback")).toBe("fallback");
  });

  it("returns the fallback for corrupt JSON (AC-6)", () => {
    const repo = createStorageRepo(fakeStore({ k: "not json {{{" }));
    expect(repo.load("k", { ok: true })).toEqual({ ok: true });
  });

  it("degrades to in-memory when there is no backend (AC-5, NFR-REL-002)", () => {
    const repo = createStorageRepo(null); // no localStorage
    repo.save("k", 42);
    expect(repo.load("k", 0)).toBe(42); // works for the session
  });

  it("does not throw when the backend's setItem fails (AC-5)", () => {
    const throwing: StorageLike = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceeded");
      },
    };
    const repo = createStorageRepo(throwing);
    expect(() => repo.save("k", { big: "data" })).not.toThrow();
    expect(repo.load("k", "fallback")).toBe("fallback"); // nothing persisted, no crash
  });
});

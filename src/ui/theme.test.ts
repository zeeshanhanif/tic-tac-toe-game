// Unit tests for the pure theme resolver (FEAT-007). AC-3, AC-5.
// An explicit saved choice wins over the OS preference; anything else → OS.

import { describe, it, expect } from "vitest";
import { resolveInitialTheme, type Theme } from "./theme.ts";

describe("resolveInitialTheme", () => {
  it("uses the OS preference when there is no saved choice (AC-3)", () => {
    expect(resolveInitialTheme(null, true)).toBe("dark");
    expect(resolveInitialTheme(null, false)).toBe("light");
  });

  it("lets an explicit saved choice win over the OS preference (AC-5)", () => {
    expect(resolveInitialTheme("light", true)).toBe("light"); // light chosen on a dark OS
    expect(resolveInitialTheme("dark", false)).toBe("dark"); // dark chosen on a light OS
  });

  it("falls back to the OS preference for a corrupt/unknown value (AC-5)", () => {
    const corrupt = "purple" as unknown as Theme;
    expect(resolveInitialTheme(corrupt, true)).toBe("dark");
    expect(resolveInitialTheme(corrupt, false)).toBe("light");
  });
});

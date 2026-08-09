// Infrastructure — Storage Repository (ADR-004). The only module that touches
// localStorage. Serializes JSON under versioned keys; degrades to a session-only
// in-memory store when localStorage is unavailable or throws (NFR-REL-002).
// Corrupt/unreadable data loads as the caller's fallback, never a crash.

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface StorageRepo {
  load<T>(key: string, fallback: T): T;
  save<T>(key: string, value: T): void;
}

/** Probe localStorage; return null when it's absent or throws (private mode, etc.). */
function detectLocalStorage(): StorageLike | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const probe = "__ttt_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return null;
  }
}

export function createStorageRepo(
  backend: StorageLike | null = detectLocalStorage(),
): StorageRepo {
  // Session-only in-memory fallback when there is no usable backend (NFR-REL-002).
  const memory = new Map<string, string>();
  const store: StorageLike =
    backend ?? {
      getItem: (k) => memory.get(k) ?? null,
      setItem: (k, v) => {
        memory.set(k, v);
      },
    };

  return {
    load<T>(key: string, fallback: T): T {
      try {
        const raw = store.getItem(key);
        if (raw === null) return fallback;
        return JSON.parse(raw) as T;
      } catch {
        return fallback; // missing / corrupt / unreadable → default, no crash
      }
    },
    save<T>(key: string, value: T): void {
      try {
        store.setItem(key, JSON.stringify(value));
      } catch {
        // quota/availability failure — swallow; the caller's in-memory state stays authoritative
      }
    },
  };
}

// Infrastructure — observability hook (plan §6). Structured dev-only logging.
// Privacy-first: no telemetry, no network (NFR-PRIV-001/002 · architecture §8).
// The Storage Repository (localStorage adapter, ADR-004) also lives in this
// layer and is introduced in FEAT-004.

type LogData = Record<string, unknown>;

export function log(event: string, data: LogData = {}): void {
  if (import.meta.env.DEV) {
    // Structured shape so future sessions can grep events consistently.
    console.debug(JSON.stringify({ event, ...data }));
  }
}

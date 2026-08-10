// Stats view (SCR-WEB-004) — reads the persisted stats (FEAT-004) and renders
// the W/L/D summary, a mode filter, and the match history. Read-only; pure
// aggregation lives in core/stats.ts. FR-STATS-003/004, UC-06. Reset → FEAT-006.

import { el, wordmark } from "../dom.ts";
import { openConfirmDialog } from "./confirm-dialog.ts";
import {
  summarize,
  filterHistory,
  type StatsState,
  type StatsFilter,
  type MatchRecord,
} from "../../core/index.ts";
import type { StatsStore } from "../../infra/stats-store.ts";

interface StatsViewHandlers {
  onBack: () => void; // FR-UI-002
}

const cap = (s: string) => s[0].toUpperCase() + s.slice(1);

function relativeTime(ts: number): string {
  const min = Math.floor((Date.now() - ts) / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return day === 1 ? "Yesterday" : `${day}d ago`;
}

export function createStatsView(statsStore: StatsStore, handlers: StatsViewHandlers): HTMLElement {
  // Reassignable: reset mutates the store mid-view, so the reset path re-reads
  // the snapshot and re-renders from the fresh (zeroed) state (D1).
  let state: StatsState = statsStore.snapshot();
  let filter: StatsFilter = "all";

  const root = el("section", "view");

  function topBar(): HTMLElement {
    const bar = el("header", "topbar");
    const back = el("button", "back", "‹ Back to game");
    back.type = "button";
    back.addEventListener("click", handlers.onBack);
    bar.append(wordmark(), back);
    return bar;
  }

  function hero(): HTMLElement {
    const w = summarize(state, filter);
    const total = w.wins + w.losses + w.draws;
    const sub =
      total === 0
        ? "No games yet"
        : `${total} game${total === 1 ? "" : "s"} played · ${Math.round((w.wins / total) * 100)}% win rate`;
    const h = el("div", "hero");
    h.append(el("h1", undefined, "Statistics"), el("p", undefined, sub));
    return h;
  }

  function filterSeg(): HTMLElement {
    const seg = el("div", "seg");
    const opts: [StatsFilter, string][] = [
      ["all", "All"],
      ["vs-computer", "Vs. Computer"],
      ["two-player", "2 Players"],
    ];
    for (const [value, text] of opts) {
      const btn = el("button", value === filter ? "on" : undefined, text);
      btn.type = "button";
      btn.addEventListener("click", () => {
        filter = value;
        render();
      });
      seg.append(btn);
    }
    return seg;
  }

  function tile(kind: string, n: number, label: string): HTMLElement {
    const t = el("div", `tile ${kind}`);
    t.append(el("div", "num", String(n)), el("div", "lbl", label));
    return t;
  }

  function tiles(): HTMLElement {
    const w = summarize(state, filter);
    const grid = el("div", "tiles");
    grid.append(tile("win", w.wins, "Wins"), tile("loss", w.losses, "Losses"), tile("draw", w.draws, "Draws"));
    return grid;
  }

  function historyRow(r: MatchRecord): HTMLElement {
    const row = el("div", "hrow");
    const badge = el("span", `rbadge ${r.result}`, cap(r.result));
    const meta = el("div", "hmeta");
    const title = r.mode === "vs-computer" ? "Vs. Computer" : "2 Players";
    const subtitle = r.mode === "vs-computer" ? `${cap(r.difficulty ?? "medium")} AI` : "Local match";
    meta.append(el("div", "mt", title), el("div", "ms", subtitle));
    row.append(badge, meta, el("div", "htime", relativeTime(r.timestamp)));
    return row;
  }

  function history(): HTMLElement {
    const rows = filterHistory(state, filter);
    if (rows.length === 0) {
      const empty = el("div", "history empty");
      empty.append(el("div", "empty-msg", "Play a game to see it here."));
      return empty;
    }
    const list = el("div", "history");
    for (const r of rows) list.append(historyRow(r));
    return list;
  }

  // Reset all statistics (SCR-WEB-005) — confirm before clearing (FR-UI-003,
  // UC-07). On confirm: clear + re-read the zeroed snapshot + re-render (D1).
  function doReset(): void {
    statsStore.reset();
    state = statsStore.snapshot();
    render();
  }

  function resetBlock(): HTMLElement {
    const block = el("div", "reset-block");
    const note = el("p", "reset-note", "Clears all recorded games on this device.");
    const btn = el("button", "btn danger", "Reset all statistics");
    btn.type = "button";
    btn.addEventListener("click", () =>
      openConfirmDialog({
        title: "Reset all statistics?",
        body: "This permanently clears all win/loss/draw counts and match history on this device. This can't be undone.",
        confirmLabel: "Reset statistics",
        onConfirm: doReset,
      }),
    );
    block.append(note, btn);
    return block;
  }

  function render(): void {
    root.replaceChildren(
      topBar(),
      hero(),
      filterSeg(),
      tiles(),
      el("div", "label", "Recent matches"),
      history(),
      resetBlock(),
    );
  }

  render();
  return root;
}

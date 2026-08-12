# Deployment Notes — Tic-Tac-Toe Game

> First deployment: **2026-08-11** · Target: **Vercel** (static SPA, ADR-001)
> Owned by initial-deployment. Operable record: URLs, commands, rollback, ops.

## Target & topology

Single static bundle (`vite build` → `dist/`) served by Vercel's CDN. **No
runtime, no server, no secrets, no data stores** (architecture §7). The only
persisted data is per-device `localStorage` (stats/prefs) — user-owned, never
leaves the browser.

## Environments & URLs

| Environment | URL | Source | Trigger |
| :---------- | :-- | :----- | :------ |
| **Production** | https://tic-tac-toe-game-gilt-gamma.vercel.app | `main` branch | push/merge to `main` |
| **Preview** | `*-git-<branch>-*.vercel.app` (per PR, auto) | any branch/PR | push to the branch |

Connected via **Vercel for GitHub** (Git integration) to
`github.com/zeeshanhanif/tic-tac-toe-game`. Region observed: `sin1` (Singapore).

## Build configuration (`vercel.json`, auto-detected as Vite)

- Framework preset: **Vite** · Build: `npm run build` · Output: `dist` · Install: `npm ci`
- `prebuild` lifecycle runs `gen:tokens`, so `src/ui/generated/tokens.css`
  (gitignored) is regenerated during Vercel's build.
- **No environment variables** (none required).

## CD (continuous delivery)

- **Push/merge to `main` → Production** deploy (automatic).
- **PR / branch push → Preview** deploy with a unique URL (commented on the PR).
- **GitHub Actions CI** (`.github/workflows/ci.yml`) is the quality gate on
  push/PR: `gen:tokens → lint → test → build → Playwright E2E`. Vercel deploys
  independently of CI; CI green is the merge gate.

## Deploy & rollback commands

- **Deploy:** automatic on push to `main`. Manual redeploy: Vercel dashboard →
  project → **Redeploy**, or (CLI) `vercel --prod`.
- **Rollback (instant):** Vercel dashboard → **Deployments** → select a prior
  successful Production deployment → **Promote to Production**. Or (CLI)
  `vercel rollback <deployment-url>`. Reverting a production commit also
  auto-restores the previous deployment instantly (Vercel docs, 2026-07).

## Secrets

**None.** No secret store, no environment variables — nothing sensitive to
manage (architecture §8: no auth, no PII, no network calls during play).

## Live verification evidence (2026-08-11)

- **HTTP/TLS:** `HTTP/2 200`, `strict-transport-security` (HSTS) present, served
  by Vercel, hashed assets serve with correct content-types.
- **App identity:** `<title>Tic-Tac-Toe</title>`, `#app`, anti-FOUC theme init,
  content-hashed `index-*.js`/`index-*.css`.
- **E2E against the live URL:** the full committed suite — **12/12 passed**
  (CF-1 play-a-game incl. Hard-AI never-loses; CF-2 review+reset; DEF-001 setup
  guard; FEAT-007 theming; FEAT-008 remember-settings). This closes the walking
  skeleton's **deployed-half done-when**.
- **NFR-PORT-002 (offline after load):** verified live — with the network cut
  post-load, a full game plays and the stats view opens.
- **NFR-PORT-001 (deployable as static files):** demonstrated by this deploy.
- Client-side perf NFRs (NFR-PERF-001/002) are browser-compute and
  environment-independent — already verified in CI; not re-measured server-side.

## Minimum operations

- **TLS/HTTPS:** automatic (Vercel-managed cert; HSTS with preload). ✅
- **Uptime:** production surface verified up (200). Platform availability is
  Vercel-managed. *Optional/deferred:* an external synthetic monitor (e.g. a
  free uptime service) — not provisioned (would need a third-party account).
- **Error alerting:** Vercel emails the account owner on **failed deployments**
  (default). **No client-side error tracking** — intentional per architecture
  §8 (observability: none by design; privacy-first, no network calls). A static
  SPA has no server-side runtime error surface.
- **Logs:** Vercel build/deployment logs in the dashboard. No runtime logs
  (no functions).
- **Backup/restore:** **N/A** — no server-side data. Stats/prefs are device-local
  `localStorage`, user-owned; architecture §8 states "no backup/recovery
  obligations (device-local by design)." A restore drill is not applicable.

## Deviations from the deployment view

- **SPA deep-link rewrite intentionally omitted.** Vercel's Vite guide
  recommends a `vercel.json` rewrite (`/(.*)` → `/index.html`) for SPAs with
  client-side routing. This app has **no routing** — a single URL (`/`) with
  in-memory view switching — so no rewrite is needed. Decision recorded so it's
  not read as an oversight.

## Cost

**Vercel Hobby (free).** A static site provisions no billable resources; no paid
tier required.

## Pending / deferred (not blocking)

- **Custom domain:** none — uses the default `*.vercel.app`. Add later via
  Vercel dashboard → Domains if desired.
- **External uptime monitor & fuller day-2 observability:** intentionally out of
  scope (architecture: observability none by design). Add if operational needs
  grow.
</content>

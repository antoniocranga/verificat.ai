# RULES.md — Engineering Rules

Operational rules that implement CONSTITUTION.md. Where this file is silent, defer to the Constitution; where this file and a convenience shortcut conflict, this file wins.

## 1. Repository conventions

- Structure: `apps/{web,mobile,extension,admin}`, `services/{api,speech,fact-check,search,notification}`, `packages/{ui,types,config,security,analytics}`, `infrastructure/{docker,monitoring,deployment}`, `docs/`. New top-level folders require an ADR.
- Package manager: pnpm only. `npm install` / `yarn add` in this repo is a bug, not a style choice — it desyncs the lockfile.
- TypeScript strict mode everywhere; `any` requires an inline comment justifying why a proper type isn't feasible.
- Conventional Commits (`feat:`, `fix:`, `chore:`, `security:`, etc.), enforced by commitlint.

## 2. Branching & PRs

- `main` is always deployable to staging. Feature branches off `main`, squash-merged via PR.
- Every PR requires: passing CI (lint, typecheck, test, Gitleaks, Trivy), at least one human review for anything touching `services/`, `packages/security`, RLS policies, or auth.
- PRs touching RLS policies or auth flows require the Security Considerations section of the linked Notion task to be filled in and reviewed — not just code-reviewed for style.
- No direct pushes to `main`. No force-push to shared branches.

## 3. Security rules (enforced, not aspirational)

- Any new database table ships with its RLS policy in the same PR — never as a follow-up.
- Any new environment variable is added to `.env.example` with a placeholder value AND registered in Infisical for staging/production — never just one or the other.
- Any new third-party dependency with network access (analytics SDKs, crash reporters, etc.) is documented in `docs/data-flows.md` with what data it receives.
- Rate limiting is applied per-endpoint by default; an endpoint without a rate limit requires an explicit, reviewed exception comment explaining why.
- CSP, HSTS, and secure-cookie flags are set at the reverse-proxy/middleware layer, not duplicated ad hoc per route.

## 4. Testing requirements by layer

- **RLS policies:** automated test asserting both the allowed and denied cases per role, not just the happy path.
- **Auth flows:** Playwright/integration test covering the full flow (signup→verify→login, or OAuth round-trip), run against a staging-like environment, not mocked end-to-end.
- **Fact-verification pipeline:** golden-set regression tests (a maintained set of known Romanian claims with expected verdict ranges) run on every change to claim detection, retrieval, or verdict logic — this pipeline is the product; it does not ship on vibes.
- **Mobile:** widget tests for BLoC state transitions; an integration test for the live-listening happy path before each release.
- **Extension:** manual cross-browser smoke test (Chrome/Firefox/Edge/Brave) before each release, in addition to automated unit tests.

## 5. AI/LLM usage rules

- Any LLM call in the verification pipeline must be a clearly-scoped sub-task (e.g. "normalize this claim," "summarize this evidence snippet") with its input/output logged for audit, never an opaque "verify this claim" mega-prompt.
- Prompts used in production are version-controlled in `packages/fact-verification/prompts/`, not inlined as magic strings scattered across the codebase.
- Any change to a production prompt goes through the same PR review process as code, because it changes product behavior.

## 6. Documentation rules

- Every service has a `README.md` covering: what it does, how to run it locally, what it depends on, what its environment variables are (names only, never values).
- ADRs live in Notion (single source of truth), not duplicated in-repo — link to the Notion ADR from the relevant README instead of copying it.
- The Notion Engineering Backlog is the single source of truth for task status. A task is not "done" because the code merged; it's done when Acceptance Criteria and Testing Requirements are verified and the Notion Status is updated accordingly.

## 7. Romanian-language quality bar

- All UI copy reviewed for correct diacritics (ă â î ș ț) — a missing diacritic is a bug, not a typo to defer.
- STT post-processing pipeline tested against a maintained set of Romanian audio samples covering at least: standard newsreader speech, accented/regional speech, noisy/crowd audio, and fast political-debate-style speech.

## 8. Performance budgets (see PERFORMANCE.md for full detail)

- End-to-end claim-to-verdict latency: P50 < 5s, stretch target P50 < 2s. Any change that regresses this in staging benchmarks blocks merge until investigated.
- Web app: Core Web Vitals in the "Good" band on the public marketing pages; this is an SEO and conversion requirement, not just a developer-experience nicety.

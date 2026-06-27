---
description: SECURITY_CHECK_LOOP
---

# SECURITY_CHECK_LOOP — verificat.xyz

Invoked from: `master.md` (step 4), after `TASK_IMPLEMENTATION_LOOP` completes.

This is a blocking gate. The task does not proceed to `TEST_VALIDATION_LOOP` until this loop passes.

Read `SECURITY.md` and `CONSTITUTION.md` Article II before running checks.

---

## PHASE 1 — Security Considerations field review

1. Retrieve the task's **Security Considerations** field from Notion.
2. If the field is empty AND the task touches any of the following: auth, RLS, API endpoints, secrets/env vars, Docker/infra, mobile storage, extension permissions, or outbound HTTP calls → STOP. Set task to "Blocked". Reason: "Security Considerations field must be filled before this task can be marked complete."
3. Read the field and identify any stated risks. For each risk: confirm the implementation addresses it, or flag it as unresolved.

---

## PHASE 2 — Backend checks (`services/`, `packages/security`)

For every changed file in `services/` or `packages/security`:

### Authentication
- [ ] Every protected route has `JwtAuthGuard` (or equivalent) applied
- [ ] No endpoint accepts unauthenticated requests unless explicitly intended to be public, and that intention is documented in the Notion task
- [ ] Token validation is server-side, not relying solely on client-provided claims

### Row Level Security
- [ ] Every new or modified table has an RLS policy
- [ ] RLS policy covers: anon role (deny all user data), authenticated role (own data only, or role-specific), service_role (explicit allowance only where needed)
- [ ] RLS policy has a corresponding automated test for both the allowed case AND the denied case
- [ ] No table is left with `RLS enabled, no policies` (Postgres deny-all-but-owner — ambiguous and dangerous to leave unintentional)

### API endpoints
- [ ] Rate limiting applied (Traefik + NestJS guards); if exempt, a reviewed exception comment exists
- [ ] Input validation present (class-validator DTOs or equivalent); no raw user input passed to a query or shell
- [ ] No `service_role` key used in a code path that could be reached from a client bundle
- [ ] Parameterised queries only — no raw SQL string concatenation

### Secret handling
- [ ] No secrets in committed files (run `gitleaks detect --source=.` mentally or via CLI)
- [ ] New env vars are in `.env.example` (placeholder only) AND registered in Infisical
- [ ] LLM API keys, DB credentials, OAuth secrets: not logged, not in error messages, not in Sentry payloads

### Outbound HTTP (SSRF risk)
- [ ] Any service that fetches a URL influenced by user input or claim content has an allowlist
- [ ] Evidence retrieval (Phase 4) receives explicit SSRF review on every PR — this is the highest-risk surface

---

## PHASE 3 — Frontend checks (`apps/web`, `apps/admin`)

- [ ] No `service_role` key in any `NEXT_PUBLIC_` env var or client-side code
- [ ] CSP headers are set at Traefik layer (not duplicated per-route in `next.config.js` alone)
- [ ] No sensitive user data (tokens, raw claims, PII) written to `localStorage` or `sessionStorage`
- [ ] `HttpOnly`, `Secure`, `SameSite=Lax` minimum on all session cookies
- [ ] No `dangerouslySetInnerHTML` with user-supplied content

---

## PHASE 4 — Browser extension checks (`apps/extension`)

- [ ] Manifest V3 only — no Manifest V2 patterns
- [ ] Permissions in `manifest.json` are the minimum required; any new permission has a reviewed justification comment
- [ ] No `unsafe-eval` or `unsafe-inline` in extension CSP
- [ ] Tab/mic audio capture requires explicit per-session user consent
- [ ] No sensitive data in `chrome.storage.local` without encryption

---

## PHASE 5 — Mobile checks (`apps/mobile`)

- [ ] Auth tokens stored in `flutter_secure_storage` (Keychain/Keystore) — not SharedPreferences, not files
- [ ] No plaintext secrets in any Dart file or asset
- [ ] Auth tokens not included in Sentry breadcrumbs or debug logs
- [ ] Root/jailbreak detection present on screens that trigger audio capture (can fail-open with warning, not silently)
- [ ] SSL pinning decision is recorded (Phase 6 requirement — flag if this PR touches the HTTP client layer before the SSL pinning ADR exists)

---

## PHASE 6 — Infrastructure checks (`infrastructure/`, Dockerfiles, Compose files)

- [ ] Every Dockerfile's final stage runs as a non-root user (`USER nonroot` or equivalent)
- [ ] Docker Compose production files use pinned image digests, not `:latest`
- [ ] Resource limits are set per service in `docker-compose.production.yml`
- [ ] Infisical is in the backup/DR plan (referenced in Notion → Infrastructure & Deployment)
- [ ] No secrets written to a volume that is not gitignored

---

## PHASE 7 — Decision

### If ALL applicable checks pass:
→ Set security check status = PASSED in the implementation summary output
→ Proceed to `TEST_VALIDATION_LOOP`

### If ANY check fails:
1. Set task Status = "Blocked" in Notion
2. Create a new Notion security fix task:
   - Name: "Security fix: [description of issue] — [original Task ID]"
   - Priority: P0 if it involves a secret exposure, broken auth, or open RLS; P1 otherwise
   - Link to original task in Dependencies field
3. Add the following to the original task's Security Considerations: "SECURITY BLOCK at [timestamp UTC]: [issue description]. Follow-up task: [new task ID]."
4. Do NOT mark the original task Done
5. Re-enter `TASK_SELECTION_LOOP` — pick the security fix task next (it will be P0/P1)

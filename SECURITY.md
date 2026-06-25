# SECURITY.md — verificat.xyz Security Reference

This document is the repo-local security reference, complementing `CONSTITUTION.md` Article II and `RULES.md` §3. The authoritative living security posture (STRIDE analysis, OWASP mapping, open decisions, and the Phase 8 sign-off checklist) lives in **Notion → Security Architecture & Review**. This file exists so a developer or agent working offline can find the non-negotiable controls without opening Notion first.

If this file and `CONSTITUTION.md` conflict, the Constitution wins. If this file and Notion conflict, treat the conflict as a bug in one of them and flag it to a human rather than picking the more permissive interpretation.

---

## 1. Non-negotiable controls (Constitution Article II, restated)

These cannot be weakened by any agent, PR, or task description without explicit human sign-off:

| Control                                                      | Where it lives          | How it's enforced                                  |
| ------------------------------------------------------------ | ----------------------- | -------------------------------------------------- |
| No secret outside secrets manager                            | Infisical               | Gitleaks in pre-commit + CI (T1.3.3)               |
| RLS default-deny on every table                              | Supabase Postgres       | CI check: tables without policies fail             |
| `service_role` key never in a client bundle                  | Supabase                | Trivy + bundle-size/source scan in CI              |
| Short-lived tokens, rotating refresh, server-side revocation | Supabase Auth           | F2.4 task set                                      |
| Non-root Docker final stage                                  | All Dockerfiles         | Trivy misconfiguration scan                        |
| Dependency + container + secret scanning as required CI      | CI pipeline             | Gitleaks, Trivy — both gate merge                  |
| Per-endpoint rate limiting by default                        | Traefik + NestJS guards | Exception requires reviewed comment explaining why |
| CSP, HSTS, secure cookies at reverse-proxy layer             | Traefik                 | Not duplicated per-route                           |

---

## 2. STRIDE threat model (system-level summary)

Full detail is in Notion → Security Architecture & Review. This table is a quick reference:

| Threat                     | Primary mitigation                                                                                                |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Spoofing**               | Supabase Auth + OAuth 2.1/OIDC with PKCE; JWT signature validation on every API request                           |
| **Tampering**              | RLS default-deny on every table; signed/short-lived Storage URLs; `audit_log` table for sensitive writes          |
| **Repudiation**            | `audit_log` with actor, action, timestamp, IP — immutable (service_role-only writes, no deletes)                  |
| **Information Disclosure** | RLS, least-privilege service accounts, secrets via Infisical only, PII scrubbed from logs and Sentry              |
| **Denial of Service**      | Rate limiting + IP throttling at Traefik and NestJS layers; WAF; BullMQ backpressure on STT/verification pipeline |
| **Elevation of Privilege** | RBAC on Admin Dashboard; `service_role` key isolated to server-only contexts; mobile root/jailbreak detection     |

---

## 3. OWASP Top 10 mapping (API + web)

Each item below corresponds to a Phase 8 sign-off checklist item in Notion:

1. **Broken Access Control** → RLS + RBAC automated test suite (both allowed and denied cases per role).
2. **Cryptographic Failures** → TLS 1.2+ only; secrets never at rest unencrypted; Supabase Storage signed URLs, not public.
3. **Injection** → Parameterised queries only via Supabase client and NestJS query builder; no raw string SQL anywhere.
4. **Insecure Design** → Threat-modelled at ADR time; security considerations in every Notion task before implementation begins.
5. **Security Misconfiguration** → CSP/HSTS/secure-headers baseline shipped in Phase 1 (T1.4.2); Trivy misconfiguration scan in CI.
6. **Vulnerable Components** → Trivy + Renovate/Dependabot; no direct dependency on a package with a known CVE.
7. **Identification & Auth Failures** → Covered by F2.2–F2.5 (Supabase Auth, token rotation, revocation).
8. **Software & Data Integrity** → Signed Docker images; lockfile-pinned dependencies (pnpm lockfile committed and verified in CI).
9. **Logging & Monitoring Failures** → Covered by F1.6 (OpenTelemetry + Sentry); PII scrubbed before logs leave process boundary.
10. **SSRF** → Outbound allowlisting on any service that fetches user- or claim-supplied URLs. **Evidence retrieval is the highest-risk surface**; flag every Phase 4 PR for explicit SSRF review.

---

## 4. Layer-by-layer requirements

### 4.1 API (`services/api`)

- JWT validation on every protected route (NestJS `JwtAuthGuard`).
- Rate limiting middleware at both Traefik (IP-level) and NestJS (user/endpoint-level).
- Abuse detection and IP throttling (BullMQ job queue backpressure for the STT/verification pipeline).
- No raw SQL strings; parameterised queries or the Supabase type-safe client only.
- All new endpoints: document expected roles, rate limit, and any data returned in the Notion task's Security Considerations before implementation.

### 4.2 Web (`apps/web`)

- CSP, HSTS, CSRF protection, and secure headers set in Traefik middleware — not in Next.js `next.config.js` alone.
- Secure-cookie flags (`HttpOnly`, `Secure`, `SameSite=Lax` minimum) on all session cookies.
- No secrets in `NEXT_PUBLIC_` environment variables; Supabase anon key is acceptable (it's public by design), service-role key is not.

### 4.3 Browser Extension (`apps/extension`)

- Manifest V3 — no Manifest V2 fallback.
- Permissions declared in `manifest.json` must be the minimum required. Any addition to the permissions list requires a reviewed justification comment.
- CSP enforced in `manifest.json`; no `unsafe-eval`, no `unsafe-inline` in extension CSP.
- Tab/mic capture requires explicit per-session user consent UI before any audio is captured.
- No sensitive data (tokens, claims, user PII) stored in `chrome.storage.local` without encryption.

### 4.4 Mobile (`apps/mobile`)

- SSL pinning (decision on cert vs. public-key pinning, including rotation plan, is required in Phase 6 planning — **not deferred to Phase 8**).
- Secure storage: `flutter_secure_storage` (iOS Keychain, Android Keystore); no plaintext secrets in SharedPreferences or file system.
- Root/jailbreak detection gates sensitive actions (audio capture, verdict display) — fail-open with user warning, not fail-closed silently.
- Auth tokens not logged; stripped from Sentry breadcrumbs.

### 4.5 Infrastructure (`infrastructure/`)

- Every Dockerfile: final stage runs as a non-root user (`USER nonroot` or named equivalent). No exceptions.
- Docker Compose production: pinned image digests (not `:latest` tags); resource limits set per service.
- WAF product choice (Traefik + CrowdSec vs. managed WAF) requires an ADR before Phase 8 closes — this is an open decision as of the initial architecture review.
- Audit logs are write-only via `service_role`; no `DELETE` permission on `audit_log` for any application role.
- Monitoring (Prometheus/Grafana/Loki) must have alerting configured and routed to a real notification channel before Phase 8 sign-off.

---

## 5. Secrets management rules

- **Source of truth:** Infisical (self-hosted on VPS).
- **Local dev:** `.env.local` with sandbox/test credentials only, gitignored. Real values never in `.env.local`.
- **CI:** Scoped, short-lived credentials (GitHub OIDC where supported). CI never receives production secrets.
- **Staging/production:** Secrets injected at container start via `infisical run` or the Infisical Docker sidecar.
- **New env vars:** Added to `.env.example` with a placeholder value AND registered in Infisical — both, never just one.
- **Exposed secret protocol:** If a secret is found outside Infisical (in chat, a file, a log), treat it as compromised. Rotate immediately. "It was only seen by X" is not a defence. Log the incident in Notion → Security Architecture & Review.

---

## 6. RLS policy rules (database)

- Every new table ships with its RLS policy in the **same PR** — never as a follow-up.
- Policy must explicitly test both the allowed case and the denied case in automated tests (not just the happy path).
- The `anon` role must not be able to read tables that contain user-specific data.
- A table with `RLS enabled, no policies` is a deny-all-but-owner state that's easy to misconfigure — CI must fail if this state is detected.

---

## 7. Incident response quick reference

1. **Identify** — which credential/data/control is affected.
2. **Contain** — rotate the secret or disable the endpoint immediately, before investigation:
   - For **Supabase Service-Role / Anon Keys**: Go to Supabase Dashboard → Settings → API → Click "Rotate Key".
   - For **Database Credentials / Secrets**: Change the master database password in Supabase Dashboard → Settings → Database, then immediately update the password in the **Infisical Staging/Production environments**.
3. **Log** — create a Notion incident entry in Security Architecture & Review with: timestamp, what was exposed, how it was discovered, and who was notified.
4. **Audit** — check Supabase auth logs and API access logs for any use of the compromised credential between issuance and rotation.
5. **Fix** — address root cause (not just symptom) in a tracked Notion task. Restart services so they pull the updated keys from Infisical at startup.
6. **Prevent** — add or tighten a CI check so the same class of issue cannot recur silently.

> **Known incident (planning phase):** A Supabase `service_role` key was shared in plaintext in the planning chat. It has been noted in Notion → Security Architecture & Review. If rotation has not been confirmed, do it now before proceeding with any work.

---

## 8. Security review gate for PRs

PRs touching any of the following require the Notion task's Security Considerations field to be filled in and reviewed by a human **before** the PR is opened (not as a review comment):

- `services/` (any backend service)
- `packages/security`
- Supabase RLS policies or migrations
- Auth flows (signup, login, token handling, OAuth)
- Traefik configuration
- Dockerfile or Docker Compose files
- Infisical configuration

---

## 9. Open security decisions

| Decision                                                         | Required by | Status       | Notes                                                            |
| ---------------------------------------------------------------- | ----------- | ------------ | ---------------------------------------------------------------- |
| WAF product (Traefik+CrowdSec vs. managed WAF)                   | Phase 8     | **Resolved** | ADR accepted — Traefik + CrowdSec (F8.1)                         |
| Mobile SSL pinning strategy (cert vs. public-key, rotation plan) | Phase 8     | Open         | Must be decided before production mobile release, not at Phase 8 |
| Alertmanager vs. Grafana-native alerting channel                 | Phase 8     | Open         | Slack vs. email vs. PagerDuty-class tool                         |
| OpenSearch auth/TLS configuration for self-hosted instance       | Phase 3     | Open         | Flag when Phase 3 backlog items are specced                      |

These items are not optional deferred work — each has a deadline phase. An agent must not proceed past that phase boundary without the decision being recorded as an ADR in Notion.

---

## 10. F8.6 — Secrets & Dependency Audit (2026-06-25)

### Audit scope

Full-repository secrets scan and dependency vulnerability assessment as the pre-launch gate per Phase 8 EPIC exit criteria.

### Gitleaks scan

- **Tool**: Gitleaks (CI workflow step) — default ruleset, no custom `.gitleaks.toml`
- **Pre-commit**: Gitleaks `protect --staged` runs unconditionally via `npx` fallback
- **CI**: `gitleaks/gitleaks-action@v2` — blocking (gate on findings)
- **Result**: Zero real secrets detected. All API keys/tokens are `process.env.*` references only.
- **False positives**: Allowed via `.gitleaksignore` in repo root

### Trivy scan

- **Filesystem scan** (CI): Every commit and PR, severity CRITICAL+HIGH, blocking (exit-code: 1)
- **API Docker image** (Docker workflow): Every push to main, severity CRITICAL only
- **Web Docker image** (Docker workflow): Every push to main, severity CRITICAL+HIGH (added this session)
- **Result**: All CI gates active and blocking.

### Dependency vulnerabilities

- **pnpm audit**: Added to CI as advisory step (warns on high/critical, does not gate)
- **Dependabot**: Configured at `.github/dependabot.yml` — weekly scans for npm, Docker, and GitHub Actions
- **Overrides**: `shell-quote`, `tar`, `multer`, `tmp` pinned to patched versions via `pnpm.overrides`
- **Result**: Dependency scanning automated and active.

### Conclusion

No secrets found outside Infisical. All security scanning gates (Gitleaks + Trivy) are blocking CI checks on the default branch. Dependency updates are automated via Dependabot. The remaining open security decisions (mobile SSL pinning, monitoring channel, OpenSearch auth) are documented in §9 above and are outside the scope of this audit.

# OWASP Top 10 Verification — T8.2.2

| OWASP Category | Key Controls | Evidence Location | Status |
|---|---|---|---|
| **A01: Broken Access Control** | RLS on all 7 tables (22+4 policies); RBAC via `profiles.role`; `is_editor()` gate; JWT auth guard with Redis blacklist | `supabase/migrations/20260621082428_init_schema.sql:66-185`; `services/api/src/auth/auth.guard.ts:18-64` | Verifed |
| **A02: Cryptographic Failures** | HTTP→HTTPS redirect; Let's Encrypt ACME TLS; HSTS 1yr + subdomains + preload; secrets in Infisical only | `infrastructure/deployment/traefik/docker-compose.yml:22-28`; `infrastructure/deployment/traefik/dynamic_conf.yml:9-12`; `services/api/src/config/infisical.ts` | Verifed |
| **A03: Injection** | Parameterized queries via Supabase SDK (no raw SQL); LLM output JSON-schema validated (enum + confidence threshold); `response_format: json_object` enforced | `services/api/src/supabase/supabase.service.ts:20-24`; `services/api/src/fact-checks/verdict-generation.service.ts:197-218`; `packages/fact-verification/prompts/*.txt` | Verifed |
| **A04: Insecure Design** | Threat-modeled per ADR decision process; STRIDE verification complete (T8.2.1); Security Architecture doc reviewed per-ADR | `docs/security/stride-verification.md`; `docs/adr/ADR-006-waf-product-decision.md` | Verifed |
| **A05: Security Misconfiguration** | CSP, HSTS, frame deny, nosniff, XSS filter set at Traefik reverse-proxy layer; not duplicated per route | `infrastructure/deployment/traefik/dynamic_conf.yml:3-14`; `CONSTITUTION.md:28` | Verifed |
| **A06: Vulnerable Components** | Trivy filesystem scan (CRITICAL+HIGH, fail on any); Trivy Docker image scan (CRITICAL only, pre-push); Gitleaks secret scan in CI; Pinned action versions | `.github/workflows/ci.yml:24-34`; `.github/workflows/docker-build-push.yml:72-79` | Verifed |
| **A07: Auth Failures** | Rate limiting (NestJS 100/60s + Traefik 150 avg/30 burst); JWT validation; Redis session revocation; Supabase Auth (PKCE+OAuth2.1) | `services/api/src/app.module.ts:29-41`; `services/api/src/auth/redis.service.ts:20-32`; `apps/web/src/app/auth/callback/route.ts` | Verifed |
| **A08: Software/Data Integrity** | Trivy image scan pre-push; `pnpm-lock.yaml` pinned deps; GitHub Actions pinned to major versions; signed Docker images (CI-only build) | `.github/workflows/docker-build-push.yml:72-79`; `.github/workflows/ci.yml` | Verifed |
| **A09: Logging & Monitoring** | Sentry with PII scrubbing (auth headers, emails, bearer tokens); NestJS Logger across all services; structured error responses via exception filter | `services/api/src/config/sentry.ts:17-42`; `services/api/src/common/filters/http-exception.filter.ts:45-51` | Verifed |
| **A10: SSRF** | Domain allowlisting (gov.ro, wikipedia.org, etc.); Private IP block (IPv4 + IPv6); DNS rebinding protection via custom lookup; Dedicated CI SSRF test gate | `services/api/src/common/safe-fetcher/safe-fetcher.service.ts:10-67`; `.github/workflows/ci.yml:80-89` | Verifed |

## Open Findings

| Finding | Severity | Decision |
|---|---|---|
| No Dependabot/Renovate config found — relies solely on Trivy CI scans | Low | Accept — Trivy scans every PR and Docker build for CRITICAL/HIGH vulns; Renovate can be added post-MVP. |

## Conclusion

All 10 applicable OWASP Top 10 categories have linked verification evidence. Zero Critical or High findings. One Low finding (no Renovate/Dependabot) accepted in favor of existing Trivy coverage.

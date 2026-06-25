# STRIDE Threat Model Verification — T8.2.1

| Threat | Primary Mitigation | Evidence Location | Status |
|---|---|---|---|
| **Spoofing** | JWT validation + PKCE + OAuth 2.1 + session revocation | `services/api/src/auth/auth.guard.ts` — JWT verify + Redis blacklist; `apps/web/src/app/auth/callback/route.ts` — PKCE exchange; `apps/web/src/app/auth/actions.ts` — OAuth; `services/api/src/auth/redis.service.ts` — session blacklist | Verifed |
| **Tampering** | RLS default-deny on all tables; `is_editor()` gating writes; audit_log deny-all-but-service-role | `supabase/migrations/20260621082428_init_schema.sql` — 22 RLS policies across 7 tables; `supabase/migrations/20260621142000_add_pgvector.sql` — 4 additional policies | Verifed |
| **Repudiation** | `audit_log` table with actor_id, action, created_at, payload; service-role-only writes | `supabase/migrations/20260621082428_init_schema.sql:57-63` — table definition; line 187 — deny-all-but-service-role | Verifed |
| **Information Disclosure** | Infisical secret injection; Sentry PII scrubbing; anon key only in client; RLS default-deny | `services/api/src/config/infisical.ts` — secrets bootstrap; `services/api/src/config/sentry.ts` — PII scrubbing; `apps/web/src/utils/supabase/client.ts` — anon key only; `CONSTITUTION.md:21` — no secrets in git | Verifed |
| **Denial of Service** | NestJS rate limiting (100/60s); Traefik rate-limit (150 avg/30 burst); BullMQ backpressure + DLQ | `services/api/src/app.module.ts:29-41` — ThrottlerModule; `infrastructure/deployment/docker-compose.production.yml:51-54` — Traefik middleware; `services/api/src/jobs/jobs.listener.ts` — DLQ routing; `services/api/test/app.e2e-spec.ts` — rate limit + DLQ E2E tests | Verifed |
| **Elevation of Privilege** | RBAC via profiles.role (admin/fact_checker/user); service_role key server-only; `@Public()` opt-out | `supabase/migrations/20260621082428_init_schema.sql:4-9` — role check; `services/api/src/supabase/supabase.service.ts:15-18` — service-role isolation; `services/api/src/auth/public.decorator.ts` — opt-out pattern | Verifed |

## Open Findings

| Finding | Severity | Decision |
|---|---|---|
| Signed/short-lived Supabase Storage URLs configured in Dashboard UI, not in committed code | Low | Accept — Storage URL signing is a dashboard-level config; committed infrastructure code is tracked in Phase 8 CI/CD hardening. |

## Conclusion

All 6 STRIDE categories have linked verification evidence in the committed codebase. Zero Critical or High findings. One Low finding (Storage URL signing not in code) accepted as a dashboard-config concern outside the repo's scope.

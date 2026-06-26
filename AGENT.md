# AGENT.md — verificat.xyz Operational Reference

## 1. Repo Structure

```
verificat-monorepo/
├── apps/
│   ├── web/              # Next.js web app (verificat.xyz)
│   ├── extension/        # WXT Manifest V3 browser extension
│   ├── mobile/           # Flutter mobile app (Phase 6)
│   └── admin/            # Admin dashboard (Phase 7)
├── services/
│   └── api/              # NestJS backend API
├── packages/
│   ├── ui/               # React design system components + CSS tokens
│   ├── types/            # Shared TypeScript domain types (@verificat/types)
│   ├── config/           # Shared TS/ESLint/Prettier configs
│   ├── fact-verification # Fact-check pipeline (claim detection → verdict)
│   ├── analytics/        # Analytics package (placeholder)
│   └── security/         # Security utilities (placeholder)
├── infrastructure/       # Docker Compose environments
├── docker/               # Per-service Dockerfiles
├── docs/                 # Architecture Decision Records (ADR)
└── supabase/             # Supabase CLI migrations + config
```

## 2. Prerequisites

- **Node**: >=20.0.0 (see `package.json` engines field; no `.nvmrc` yet)
- **pnpm**: ^9.1.4 (via `packageManager` field in root `package.json`)
- **Flutter**: See `apps/mobile/pubspec.yaml` when Phase 6 starts
- **Docker**: >=24.0 (Docker Compose v2)
- **Supabase CLI**: Latest (for local dev: `supabase start`)

## 3. Bootstrap

```bash
pnpm install                    # install all workspace dependencies
pnpm build                      # build all packages (turbo)
pnpm --filter @verificat/web dev    # run web dev server
pnpm --filter api dev           # run API dev server (NestJS)
```

## 4. Per-Workspace Test Commands

```bash
pnpm --filter @verificat/web test
pnpm --filter @verificat/ui test
pnpm --filter @verificat/extension build  # WXT build (no test script yet)
pnpm --filter api test
pnpm --filter verificat-fact-verification test
pnpm --filter verificat-fact-verification test:golden  # golden-set regression
pnpm test                       # all workspaces (turbo)
```

## 5. Branching Convention

- `feat/VAI-XXX-short-description` — new features
- `fix/VAI-XXX-short-description` — bug fixes
- `chore/VAI-XXX-short-description` — maintenance
- Branch from `main`. One task = one branch = one PR.

## 6. PR Convention

- Title: `[VAI-XXX] Short description`
- Body includes CHECKLIST.md self-review answers for any task touching `packages/ui/`, `apps/`, or `services/`.
- Commit messages follow Conventional Commits (`feat:`, `fix:`, `chore:`).

## 7. Task Claiming

1. Set `Status = "In progress"` in Notion before writing code.
2. If a dependency is `Not started`, do NOT claim the dependent task first.
3. After completion, set `Status = "Done"` in Notion.

## 8. Execution Order Rule

Agent task selection filters: `Status = "Not started"`, all `Dependencies` Done.
Sort by: `Execution Order` ascending (nulls last), then `Priority` (P0 first), then `Task ID` ascending.

## 9. Forbidden Patterns

- No secrets, credentials, or tokens in code — Infisical only.
- No hardcoded production URLs — use env variables.
- No local type definitions duplicating `packages/types` — import from `@verificat/types`.
- UI tasks: run `packages/ui/CHECKLIST.md` self-review before marking Done.
- No force-push to `main`. No production deploy outside CI.

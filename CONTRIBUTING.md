# Contributing to verificat.xyz

## Getting Started

1. Clone the repo.
2. Run `pnpm install`.
3. Run `pnpm build` to verify all packages compile.
4. Read `AGENT.md` for full operational reference.

## Development Workflow

1. Pick a task from the Engineering Backlog in Notion.
2. Create a branch: `feat/VAI-XXX-short-description`.
3. Implement the task.
4. Run `pnpm lint` and `pnpm build` to verify.
5. Run tests for affected workspaces.
6. Open a PR against `main` with title `[VAI-XXX] Short description`.
7. Include CHECKLIST.md self-review results in the PR body for UI/extension/web changes.

## Code Conventions

- TypeScript strict mode across all workspaces.
- Conventional Commits for all commits.
- RLS on every new database table.
- No secrets in code — use Infisical.

## Testing

- Unit tests: `pnpm test` (Jest per workspace).
- Golden-set regression: `pnpm --filter verificat-fact-verification test:golden`.
- E2E: `pnpm test:e2e` (Playwright, Phase 8).
- Database: pgTAP tests in `supabase/tests/`.

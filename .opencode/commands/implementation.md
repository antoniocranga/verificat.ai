---
description: TASK_IMPLEMENTATION_LOOP
---

# TASK_IMPLEMENTATION_LOOP — verificat.xyz

Invoked from: `master.md` (step 3) after `TASK_PLANNING_LOOP` has produced a verified plan.

Read `CONSTITUTION.md`, `RULES.md`, `SECURITY.md`, and `PERFORMANCE.md` before any code change.
If anything in the plan conflicts with the Constitution, STOP and flag it — do not route around the conflict.

---

## PHASE 1 — Pre-implementation gate

Before writing a single line of code, confirm all of the following:

1. **Notion task has all required fields:**
   - Description ✓
   - Acceptance Criteria ✓
   - Technical Notes (with the plan from TASK_PLANNING_LOOP) ✓
   - Dependencies ✓ (and all Dependencies are status = Done)
   - Security Considerations ✓ (not empty for any task touching auth/RLS/API/infra)
   - Testing Requirements ✓

2. **No Constitution violations in the plan:**
   - Plan does not collapse pipeline stages into a single LLM call (Article I.5)
   - Plan does not disable or weaken any RLS, CSP, rate limit, or auth control (Article II, IV.2)
   - Any new database table has its RLS policy included in this PR, not as a follow-up (RULES.md §3)

3. **Branch state:**
   - Working on a feature branch off `main` (not directly on `main`)
   - No uncommitted unrelated changes present

If any gate fails → STOP. Update Notion task to "Blocked". Document the blocker reason in the Description field.

---

## PHASE 2 — Incremental implementation

Implement **one logical change at a time**. After each meaningful change:

### 2.1 Code discipline

- TypeScript strict mode; every `any` has an inline justification comment
- No magic strings: verdict labels come from the canonical enum/union type in `packages/types`
- Romanian diacritics in any user-facing string: ă â î ș ț — verify after writing
- New env vars: added to `.env.example` with a placeholder AND registered in Infisical
- New third-party dependency with network access: documented in `docs/data-flows.md` with what data it receives
- New LLM call in the pipeline: scoped sub-task only (not end-to-end); prompt committed to `packages/fact-verification/prompts/`; input/output logged

### 2.2 Security discipline (per-change check)

- New DB table → RLS policy included in the same change
- New API endpoint → rate limit applied; auth guard applied; roles documented
- New secret → sourced from Infisical; not hardcoded; not in `.env.example` with a real value
- New file write → confirm it cannot write to a path outside its intended scope
- New outbound HTTP call → check for SSRF risk; add to allowlist if the URL is user-influenced

### 2.3 Commit hygiene

- Conventional Commits format: `feat:`, `fix:`, `security:`, `chore:`, `refactor:`, `test:`, `docs:`
- Commit message body (when non-trivial): "Why" not "What". The diff already shows what.
- No `WIP` or `fixup!` commits left on the branch when opening the PR
- No partial-state commits that break the build mid-branch

---

## PHASE 3 — Build and typecheck validation

After all changes are made:

```bash
# From the repo root — use turbo so caching and affected-detection work
turbo run build --filter=<affected-package>
turbo run typecheck --filter=<affected-package>
turbo run lint --filter=<affected-package>
```

ALL of the following must pass before proceeding to tests:

- [ ] `build` exits 0 with no errors (not just warnings)
- [ ] `typecheck` exits 0 — no TypeScript errors
- [ ] `lint` exits 0 — no ESLint errors (warnings are permitted but must be reviewed, not silently accumulated)

If any fail:
- Fix the error (not suppress it with a lint-disable comment unless there is a documented reason)
- Do not proceed to SECURITY_CHECK_LOOP or TEST_VALIDATION_LOOP with a broken build

---

## PHASE 4 — Acceptance criteria verification

For each item in the Notion task's Acceptance Criteria:

1. State the criterion explicitly (copy it from Notion)
2. Describe how it is satisfied by the implementation
3. If a criterion is not satisfiable in this PR (e.g. it requires a dependency that isn't done): STOP. Mark task Blocked. Do not mark partial criteria as "done enough."

---

## PHASE 5 — Output summary

Produce a structured summary for the NOTION_SYNC_LOOP:

```
FILES MODIFIED:
- <relative path> — <one-line description of change>
- ...

ACCEPTANCE CRITERIA STATUS:
- [x] <criterion> — <how it was satisfied>
- [ ] <criterion> — BLOCKED: <reason> (if applicable)

SECURITY CHANGES:
- <any RLS changes, new endpoints, auth changes, secret additions>
- NONE if no security-relevant changes

PERFORMANCE IMPACT:
- <any expected latency changes in the pipeline, bundle size changes>
- NONE if no performance-relevant changes

KNOWN DEFERRED ITEMS:
- <anything intentionally not done, with Notion task link or reason>
```

Pass this summary to `NOTION_SYNC_LOOP` as the implementation report.

---

## HARD STOPS

Do NOT proceed past this workflow if:

- The build is broken
- A TypeScript error exists
- An RLS policy was modified without the explicit change being in the plan reviewed by a human (for auth/RLS PRs)
- A secret appears in any committed file
- The Acceptance Criteria are not satisfied and the task is not being marked Blocked

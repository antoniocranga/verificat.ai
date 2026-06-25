---
description: PLAN_IMPLEMENT_VERIFY_LOOP
---

# PLAN_IMPLEMENT_VERIFY_LOOP — verificat.xyz

This workflow is the human-facing summary of how a single task moves from "In Progress" to "Done". It is referenced in `GEMINI.md` ("see /workflows/plan-implement-verify-loop.md for the full loop") and is the entry point for understanding the agent's working method.

For the machine-executable loop, see `master.md`. This document is the annotated, human-readable explanation of the same process.

---

## Overview

Every task in the Engineering Backlog follows this sequence — no shortcuts:

```
PLAN → IMPLEMENT → SECURITY CHECK → TEST → COMPLETE → SYNC TO NOTION
```

The loop is designed so that any failure at any stage is recoverable: the task goes back to "Blocked", the reason is documented in Notion, and the next eligible task is picked up. A task is never silently dropped or marked Done without evidence.

---

## Step 1: PLAN

**Workflow:** `task-planning.md`

Before writing any code, the agent:

1. Reads the full task from Notion — Description, Acceptance Criteria, Technical Notes, Dependencies, Security Considerations, Testing Requirements.
2. **Stops if any required field is missing.** The task is marked Blocked and flagged for a human to fill the gap. This is not negotiable. An agent that invents missing Acceptance Criteria is making product decisions it's not authorised to make.
3. Checks that all declared Dependencies are Status = "Done". A P0 dependency that isn't done means the task cannot proceed.
4. Runs a Constitution pre-check — does the plan involve collapsing pipeline stages, disabling RLS, writing a secret to a file, or anything else forbidden by CONSTITUTION.md? If yes, STOP and flag.
5. Breaks the task into concrete, file-level steps. Not "update the backend" — "modify `services/fact-check/src/verdict/verdict.service.ts` to add confidence score normalisation."
6. Writes the plan back to the Notion task's Technical Notes field.

**Output:** A reviewed, written plan in Notion Technical Notes. This is the implementation contract.

**Hard stop:** The plan conflicts with CONSTITUTION.md → no work proceeds until a human resolves the conflict.

---

## Step 2: IMPLEMENT

**Workflow:** `implementation.md`

The agent implements incrementally:

1. One logical change at a time, verifying each step against the plan.
2. TypeScript strict mode; Conventional Commits; no raw SQL; verdict labels from canonical types only.
3. Romanian diacritics checked on every new user-facing string.
4. New env vars → `.env.example` (placeholder) + Infisical (real value). Never both in the same place.
5. New LLM calls → scoped sub-task prompt only; prompt committed to `packages/fact-verification/prompts/`; input/output logged.
6. After all changes: `turbo run build typecheck lint --filter=<package>` must all exit 0.

**Output:** A list of changed files, an implementation summary, and a passing build.

**Hard stop:** Build is broken or a secret is found in a committed file → FAILURE_RECOVERY_LOOP.

---

## Step 3: SECURITY CHECK

**Workflow:** `security-validation.md`

A structured pass over every changed surface area:

- **Backend:** Auth guards, RLS policies (with both allowed and denied automated tests), rate limits, input validation, no service_role key in client paths, parameterised queries, SSRF check on any outbound HTTP.
- **Web:** No service_role key in client bundles, CSP at Traefik layer, no sensitive data in localStorage.
- **Extension:** Manifest V3, minimal permissions, no unsafe-eval/inline in CSP, consent before capture.
- **Mobile:** flutter_secure_storage for tokens, no plaintext secrets, root/jailbreak detection on capture screens.
- **Infrastructure:** Non-root Dockerfile final stage, pinned image digests in production, resource limits set.

**Output:** Security check = PASSED, or task marked Blocked with a security fix task created.

**Hard stop:** Security incident (secret in commit, RLS bypass, compromised credential) → FAILURE_RECOVERY_LOOP Phase 3 + human notification.

---

## Step 4: TEST

**Workflow:** `task-validation.md`

All applicable test types run against real code, not assumed:

| Task type | Test types required |
|---|---|
| Any task | Unit tests (happy path, edge case, failure mode) |
| Database table | RLS tests (allowed AND denied for each role) |
| Auth flow | Integration test against staging-like environment |
| Pipeline change | Golden set regression run + per-stage latency check |
| Extension change | Cross-browser smoke (Chrome, Firefox, Edge, Brave) |
| Mobile change | Widget tests + live-listening integration test |

"The tests should pass" is not verification. `turbo run test` must exit 0, and the output must be inspected.

**Output:** Test validation = PASSED, or task marked Blocked with the failing test documented.

**Hard stop:** Golden set regression → pipeline PR blocked, human alerted.

---

## Step 5: COMPLETE

**Workflow:** `completion.md`

Final cross-check before touching Notion's Done status:

- Every Acceptance Criterion is satisfied (stated verbatim + evidence)
- Code hygiene checklist passed (no TODOs, no debug logs, no type errors, no hardcoded strings)
- Verdict integrity check (if pipeline touched): six canonical values, all three required fields on verdict objects, `Unverified` shown correctly
- Romanian strings correct
- Any newly unblocked tasks updated in Notion

**Output:** Completion = PASSED, or task back to Blocked for a specific failing item.

---

## Step 6: SYNC TO NOTION

**Workflow:** `notion-sync.md`

Only after Steps 1–5 all pass:

- Status set to "Done"
- Technical Notes updated with implementation summary (append, not overwrite)
- Testing Requirements updated with what was tested and how
- Security Considerations updated with any new risks (or confirmed "none introduced")
- Dependent tasks checked and set to eligible if their dependencies are now all Done

**Output:** Notion task status = "Done", with full audit trail in the task fields.

---

## What "Done" means

A task is Done when:

1. The Acceptance Criteria are satisfied and the evidence is in Notion
2. The tests ran and passed (not "should pass" — ran and passed)
3. The security check passed
4. The build passes
5. The Notion task is updated with the full implementation summary

A task where the code merged but the Notion status is wrong is not Done — it is a data integrity problem. A task where the tests were skipped "because it's obvious it works" is not Done — it is a hidden risk.

---

## Exceptions that always require a human

- Constitution conflicts
- Security incidents (Class C in FAILURE_RECOVERY_LOOP)
- Production deploys, DNS changes, anything touching `verificat.xyz` in production
- Database migrations that drop or alter columns with existing data
- Force-push or git history rewrite on a shared branch
- Encountering a credential outside Infisical

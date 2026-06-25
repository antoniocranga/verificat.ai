---
description: COMPLETION_VALIDATION_LOOP
---

# COMPLETION_VALIDATION_LOOP — verificat.xyz

Invoked from: `master.md` (step 5b), after `TEST_VALIDATION_LOOP` passes, before `NOTION_SYNC_LOOP`.

This is the final gate. A task cannot move to "Done" until this loop passes without exception.

Read `CONSTITUTION.md` Articles I, III, and IV before running checks.

---

## PHASE 1 — Acceptance criteria final check

For each item in the task's Acceptance Criteria (from Notion):

1. State the criterion verbatim
2. Describe exactly how the implementation satisfies it (file, function, line if relevant)
3. Confirm that it is testable and was actually tested (not assumed to work)

| Criterion | Satisfied? | Evidence |
|---|---|---|
| [paste criterion] | Yes / No | [file/test/demo] |

If ANY criterion is **No**: the task is NOT done. Set Status = "Blocked" and re-enter `TASK_IMPLEMENTATION_LOOP`.

---

## PHASE 2 — Code hygiene checklist

- [ ] No `TODO` comments left in changed code that were introduced by this task (pre-existing TODOs are out of scope, but must not be made worse)
- [ ] No `console.log` or debug `print()` left in production code paths
- [ ] No TypeScript errors (`turbo run typecheck` exits 0)
- [ ] No lint errors (`turbo run lint` exits 0)
- [ ] No `any` types without an inline justification comment
- [ ] No hardcoded hex colours or pixel values in UI code (design tokens only — see DESIGN.md §4)
- [ ] No hardcoded user-visible strings (all strings in i18n keys — see DESIGN.md §9)
- [ ] No raw SQL string concatenation (parameterised queries only)
- [ ] No secret, credential, or real env value in any committed file

---

## PHASE 3 — Verdict integrity check (if task touches verdict logic)

Applies to: any task touching claim detection, verdict generation, verdict display, or verdict serialisation.

- [ ] Verdict value is one of exactly six canonical strings: `True`, `Mostly True`, `Partially True`, `Misleading`, `False`, `Unverified` — no others
- [ ] Verdict object includes: confidence score, at least one cited source, human-readable evidence explanation
- [ ] `Unverified` verdict is displayed with the same visual weight as other verdicts (not faded, not hidden, not framed as a failure)
- [ ] No code path emits a verdict from a single end-to-end LLM call (pipeline stages must remain separate — Constitution Article I.5)

---

## PHASE 4 — Romanian language check (if task touches UI copy)

- [ ] All new user-facing strings contain correct Romanian diacritics: ă â î ș ț
- [ ] STT transcript post-processing does not strip or substitute diacritics
- [ ] Verdict labels in Romanian match the canonical translations in DESIGN.md §2

---

## PHASE 5 — Dependency impact check

Does this task's completion unblock any other Notion task?

1. Search for tasks with this task's ID in their Dependencies field.
2. For each dependent task found:
   - If its other dependencies are also Done: update its Status from "Blocked" to "Not started" / "Todo"
   - Add a note: "Dependency [this Task ID] completed at [timestamp]. Re-evaluate readiness."

---

## PHASE 6 — PR readiness check

Before handing off to `NOTION_SYNC_LOOP`:

- [ ] Branch is up to date with `main` (no conflicts)
- [ ] Commit history is clean (no `fixup!` or `WIP` commits)
- [ ] Conventional Commits format used throughout
- [ ] PR description is ready to be written (or has been written) with: What, Why, Test evidence, Security impact
- [ ] If the task touches `services/`, `packages/security`, RLS policies, or auth: human review is required — this is noted in the PR description

---

## PHASE 7 — Decision

### All checks pass:
→ Proceed to `NOTION_SYNC_LOOP` with Status = "Done" recommendation

### Any check fails:
→ Set Status = "Blocked"
→ Document which check failed and why in the Technical Notes (append, do not overwrite)
→ Re-enter `TASK_IMPLEMENTATION_LOOP` for the specific failing item
→ Do NOT call `NOTION_SYNC_LOOP` with a "Done" status until this loop passes cleanly

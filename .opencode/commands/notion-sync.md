---
description: NOTION_SYNC_LOOP
---

# NOTION_SYNC_LOOP — verificat.xyz

Invoked from: `master.md` (step 6), after `COMPLETION_VALIDATION_LOOP` passes.

This is the final write-back to Notion. It is the only place where a task's Status is set to "Done". Executing this loop without a passing COMPLETION_VALIDATION_LOOP is a data integrity violation.

---

## PHASE 1 — Verify preconditions

Before writing anything to Notion:

- [ ] COMPLETION_VALIDATION_LOOP completed without any failing checks
- [ ] TEST_VALIDATION_LOOP completed without any failing tests
- [ ] SECURITY_CHECK_LOOP completed without any issues
- [ ] Build, typecheck, and lint all exit 0

If any precondition is not met → STOP. Do not write "Done" to Notion. Return to the failing loop.

---

## PHASE 2 — Status update

Set task Status to exactly one of:

| Status value | When to use |
|---|---|
| `Done` | All checks passed; Acceptance Criteria satisfied; tests run and verified |
| `Blocked` | Any check failed; any required field was empty; dependency is not done; security issue found |

**No other status values are written by this loop.** Do not set "In Review", "Needs Testing", or any custom value not in the Notion schema.

---

## PHASE 3 — Technical Notes update (APPEND ONLY)

Append the implementation summary under a dated header. Never overwrite existing Technical Notes content.

Template:
```
---
**Implementation log — [YYYY-MM-DD UTC]**

**Summary:**
- [Bullet 1: what was implemented]
- [Bullet 2: key architectural decision made]
- [Bullet 3: any deviation from the original plan, with reason]
- (3–10 bullets max; not a prose essay)

**Files modified:**
- `path/to/file.ts` — [one-line description of change]
- `path/to/migration.sql` — [one-line description]

**Decisions made during implementation:**
- [e.g. "Chose parameterised query over ORM method because the ORM does not support partial index scans on the claims table"]

**Tradeoffs accepted:**
- [e.g. "Skipped eager-loading sources to keep P50 latency under budget; lazy-load on verdict expansion. See Notion VAI-NNN for the follow-up."]

**Follow-up tasks created:**
- [Task ID] — [task name] (link or inline)
---
```

---

## PHASE 4 — Testing Requirements update

Append to the Testing Requirements field (do not overwrite):

```
**Tests run — [YYYY-MM-DD UTC]:**
- [Test type]: [what was run] → [result: PASSED / FAILED / SKIPPED with reason]
- [e.g. "Unit tests: packages/fact-verification — 47 tests, all PASSED"]
- [e.g. "RLS tests: anon role denied on claims table — PASSED; authenticated role allowed own claims — PASSED"]
- [e.g. "Golden set regression: 12 claims, all within expected verdict range, P50 3.2s — PASSED"]
- [e.g. "Extension smoke test: Chrome PASSED, Firefox PASSED, Edge PASSED, Brave PASSED"]
```

If a test was skipped: state explicitly why. "Skipped: N/A for this task because [reason]" is acceptable if the reason is genuine. "Skipped: didn't have time" is not acceptable and means the task is Blocked, not Done.

---

## PHASE 5 — Security Considerations update

Append to the Security Considerations field:

```
**Security review — [YYYY-MM-DD UTC]:**
- RLS changes: [description or "none"]
- New endpoints: [description or "none"]
- Auth impact: [description or "none"]
- Secrets handling: [confirmation that no new secrets are committed; Infisical updated if new env var added; or "none"]
- New risks introduced: [description or "none introduced by this task"]
- OWASP / SSRF review: [for Phase 4 evidence-retrieval tasks: explicit SSRF review result]
```

If any unresolved security risk exists after this task → Status must remain Blocked, not be set to Done.

---

## PHASE 6 — Dependency cascade update

Search for tasks in the Engineering Backlog whose Dependencies field includes this task's ID:

For each dependent task found:
1. Check whether all of its other dependencies are now also Done
2. If yes: update its Status from "Blocked" or "Not started" to "Not started" / "Todo" (whatever the Notion schema uses for "ready to pick up")
3. Add a note to the dependent task: "Dependency [original Task ID] completed at [timestamp]. Re-evaluate readiness for selection."

This step ensures the selection loop always has an up-to-date picture of what is actionable.

---

## PHASE 7 — Final consistency check (hard gate)

Before concluding this loop, verify ALL of the following. If any fails: revert the Status to "Blocked" and document the specific failure.

- [ ] Status is set to exactly "Done" or "Blocked" (nothing else)
- [ ] If "Done": every Acceptance Criterion is explicitly satisfied in the Technical Notes
- [ ] If "Done": tests are explicitly confirmed (not assumed) in Testing Requirements
- [ ] If "Done": Security Considerations updated (or explicitly stated "none introduced")
- [ ] If "Blocked": reason is written in the Description or Technical Notes, and follow-up tasks are created and linked
- [ ] Technical Notes were APPENDED, not overwritten
- [ ] Implementation summary has 3–10 bullets (not a single vague line, not a 50-bullet exhaustive dump)
- [ ] No secret, credential, or real env value appears anywhere in the Notion update

---

## PHASE 8 — Loop return

After a successful sync:
→ Return to `TASK_SELECTION_LOOP`
→ Update the session's loop health indicators (tasks completed, blocks encountered)
→ If running in nightly mode: pass the sync summary to the nightly report generator (see `auto-nightly.md` Phase 8)

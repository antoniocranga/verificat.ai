---
description: TASK_SELECTION_LOOP
---

# TASK_SELECTION_LOOP — verificat.xyz

Invoked from: `master.md` (step 1), or after `FAILURE_RECOVERY_LOOP` resolves.

Read `CONSTITUTION.md`, `RULES.md`, and `GEMINI.md` before any action in this loop.

---

## PHASE 1 — Read governance documents

Before querying Notion, confirm you have read (this session):

- `CONSTITUTION.md` — if anything in the backlog conflicts with it, the Constitution wins
- `RULES.md` — pnpm, strict TS, Conventional Commits, RLS-in-same-PR
- `GEMINI.md` — operating manual

If this is your first action of the session: read all three now.

---

## PHASE 2 — Query the Engineering Backlog

Query Notion Engineering Backlog database with:

```
Filter:
  Status = "Not started" OR Status = "Todo"
  AND Dependencies are all Status = "Done" (or task has no dependencies)

Sort:
  1. Priority ascending: P0 → P1 → P2 → P3
  2. Phase ascending: Phase 1 → Phase 2 → ... → Phase 9
  3. Complexity ascending (prefer smaller tasks when priority is equal)

Exclude:
  - Tasks with Status = "Blocked"
  - Tasks with Status = "In Progress" (already claimed)
  - Tasks with Status = "Done"
  - Tasks where Agent Claimed = true AND the claim is current (not stale > 2h without progress)
```

---

## PHASE 3 — Dependency validation

For each candidate task returned:

1. Read the **Dependencies** field
2. For each declared dependency:
   - Fetch the linked task/Epic from Notion
   - Check Status
3. Decision table:

| Dependency status | Action |
|---|---|
| All done | Task is eligible — continue |
| Any P0 dependency not Done | Skip this task; mark it "Blocked" with note "P0 dependency [ID] not Done" |
| Non-P0 dependency not Done | Flag as a risk in Technical Notes; task may still be eligible if the implementation does not require the dependency to be complete |
| Dependency task not found in Notion | STOP on this task; create a "Missing dependency reference" clarification task; mark original task Blocked |

---

## PHASE 4 — Required field check

For each eligible task, verify all required fields are non-empty:

| Field | Required? |
|---|---|
| Description | Yes — block if missing |
| Acceptance Criteria | Yes — block if missing |
| Technical Notes | Optional before planning |
| Dependencies | Yes (may be "none") — block if entirely absent |
| Security Considerations | Yes for tasks touching auth/RLS/API/infra/secrets; optional otherwise |
| Testing Requirements | Yes — block if missing |

If a required field is missing:
→ Do NOT start work on the task.
→ Set Status = "Blocked"
→ Add a comment: "Blocked: [field name] is missing. Cannot start until a human fills this field."
→ Skip to the next candidate.

---

## PHASE 5 — Task selection

From the validated, eligible candidate list, select:

```
IF any P0 task is eligible:
  → Select exactly 1 P0 task. Do not select additional tasks.

ELSE IF any P1 task is eligible:
  → Select up to 2 P1 tasks (only if they are independent — different components, no shared files).

ELSE:
  → Select up to 3 P2/P3 tasks (only if independent from each other).
```

**Do not select tasks from Phase N+2 or beyond** if there are unfinished tasks in Phase N or Phase N+1, unless they are explicitly marked as independent of phase order in their Dependencies field.

---

## PHASE 6 — Claim and status update

For each selected task:

1. Set `Agent Claimed` = true in Notion
2. Set Status = "In Progress"
3. Add a note in Technical Notes: "Agent claimed at [timestamp UTC]. Planning begins."

---

## PHASE 7 — Output and handoff

Output:

```
SELECTED TASKS:
- Task ID: [VAI-NNN]
  Name: [Task Name]
  Priority: [P0/P1/P2/P3]
  Phase: [Phase N]
  Dependency validation: PASSED
  Missing fields: NONE
  Reason for selection: [e.g. highest priority, no P0/P1 exist]

SKIPPED/BLOCKED TASKS:
- Task ID: [VAI-NNN] — BLOCKED: [reason]
```

Hand off each selected task to `TASK_PLANNING_LOOP`.

---

## IDLE CONDITION

If no tasks are eligible after Phases 2–4:

1. Log: "No actionable tasks found. All tasks are either Blocked, In Progress, Done, or missing required fields."
2. Wait 30–60 seconds.
3. Re-query Notion.
4. If after 3 re-queries nothing is available: stop the loop and surface the idle state to a human.

Do NOT invent tasks, pick tasks with failed dependency checks, or start tasks with missing required fields just to avoid idling.
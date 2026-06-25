---
description: FAILURE_RECOVERY_LOOP
---

# FAILURE_RECOVERY_LOOP — verificat.xyz

Invoked from: `master.md` when any loop in the cycle encounters a blocking failure that cannot be resolved within the current task's scope.

Do not use this loop for routine "task is blocked" states — those are handled within each loop. This loop is for failures that require external input, environment recovery, or incident-level response.

---

## FAILURE CLASSIFICATION

First, classify the failure:

| Class | Examples | Response |
|---|---|---|
| **A — Environment failure** | CI is broken across all tasks; Supabase is unreachable; Notion API is down | Phase 1: environment triage |
| **B — Task-specific implementation failure** | Build fails on a specific package; test fails for a specific task | Phase 2: task-specific recovery |
| **C — Security incident** | Secret found in a committed file; RLS bypass discovered; compromised credential | Phase 3: security incident response |
| **D — Constitution conflict** | Task description or PR asks agent to do something that violates CONSTITUTION.md | Phase 4: constitution flag |
| **E — Dependency deadlock** | P0 task cannot proceed; its P0 dependency cannot proceed; no alternative work exists | Phase 5: deadlock resolution |

---

## PHASE 1 — Environment failure

If the failure is systemic (multiple tasks/packages affected):

1. Document current system state:
   - Which service is unreachable
   - Last known working state (last successful CI run, last known Supabase health)
   - Timestamp of first failure detection

2. Create a Notion incident task:
   - Name: "Incident: [service] unreachable — [timestamp]"
   - Priority: P0
   - Description: what is failing, what was last working, suspected cause
   - Status: "In Progress" (agent owns investigation)

3. Attempt recovery:
   - For CI: check recent commits for the breaking change; if identifiable, create a revert task
   - For Supabase: check status page; if Supabase-side, document and wait; do not attempt workarounds that bypass RLS

4. If recovery is not possible within 15 minutes of agent effort:
   - Set incident task to "Blocked"
   - Add comment: "Requires human intervention. Unable to restore environment autonomously."
   - STOP. Do not continue the loop with a broken environment.

---

## PHASE 2 — Task-specific failure

If the failure is isolated to a specific task:

1. **Set the task Status = "Blocked"** in Notion immediately.

2. **Create three Notion tasks** (all linked to the original Task ID via Dependencies):

   **A. Root Cause Analysis task**
   - Name: "RCA: [failure description] — [original Task ID]"
   - Priority: match original task
   - Description: what failed, error output (sanitised — no secrets), what was tried
   - Status: "Todo"

   **B. Fix Implementation task**
   - Name: "Fix: [failure description] — [original Task ID]"
   - Priority: match original task (escalate to P0 if the failure blocks Phase N from completing)
   - Dependencies: RCA task must be "Done" first
   - Status: "Todo" (not "In Progress" — RCA must come first)

   **C. Prevention/Hardening task** (create only if the failure reveals a systemic gap)
   - Name: "Prevent: [class of failure] — originated from [original Task ID]"
   - Priority: P2
   - Description: what systemic gap the failure exposed (e.g. missing test type, missing CI check)
   - Status: "Todo"

3. **Add a note to the original task's Technical Notes:**
   "FAILURE RECOVERY at [timestamp UTC]: [failure description]. Recovery tasks created: RCA=[task ID], Fix=[task ID], Prevention=[task ID]."

4. **Re-enter `TASK_SELECTION_LOOP`** — the RCA task will be the next eligible task (same priority as original).

---

## PHASE 3 — Security incident

If the failure involves a security issue (secret exposure, broken auth, RLS bypass, SSRF, data leak):

1. **Immediate containment (do this before any Notion update):**
   - If a secret is in a committed file: do NOT push further commits. Do not attempt to rewrite git history alone — flag for human.
   - If a Supabase key is exposed: the key must be treated as compromised and rotated immediately. Document this in Notion → Security Architecture & Review, not in a git commit.
   - If an RLS bypass is discovered: do NOT deploy the change. Set the task to "Blocked" and document the bypass pattern precisely.

2. **Create a Notion security incident entry** in Security Architecture & Review:
   - What was exposed or vulnerable
   - How it was discovered
   - Timestamp
   - Containment action taken

3. **Create security fix tasks** (P0):
   - One task for the immediate fix (rotate key, patch policy, etc.)
   - One task for the systemic prevention (CI check, code review rule, etc.)
   - Link both to the incident entry

4. **Do NOT mark any work Done** from the original task until the security issue is resolved.

5. **Surface to human immediately** — security incidents are not resolved autonomously. The agent documents and contains; a human signs off on the fix.

---

## PHASE 4 — Constitution conflict

If the failure is that a task description, PR, or instruction conflicts with CONSTITUTION.md:

1. State the specific conflict:
   - The task/instruction that conflicts
   - Which article/clause of the Constitution it conflicts with
   - Why it is a conflict (not merely an inconvenience)

2. Set the task to "Blocked" with comment: "Blocked: Constitution conflict. [Article X.Y] prohibits [action]. This requires human sign-off before proceeding."

3. Do NOT attempt to resolve the conflict by choosing the more permissive interpretation.

4. Do NOT implement a workaround that achieves the same effect while technically avoiding the literal Constitution violation.

5. STOP. Surface the conflict to a human. Wait for explicit sign-off.

---

## PHASE 5 — Dependency deadlock

If all available P0/P1 tasks are blocked waiting for each other or for a human decision:

1. Map the deadlock:
   - List each blocked task and what it is blocked on
   - Identify whether any task can be partially started (front-end work while back-end is blocked, etc.)

2. Create a Notion task:
   - Name: "Dependency deadlock analysis — [timestamp]"
   - Priority: P0
   - Description: the deadlock map, any partial options identified
   - Status: "Todo"

3. Work on any P2/P3 tasks that are genuinely independent of the deadlocked cluster.

4. If no independent work exists: STOP. Surface to human. Do not invent tasks or start work that is not in the backlog.

---

## RECOVERY CONFIRMATION

Before re-entering the main loop after a recovery action:

- [ ] Original failure is documented in Notion (task Technical Notes or incident entry)
- [ ] Recovery tasks are created and linked
- [ ] No task has been marked Done that had a blocking failure
- [ ] No security issue has been left uncontained
- [ ] Human has been notified if the failure was Class C (security) or Class D (Constitution conflict)

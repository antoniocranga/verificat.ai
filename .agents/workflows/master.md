---
description: FULL_ENGINE_LOOP
---

# FULL_ENGINE_LOOP — verificat.xyz

This is the master orchestration document. It defines the order of loops, the conditions for transitioning between them, and the hard stops that require human intervention.

Read `CONSTITUTION.md`, `RULES.md`, `GEMINI.md`, `SECURITY.md`, `PERFORMANCE.md`, and `DESIGN.md` before starting this loop. The Constitution overrides everything.

---

## The loop

```
START
│
├─► TASK_SELECTION_LOOP           (task-picking.md)
│   │  Selects 1–3 eligible tasks from Notion backlog
│   │  Sets Status = "In Progress"
│   │
│   ├─ No tasks available → IDLE (wait 30–60s, re-query)
│   └─ Task(s) selected → for each task:
│
├─► TASK_PLANNING_LOOP            (task-planning.md)
│   │  Validates task fields + dependencies
│   │  Runs Constitution pre-check
│   │  Produces file-level plan in Notion Technical Notes
│   │
│   ├─ Plan fails Constitution check → HARD STOP (human required)
│   ├─ Required field missing → mark Blocked, back to TASK_SELECTION_LOOP
│   └─ Plan approved → proceed
│
├─► TASK_IMPLEMENTATION_LOOP      (implementation.md)
│   │  Implements plan incrementally
│   │  Runs build + typecheck + lint
│   │  Produces implementation summary
│   │
│   ├─ Build broken → FAILURE_RECOVERY_LOOP (class B)
│   ├─ Secret found in commit → FAILURE_RECOVERY_LOOP (class C)
│   └─ Build passes → proceed
│
├─► SECURITY_CHECK_LOOP           (security-validation.md)
│   │  Per-layer security checks (API, web, extension, mobile, infra)
│   │  Reviews Security Considerations field
│   │
│   ├─ Security issue found → mark Blocked → create fix task → TASK_SELECTION_LOOP
│   └─ All checks pass → proceed
│
├─► TEST_VALIDATION_LOOP          (task-validation.md)
│   │  Runs applicable test types (unit, RLS, auth, golden set, e2e)
│   │  Performance validation for pipeline tasks
│   │
│   ├─ Tests fail → mark Blocked → back to TASK_IMPLEMENTATION_LOOP (or TASK_SELECTION_LOOP for fix task)
│   └─ All tests pass → proceed
│
├─► COMPLETION_VALIDATION_LOOP    (completion.md)
│   │  Final acceptance criteria check
│   │  Code hygiene checklist
│   │  Verdict integrity check (if applicable)
│   │  Romanian language check (if applicable)
│   │  Dependency unblocking check
│   │
│   ├─ Any check fails → mark Blocked → back to TASK_IMPLEMENTATION_LOOP
│   └─ All checks pass → proceed
│
├─► NOTION_SYNC_LOOP              (notion-sync.md)
│   │  Writes implementation summary
│   │  Updates Status, Technical Notes, Testing Requirements, Security Considerations
│   │  Marks dependent tasks eligible
│   │  Sets Status = "Done" (if all checks passed)
│   │
│   └─ Sync complete → back to TASK_SELECTION_LOOP
│
└─ (repeat)
```

---

## Hard stops — require human before loop can continue

These conditions halt the loop. The agent documents the state clearly and waits for explicit human instruction before resuming:

| Condition | Where it occurs | Action |
|---|---|---|
| Constitution conflict | TASK_PLANNING_LOOP Phase 2 | STOP. Flag conflict precisely. Wait for sign-off. |
| Security incident (secret exposed, RLS bypass) | SECURITY_CHECK_LOOP Phase 7 / FAILURE_RECOVERY_LOOP Phase 3 | Contain. Document. STOP. Wait for human. |
| Database migration that drops or alters columns with existing data | TASK_IMPLEMENTATION_LOOP | STOP. Present migration plan. Wait for explicit approval. |
| Force-push or git history rewrite on a shared branch | Any | STOP. Not permitted. Flag for human. |
| Production deploy or DNS change | Any | STOP. Not permitted by agent. Flag for human. |
| New third-party dependency that handles user data or has network access | TASK_PLANNING_LOOP | STOP. Present the dependency + justification. Wait for approval. |
| Credential encountered outside Infisical | Any | Do not re-emit it. Do not write it to a file. Flag for rotation. STOP. |
| No tasks in backlog AND no dependency deadlock path | TASK_SELECTION_LOOP | Surface idle state to human with backlog analysis. |

---

## Loop health indicators

Maintain these counters across the session and surface them in nightly reports:

| Indicator | Threshold to flag |
|---|---|
| Tasks completed this session | Informational |
| Tasks blocked this session | > 3 blocks → flag systemic issue |
| Security issues found | Any → flag immediately |
| Constitution conflicts | Any → hard stop (already handled above) |
| Missing required fields in Notion | > 2 → flag backlog hygiene issue to human |
| Golden set regression detected | Any → flag immediately, block pipeline PR |
| P50 latency budget breached | Any → block pipeline PR |

---

## Nightly / scheduled variant

See `auto-nightly.md` for the scheduled variant of this loop. It adds:
- System snapshot and health scoring
- Backlog optimisation (splitting oversized tasks, removing duplicates)
- Proactive quality and security audit
- Codebase improvement identification
- Observability and log anomaly detection
- Nightly report generation in Notion

The nightly loop runs the same core sequence above but adds phases before and after, with a fixed time budget (60–180 minutes).

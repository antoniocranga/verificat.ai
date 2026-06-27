---
description: AUTONOMOUS_NIGHTLY_ENGINE_LOOP
---

EXECUTION WINDOW:
- Runs once per night (or on scheduled trigger via CI / cron / Antigravity automation)
- Timebox: 60–180 minutes max execution cycle

HARD RULE:
Read GEMINI.md, RULES.md, and CONSTITUTION.md before any action.
If any conflict exists → CONSTITUTION.md overrides everything.

---

# PHASE 0 — SYSTEM SNAPSHOT

1. Pull latest state from:
   - Notion Engineering Tasks database
   - Supabase logs (if accessible)
   - Repo status (build state, recent commits, CI failures)

2. Identify:
   - Blocked tasks
   - Failed tasks
   - High-priority unfinished tasks (P0/P1)
   - Stale tasks (no updates > 3 days)
   - Regression signals (if any)

3. Output internal summary:
   - system_health_score (0–100)
   - number_of_blocked_tasks
   - number_of_incomplete_P0_P1_tasks

---

# PHASE 1 — CRITICAL FIX LOOP (P0 FIRST)

PRIORITY ORDER:
1. P0 blocked tasks
2. CI/CD failures
3. Security issues
4. Authentication issues (Supabase / JWT / RLS)
5. Data integrity issues

FOR EACH ISSUE:

1. Create mental model of root cause
2. If root cause is unclear:
   → create Notion task: "Investigate root cause: <issue>"
   → mark current item as Blocked
   → continue

3. If fix is clear:
   → implement fix in codebase
   → run logical validation
   → ensure no regression introduced

4. Update Notion:
   - Status
   - Technical Notes
   - Security Considerations
   - Testing Requirements

---

# PHASE 2 — BACKLOG OPTIMIZATION LOOP

1. Pull all Notion tasks with:
   - Status = Todo OR Blocked
   - Sorted by Priority (P0 → P3)

2. For each task:

   CHECK:
   - Are dependencies valid?
   - Is task still relevant?
   - Is task duplicated?
   - Is task too large (>8h estimate)?
   - Is task missing acceptance criteria?

3. If issues found:

   → SPLIT TASK if too large:
      - Create subtasks in Notion
      - Link to parent Task ID

   → FIX DESCRIPTION if unclear

   → MARK AS BLOCKED if dependency invalid

   → DELETE DUPLICATES (or mark deprecated if deletion not allowed)

---

# PHASE 3 — HIGH-VALUE EXECUTION LOOP (AUTO-DEVELOPMENT)

Goal: improve system even if no critical bugs exist.

Pick max:
- 1 P0 OR
- 2 P1 OR
- 3 P2/P3

Focus areas:
- performance improvements
- missing tests
- security hardening
- API consistency
- Supabase RLS improvements
- UI/UX inconsistencies

For each selected task:

1. Re-run full TASK_PLANNING_LOOP
2. Implement improvements
3. Validate security + tests
4. Sync to Notion

---

# PHASE 4 — QUALITY & SECURITY AUDIT LOOP

Scan system for:

## Backend
- Missing RLS policies
- Exposed Supabase service keys
- Unsafe API endpoints
- Missing validation

## Frontend / Extension / Mobile
- Sensitive data leaks
- Unsafe storage usage
- Missing auth guards

## Infrastructure
- Docker misconfigurations
- Missing health checks
- Weak secrets handling

IF ISSUE FOUND:

1. Create Notion Security Review entry
2. Create fix task
3. Mark system risk level (Low / Medium / High / Critical)

---

# PHASE 5 — CODEBASE IMPROVEMENT LOOP

Identify:

- Repeated logic → extract into packages/
- Large files → refactor
- Missing types → add to packages/types
- Inconsistent naming → normalize
- Dead code → mark for removal

Then:

1. Create refactor tasks in Notion
2. Implement ONLY safe low-risk refactors automatically
3. Defer high-risk refactors into backlog

---

# PHASE 6 — OBSERVABILITY & HEALTH LOOP

Check:

- logs (errors, warnings)
- API latency patterns
- failed requests
- Supabase query performance (if available)
- worker queue backlog

If anomalies detected:

1. Create Notion Incident Task
2. Attach:
   - suspected cause
   - affected component
   - severity

---

# PHASE 7 — NOTION SYNCHRONIZATION FINALIZATION

For ALL touched tasks:

Update Notion fields:

- Status
- Technical Notes
- Testing Requirements
- Security Considerations
- Estimate adjustment (if needed)

Ensure:
- No task is left in inconsistent state
- All blocked reasons are explicit
- All dependencies are valid

---

# PHASE 8 — NIGHTLY REPORT GENERATION

Create a Notion “Nightly Engineering Report”:

Include:

- Tasks completed
- Bugs fixed
- Security issues found/fixed
- New tasks created
- Blockers discovered
- System health score
- Recommendations for next cycle

---

# STOP CONDITIONS

Terminate loop early if:

- No actionable tasks exist
- System is stable AND no improvements identified
- Time limit exceeded

---

# HARD CONSTRAINTS

NEVER:
- mark task Done without Notion update
- implement without reading Acceptance Criteria
- skip security review
- ignore dependencies
- perform unsafe refactors automatically
- modify Supabase RLS without explicit reasoning

---

# ENGINEERING PRINCIPLE

You are not just executing tasks.

You are continuously evolving a production-grade system.

Every nightly loop must make the system:

- safer
- faster
- more consistent
- more secure
- more maintainable
- more production-ready

END WORKFLOW

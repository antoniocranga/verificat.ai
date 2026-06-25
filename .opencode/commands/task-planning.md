---
description: TASK_PLANNING_LOOP
---

# TASK_PLANNING_LOOP — verificat.xyz

Invoked from: `master.md` (step 2) after a task is selected and set to "In Progress" by `TASK_SELECTION_LOOP`.

Read `CONSTITUTION.md`, `RULES.md`, `SECURITY.md`, `PERFORMANCE.md`, and `DESIGN.md` before planning.
The plan produced here is written back to the task's Technical Notes in Notion and becomes the binding implementation contract.

---

## PHASE 1 — Task intake

### 1.1 Read every required field from Notion

Pull the task page and confirm all of the following fields are non-empty:

| Field | Required non-empty for |
|---|---|
| Description | All tasks |
| Acceptance Criteria | All tasks |
| Technical Notes | May be empty before planning; will be filled by this loop |
| Dependencies | All tasks |
| Security Considerations | All tasks touching auth, RLS, API, infra, secrets, mobile/extension |
| Testing Requirements | All tasks |

If **Description**, **Acceptance Criteria**, **Dependencies**, or **Testing Requirements** is empty:
→ STOP. Set task to "Blocked". Leave a comment in Notion: "Blocked: [field name] is missing. This field must be completed by a human before the agent can plan this task."
→ Re-enter `TASK_SELECTION_LOOP` to pick the next task.

### 1.2 Restate acceptance criteria in your own words

Write a one-sentence restatement of each criterion. If you cannot restate a criterion clearly, the criterion is ambiguous — treat it as missing and block the task.

### 1.3 Validate dependencies

For each item in the Dependencies field:
1. Fetch the linked Notion task or Epic
2. Verify its Status is "Done"
3. If any dependency is not "Done" and is P0 priority:
   → STOP. Set task to "Blocked". Note: "Blocked on: [task name / ID]."
4. If a non-P0 dependency is not done:
   → Flag it in Technical Notes as a risk. Do not block unless the dependency is genuinely required for the implementation to work.

---

## PHASE 2 — Constitution & rules pre-check

Before planning any implementation, answer each question explicitly:

1. **Pipeline integrity (Constitution Article I.5):** Does any part of this task risk collapsing pipeline stages into a single LLM call? If yes, flag it and redesign to keep stages separate.
2. **Verdict correctness (Constitution Article I.2):** Could this task introduce a seventh verdict value or change how any of the six canonical values are rendered? If yes, flag it.
3. **RLS (Constitution Article II.2, RULES.md §3):** Does this task touch a database table? If yes, the plan must include the RLS policy in the same PR.
4. **Secret hygiene (Constitution Article II.1):** Does this task involve credentials, API keys, or environment variables? If yes, the plan must route them through Infisical — never committed, never in `.env.example` with real values.
5. **Security gate PRs (RULES.md §2):** Is this task touching `services/`, `packages/security`, RLS policies, or auth flows? If yes, the Security Considerations field must be filled before implementation begins, and a human review is required on the PR.
6. **Performance budget (PERFORMANCE.md §1):** Does this task touch the STT/claim/retrieval/verdict pipeline? If yes, the plan must include how the change will be benchmarked against the P50 < 5s budget.
7. **Accessibility (DESIGN.md §1.5, CONSTITUTION.md Article III.5):** Does this task touch a user-facing surface? If yes, the plan must address WCAG 2.1 AA compliance for new UI elements.
8. **Romanian diacritics (DESIGN.md §1.4):** Does this task add or modify any user-facing strings? If yes, the plan must explicitly state that diacritics will be reviewed.

---

## PHASE 3 — Break task into execution steps

Produce a concrete, file-level plan. Each step must be actionable:

**Step template:**
```
Step N: [What changes]
  - Files: [explicit file paths or new file names]
  - Change: [what exactly changes and why]
  - Dependency: [what must be done before this step]
  - Security impact: [explicit statement, or "none"]
  - Test: [what test covers this change]
```

Minimum steps for most tasks:

1. **Schema / data changes** (if any) — migrations, RLS policies, type updates in `packages/types`
2. **Service / API changes** — NestJS modules, guards, DTOs, controllers, services
3. **UI / logic changes** — components, pages, state management, Flutter BLoC events/states
4. **Security validation** — confirm RLS, auth guards, rate limits, CSP, secret handling
5. **Tests** — unit tests, integration tests, golden-set regression tests (for pipeline changes)

For tasks touching the fact-verification pipeline, steps must be aligned with the pipeline stages from ADR-006:
- Speech recognition → Claim detection → Claim normalisation → Evidence retrieval → Verdict generation → Source trust scoring → Delivery

Each stage is independently testable. A plan that tests only end-to-end without stage-level tests does not satisfy the testing requirements.

---

## PHASE 4 — Risk identification

For each execution step, identify risks:

| Risk | Likelihood | Mitigation in this plan |
|---|---|---|
| RLS policy too permissive | Medium | Automated test for both allowed and denied roles |
| STT latency regression | Low–Medium | Benchmark before and after in staging |
| Diacritic rendering broken | Low | Add fixture with ă â î ș ț to story/test |
| Secret exposed in logs | Low | Input/output logging scrubs credentials; verify in plan |
| Dependency not actually done | Medium | Checked in Phase 1; flag if uncertain |

---

## PHASE 5 — Write plan back to Notion

Update the task's **Technical Notes** field with:

1. The plan (Steps 1–N from Phase 3 above)
2. The Constitution/rules pre-check results (Phase 2)
3. The risk table (Phase 4)
4. The restated acceptance criteria (Phase 1.2)

This is an **APPEND** operation if Technical Notes has existing content — never overwrite existing notes from a prior planning session without preserving them under a dated header.

---

## PHASE 6 — Final gate before handing off to implementation

Confirm:

- [ ] All required Notion fields are non-empty
- [ ] All dependencies are Done (or non-P0 risks documented)
- [ ] Constitution pre-check passed with no unresolved flags
- [ ] Plan includes a step for every acceptance criterion
- [ ] Plan includes a test for every implementation step
- [ ] Technical Notes updated in Notion

If all pass → hand off to `TASK_IMPLEMENTATION_LOOP`.
If any fail → STOP, set task to "Blocked", document reason, re-enter `TASK_SELECTION_LOOP`.

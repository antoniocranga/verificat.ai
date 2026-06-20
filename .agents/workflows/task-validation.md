---
description: TEST_VALIDATION_LOOP
---

# TEST_VALIDATION_LOOP — verificat.xyz

Invoked from: `master.md` (step 5), after `SECURITY_CHECK_LOOP` passes.

This is a blocking gate. The task does not proceed to `COMPLETION_VALIDATION_LOOP` or `NOTION_SYNC_LOOP` until this loop passes.

Read `RULES.md` §4 and `PERFORMANCE.md` before running checks.

---

## PHASE 1 — Read Testing Requirements

1. Retrieve the task's **Testing Requirements** field from Notion.
2. If the field is empty → STOP. Set task to "Blocked". Reason: "Testing Requirements field is empty. Cannot validate tests without knowing what is required."
3. Parse each stated requirement and map it to a test type below.

---

## PHASE 2 — Test type matrix

Run all applicable test types. "Not applicable" must be stated explicitly — do not silently skip.

### 2.1 Unit tests

Applies to: any pure function, BLoC state transition, NestJS service method, LLM prompt utility.

```bash
turbo run test --filter=<affected-package>
```

Required coverage: every new function or method introduced in this task has at least one test for:
- Happy path
- Edge case (empty input, null, boundary value)
- Failure mode (invalid input, error thrown/returned)

BLoC state tests (Flutter):
- Every new `Event` → `State` transition has a corresponding `bloc_test` case
- The live-listening pipeline (listening → processing → verdict-ready → error) must be fully covered

### 2.2 RLS policy tests

Applies to: any task that adds or modifies a Supabase RLS policy.

```bash
# From services/api or packages/security — use the project's RLS test runner
pnpm turbo run test:rls --filter=<package>
```

For each policy: assert BOTH:
- Role that should have access: can read/write
- Role that should NOT have access: receives a denial (not a silent empty result — a denial)

The `anon` role MUST be tested for every table that contains user data.

### 2.3 Auth flow tests (integration)

Applies to: any task in Phase 2 (Auth & Supabase) or any task touching auth guards, token handling, OAuth.

Run against a staging-like environment — not mocked end-to-end:
```bash
turbo run test:e2e --filter=apps/web
# or
turbo run test:integration --filter=services/api
```

Flows to cover:
- Email signup → verify → login → access protected route
- OAuth round-trip (at least one provider, in staging OAuth app)
- Token refresh (force expiry and confirm refresh works)
- Token revocation (logout → confirm protected routes reject the old token)

### 2.4 Fact-verification pipeline regression tests (golden set)

Applies to: any task touching claim detection, evidence retrieval, verdict generation, source trust scoring, or STT post-processing.

```bash
turbo run test:golden --filter=packages/fact-verification
```

The golden set is a maintained collection of known Romanian claims with expected verdict ranges. After every pipeline change:
- Run the golden set
- Confirm that no claim's verdict has moved more than one level from its expected range (e.g. `True` → `Mostly True` is a warning; `True` → `False` is a failing regression)
- Confirm end-to-end latency for each golden claim is within the P50 < 5s budget (PERFORMANCE.md §1)
- Log the full golden set output in the Notion task's Technical Notes

If the golden set does not exist yet (Phase 4 task): creating the initial golden set IS a testing requirement — it must be created in the same PR as the first pipeline implementation.

### 2.5 Extension cross-browser smoke test

Applies to: any task touching `apps/extension`.

Manual (until automated):
- [ ] Chrome: install unpacked → trigger capture → verdict displayed correctly
- [ ] Firefox: install temporary add-on → trigger capture → verdict displayed correctly
- [ ] Edge: install unpacked → verify no broken permissions
- [ ] Brave: install unpacked → verify audio capture permission granted correctly

Document results in the Notion task's Testing Requirements field.

### 2.6 Mobile widget and integration tests

Applies to: any task touching `apps/mobile`.

```bash
# Widget tests
flutter test test/
# Integration test (live-listening happy path)
flutter drive --target=test_driver/live_listening_test.dart
```

Every new BLoC has widget tests covering:
- All states render without exceptions
- Loading, error, and empty states render correctly
- Romanian text (with diacritics) renders in all states

The live-listening integration test runs before each mobile release.

---

## PHASE 3 — Performance validation (pipeline tasks only)

For any task touching the STT/claim/retrieval/verdict pipeline:

1. Run the pipeline against the golden set and record per-stage latency.
2. Compare against PERFORMANCE.md §1 budgets.
3. If any stage is over budget → the task is not done. Create a Notion task: "Performance: [stage] exceeded budget in [Task ID]" and link it.
4. If end-to-end P50 is > 5s → merge is blocked until the regression is explained and a fix task is created.

---

## PHASE 4 — Missing tests protocol

If a required test type is missing (not written, not run):

→ Do NOT mark the task Done.
→ Create a follow-up Notion task:
   - Name: "Add missing tests: [test type] for [original Task ID]"
   - Priority: match the original task's priority
   - Dependencies: original task
   - Testing Requirements: the specific tests that need to be written

→ If the missing tests are for a security-critical path (RLS, auth): the original task is Blocked (not Done) until the tests exist.
→ If the missing tests are non-security: the original task may proceed to Done, but the follow-up task must be created and linked before marking Done.

---

## PHASE 5 — Decision

### If ALL required tests pass:
→ Set test validation status = PASSED in implementation summary
→ Proceed to `COMPLETION_VALIDATION_LOOP`

### If ANY required test fails:
1. Set task Status = "Blocked"
2. Document in Testing Requirements: "BLOCKED at [timestamp]: [test name] failed. Details: [error output or description]."
3. Create a fix task in Notion if the failure reveals a bug (not just a missing test)
4. Re-enter `TASK_IMPLEMENTATION_LOOP` to fix the failure, or `TASK_SELECTION_LOOP` if the fix requires a separate task

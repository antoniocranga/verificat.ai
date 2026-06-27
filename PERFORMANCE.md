# PERFORMANCE.md — verificat.xyz Performance Budgets & Rules

This document defines the performance budgets, latency targets, and measurement standards for verificat.xyz. `RULES.md` §8 references this file for the headline numbers; this file provides the full detail.

If a PR regresses any budget defined here in a staging benchmark, it **blocks merge** until investigated — not until fixed, but until there is a documented explanation. "It's probably fine" is not an explanation.

---

## 1. Core pipeline latency budget

The most important performance constraint in this system is the end-to-end latency from audio input to displayed verdict. This is a product correctness requirement (Constitution Article I), not merely a developer experience nicety.

| Stage | Budget | Notes |
|---|---|---|
| STT transcription (streaming, first-word) | < 300 ms | Deepgram Nova-3 streaming latency target (ADR-006) |
| Claim detection | < 200 ms | In-process NestJS service; should not require a network round-trip |
| Claim normalisation | < 150 ms | LLM sub-task call; scoped, logged, not an end-to-end prompt |
| Evidence retrieval | < 1 500 ms | pgvector + OpenSearch combined; P50 target |
| Verdict generation | < 1 000 ms | LLM sub-task call with constrained output schema |
| Source trust scoring | < 300 ms | Should be a cache-first lookup; network only on cache miss |
| API response + client render | < 500 ms | Includes NestJS serialisation and Next.js/Flutter render |
| **End-to-end P50** | **< 5 000 ms** | **Hard requirement (Constitution Article I.3, RULES.md §8)** |
| **End-to-end P50 stretch** | **< 2 000 ms** | Stretch target; design for it, measure toward it |
| End-to-end P99 | < 10 000 ms | Graceful degradation threshold (show transcript, stream verdict) |

> **Measurement baseline:** These budgets are measured in staging under simulated real network conditions (not localhost), with at least 50 concurrent requests. A single favourable benchmark run does not satisfy the target; the P50 must hold across a 10-minute load test run.

---

## 2. Graceful degradation contract

When the pipeline cannot meet the P50 target:

1. **Display the STT transcript immediately** (as soon as the first sentence is complete) — do not hold the UI blank while waiting for the verdict.
2. **Stream the verdict in** once it is ready, with a visible loading indicator.
3. **If verdict exceeds P99 (10s):** surface a `Unverified` result with an explanation ("Unable to retrieve sufficient evidence in time") rather than blocking the user indefinitely.
4. **Never silently discard a verdict** in progress — if a timeout fires, log it as a pipeline miss for monitoring.

This contract is not optional UX polish. A pipeline that blocks the user past 10 seconds and shows nothing is broken, regardless of whether the eventual verdict would have been correct.

---

## 3. Web application budgets (public-facing pages)

| Metric | Target | Applies to |
|---|---|---|
| Largest Contentful Paint (LCP) | < 2.5 s (Good band) | Marketing pages (`/`, `/about`, `/how-it-works`) |
| Cumulative Layout Shift (CLS) | < 0.1 (Good band) | All pages |
| Interaction to Next Paint (INP) | < 200 ms (Good band) | All interactive pages |
| First Contentful Paint (FCP) | < 1.8 s | Marketing pages |
| Time to First Byte (TTFB) | < 600 ms | All server-rendered pages |
| JS bundle size (initial load) | < 150 KB gzipped | Marketing pages (non-app routes) |
| JS bundle size (app routes) | < 300 KB gzipped | Authenticated app pages |

These are **SEO and conversion requirements** for the marketing pages, not developer preferences. A Core Web Vitals "Poor" score on the landing page is a launch blocker.

### Measurement method

- Run Lighthouse CI against staging in every PR that touches `apps/web`.
- Use `web-vitals` library for field measurement in production (once launched) and report to the monitoring stack.
- PageSpeed Insights score is a useful sanity check but not the primary gate — lab data from Lighthouse CI is.

---

## 4. Mobile application budgets

| Metric | Target | Notes |
|---|---|---|
| App cold start to interactive | < 2 s | Measured on a mid-range Android device (≥ 2019 era) |
| App warm start to interactive | < 800 ms | |
| Live-listening activation (mic permission → first transcript word displayed) | < 1 s | Foreground-service startup overhead included |
| Verdict screen render after data received | < 100 ms | Flutter widget rebuild budget |
| Memory usage (background listening) | < 120 MB RSS | Android; iOS limits are OS-enforced, document per-version |
| Battery consumption (30 min continuous listening) | < 3% above baseline | Measured on a reference device in the CI/device farm |

---

## 5. Browser extension budgets

| Metric | Target | Notes |
|---|---|---|
| Extension popup open to interactive | < 200 ms | Measured from click to usable UI |
| Side panel load | < 500 ms | On a standard tab, not a media-heavy tab |
| Background service worker memory | < 30 MB | Idle; spike to 80 MB during active transcription is acceptable |
| Tab audio capture start latency | < 500 ms | From user activating capture to first audio chunk sent |

---

## 6. API and backend budgets

| Metric | Target | Notes |
|---|---|---|
| Health check endpoint (`/health`) | < 50 ms P99 | No DB or cache call; in-process only |
| Authenticated CRUD endpoints | < 300 ms P95 | Supabase read; no heavy joins |
| Queue job pickup latency (BullMQ) | < 500 ms | Time from job enqueue to worker dequeue |
| Search endpoint (pgvector + OpenSearch) | < 1 500 ms P50 | As budgeted in §1 |
| WebSocket verdict push to client | < 100 ms after verdict is generated | Server-to-client delivery; not pipeline latency |

---

## 7. Performance regression rules

1. **Any change that regresses a P50 latency budget in a staging benchmark blocks merge** until the regression is explained in the PR description with a root-cause analysis. "I'll look at it later" is not sufficient — open a Notion task, link it from the PR, and get it assigned before merge.

2. **Load tests must be run** before any Phase 4 (Fact Verification Engine) change is merged. Running the pipeline against a handful of test cases is not a load test.

3. **Performance budgets are measured against staging**, not localhost. What is fast on localhost with mocked dependencies is irrelevant.

4. **If a budget cannot be met** for a legitimate architectural reason (e.g. a specific rare-language claim genuinely requires extra retrieval time), document it as a known exception in Notion → Risks & Technical Debt with a deadline phase for improvement. Do not silently widen the budget.

---

## 8. Monitoring & observability requirements

Performance without measurement is not performance — it's hope. The following must be in place before Phase 8 closes:

- **OpenTelemetry traces** wired into every NestJS service from Phase 1 (T1.6 task set), surfaced in Grafana Tempo or Jaeger.
- **Prometheus metrics** exported per service: request count, latency histogram (P50/P95/P99), error rate, queue depth.
- **Latency histograms** broken down by pipeline stage (STT, claim-detect, retrieval, verdict, delivery) — not just end-to-end total.
- **Grafana dashboards** with alert thresholds at P95 budget values (alert fires before P99 is breached).
- **Sentry performance** enabled for `apps/web` and `apps/mobile`; `tracesSampleRate` set appropriately (not 1.0 in production).
- **Lighthouse CI** configured as a required PR check for `apps/web`.

---

## 9. Cost-as-performance (STT at scale)

Real-time STT has per-minute pricing (Deepgram, Azure Speech). At scale, cost becomes a performance constraint because per-user caps and circuit breakers affect user-visible latency:

- **Usage caps** per user/organisation must be implemented in Phase 7 (Admin Dashboard).
- **Cost monitoring** must surface in the Admin Dashboard alongside latency metrics.
- **Whisper self-hosted fallback** (ADR-006) is available for cost-sensitive or batch workloads; the routing logic to engage it must not add more than 200 ms of overhead to the pipeline decision.
- **Cost anomaly alerts** (e.g. a single user consuming 10× expected STT minutes) must fire before the budget is exhausted, not after.

# ADR-006: WAF Product Decision

## Status
Accepted

## Context
The Security Architecture & Review page identifies WAF (Web Application Firewall) product choice as an open security decision that must be resolved before Phase 8 (Production Readiness) begins. The project already uses Traefik as its reverse proxy on a VPS, and needs a WAF layer to protect against common web attacks (SQL injection, XSS, CSRF, rate-limiting bypass, etc.) before production launch.

## Options Considered

### Option 1: Traefik + CrowdSec
- CrowdSec is an open-source, community-driven WAF that integrates natively with Traefik via Traefik's middleware plugin system.
- Deployed as a sidecar container alongside Traefik.
- CrowdSec's scenario engine ships with OWASP Core Rule Set-like detection out of the box, plus community-contributed scenarios.
- Remediation decisions (ban/block/captcha) are enforced by Traefik middleware that queries CrowdSec's Local API (LAPI).

### Option 2: Managed WAF (Cloudflare, AWS WAF, etc.)
- A vendor-managed WAF that sits in front of the VPS.
- Requires DNS changes, TLS termination hand-off, and adds a third-party dependency to every request's critical path.
- Monthly cost scales with request volume and rule complexity.
- Vendor lock-in for rule configuration, alert routing, and incident response workflows.

## Decision
**Chosen: Option 1 — Traefik + CrowdSec**

Rationale:
1. **Architecture alignment** — Traefik is already the reverse proxy. Adding CrowdSec as a sidecard container does not change the request path, TLS termination, or deployment model.
2. **VPS-first, self-hosted posture** — Consistent with ADR-001 (self-hosted LLM inference), ADR-004 (self-hosted container registry mirror), and ADR-005 (self-hosted monitoring stack). Avoids vendor lock-in for a core security control.
3. **No additional latency** — CrowdSec lives on the same Docker network; no external DNS lookup or third-party hop.
4. **Cost** — CrowdSec is free and open-source. Operating cost is marginal (CPU/RAM for the CrowdSec container).
5. **Community signals** — Multiple public incidents from managed-WAF reliance (e.g., Cloudflare routing failures blocking all traffic) motivate keeping the WAF on the same stack the operator controls.

## Consequences
1. The CrowdSec container must be added to `docker-compose.yml` and wired into Traefik via the `crowdsec-bouncer-traefik-plugin` middleware.
2. Regular CrowdSec scenario updates must be pulled (CrowdSec auto-updates its hub by default).
3. Alerting must route CrowdSec decisions to the same notification channel used for Sentry and Grafana alerts.
4. If CrowdSec proves insufficient against targeted attacks, the team may re-evaluate a managed WAF as a secondary layer behind CrowdSec — but this is not required for MVP launch.
5. No additional third-party data processing agreements; PII stays on the VPS.

# ADR-007: SSL Pinning Strategy for Mobile App

## Status

Accepted

## Context

The Security Architecture & Review page identifies SSL pinning as an open decision that must be resolved in Phase 6 (Mobile Apps), not deferred to Phase 8, because the pinning mechanism is baked into the mobile architecture from the start. Three concerns drive this ADR:

1. **MITM protection**: The app transmits auth tokens (via Supabase) and audio recordings containing potential PII. An untrusted CA or compromised intermediate CA could allow a MITM to intercept these.
2. **Rotation without breakage**: If the server certificate or CA changes, old app versions that pin to the old cert will be bricked. The pinning approach must include a rotation strategy that avoids this.
3. **Backend architecture**: The app communicates exclusively with `api.verificat.xyz` over HTTPS via Traefik (TLS termination), which presents a Let's Encrypt certificate. No third-party API hosts are called from the mobile client except the Supabase endpoint (`*.supabase.co`).

## Options Considered

### Option 1: Certificate Pinning (Single Leaf Cert)

- Pin the SHA-256 hash of the Let's Encrypt leaf certificate presented by `api.verificat.xyz`.
- **Pro**: Strongest guarantee — only the exact cert is accepted.
- **Con**: Every cert renewal (every 90 days for Let's Encrypt) requires an app update. A mid-cycle rotation bricks old app versions.

### Option 2: Public-Key Pinning (SPKI Hash of Intermediate CA)

- Pin the SHA-256 hash of the Subject Public Key Info (SPKI) of the R3 (Let's Encrypt) intermediate CA.
- **Pro**: Survives leaf-cert renewal — any leaf signed by R3 is accepted.
- **Con**: Requires updating the pin if Let's Encrypt rotates their intermediate CA (rare, ~every 5 years). An app update is still needed for CA rotation, but the window is much longer.

### Option 3: Public-Key Pinning with Backup Pins

- Pin two SPKI hashes: one for the current R3 intermediate and one for a backup (e.g., the ISRG Root X1 or a future R4).
- **Pro**: Graceful rotation — if R3 is replaced by R4, the backup pin keeps the app working without an update.
- **Con**: Slightly more complex configuration. Two pins must be managed.

### Option 4: No Pin (HTTPS-only, Certificate Transparency)

- Rely on standard HTTPS validation via the OS trust store and Certificate Transparency (CT) enforcement.
- **Pro**: Zero maintenance, no bricking risk, no app updates needed for cert changes.
- **Con**: Vulnerable to CA compromise or malicious CA issuance for the domain.

## Decision

**Adopt Option 3: Public-Key Pinning with Backup Pins.**

The SPKI hashes will be computed from:

- **Primary pin**: Let's Encrypt R3 intermediate CA SPKI hash.
- **Backup pin**: ISRG Root X1 SPKI hash.

### Rotation Plan

1. **Routine leaf renewal** (every 90 days): No action needed — pinning the intermediate CA SPKI means any leaf signed by R3 is accepted.
2. **Intermediate CA rotation** (rare, ~5-year cycle): One year before the expected switch, the new CA's SPKI hash is added as a third pin in a regular app update. After the switch, the old R3 pin is removed in the following release. The backup ISRG Root X1 pin remains as long-term insurance.
3. **Emergency rotation** (CA compromise): Push a hotfix app update with updated pins. The backup pin ensures the app continues working during the window between compromise detection and hotfix distribution.

### Supabase Endpoint

The Supabase endpoint (`*.supabase.co`) uses a Cloudflare-managed certificate. Supabase already enforces HTTPS and uses HSTS. For the MVP, the Supabase endpoint will use OS trust-store validation only (no custom pin), because:

- Supabase handles their own cert lifecycle.
- Pinning a third-party CDN certificate would introduce unacceptable breakage risk during Supabase infrastructure changes.
- All sensitive data (auth tokens) exchanged with Supabase is already encrypted in transit via HTTPS.

The security posture is acceptable because the primary attack surface is the custom API domain (`api.verificat.xyz`), which carries audio recordings and verdict data. The Supabase channel is limited to auth tokens, which are short-lived (JWT with 1-hour expiry) and scoped.

## Consequences

1. **Pro**: The app will survive leaf-cert renewals without updates.
2. **Pro**: Intermediate CA rotation is handled gracefully via the backup-pin mechanism.
3. **Con**: If Let's Encrypt's R3 intermediate is compromised, P0 hotfix must be shipped.
4. **Con**: Initial implementation requires computing SPKI hashes and embedding them in the app binary.
5. **Pro**: The ISRG Root X1 backup pin provides continuity even if both R3 and the let's Encrypt chain change simultaneously.

## Implementation Notes

- Pinning will be enforced at the `dart:io` `HttpClient` level via a custom `SecurityContext` with `setTrustedCertificates()` for the pinned public keys.
- The Supabase client (`supabase_flutter`) will be configured to use the pinned `http.Client`.
- Pins are stored as base64-encoded SHA-256 SPKI hashes in a constants file (`lib/core/security/pins.dart`).
- A CI step will verify that the embedded pins match the current `api.verificat.xyz` certificate chain during staging deployment.

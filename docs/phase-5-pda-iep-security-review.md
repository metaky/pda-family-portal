# Phase 5 PDA IEP Advice Security Review

Date: 2026-06-24

Scope:

- `/api/pda-iep-advice/analyze`
- `/api/pda-iep-advice/human-verify`
- PDA IEP Advice upload/session/warning helpers
- PDA IEP Advice analyzer UI and static content pages
- Next.js app security headers and dependency advisories

## Executive Summary

No Critical or High findings were found in the Phase 5 upload/API implementation during this review. The analyzer remains disabled by default outside local development, upload handling validates PDFs before analysis, verification sessions are bound to request fingerprints, upload quota/rate limits are enforced, and analyzer output is rendered through React text nodes rather than raw HTML.

Two hardening changes were applied during the review:

- Added baseline response security headers in `next.config.ts`.
- Rejected test-token human verification when PDA IEP Advice is enabled in production.

## Findings

### No Critical or High Findings

Evidence reviewed:

- Feature and maintenance gates block the analyzer when not enabled: `src/app/api/pda-iep-advice/analyze/route.ts:63`.
- Upload preflight checks required PDF presence, non-empty file size, configured size limit, `%PDF-` signature, readable unencrypted PDF, page count, and page dimensions before analysis: `src/lib/server/uploads.ts:152`.
- Verification sessions are stored server-side, issued as HTTP-only cookies, and bound to purpose, IP hash, user-agent hash, and browser-id hash: `src/lib/server/security.ts:189`.
- Per-session quota and per-IP upload rate limits are enforced before analysis proceeds: `src/lib/server/security.ts:259`.
- Warning overrides are scoped to session, endpoint, and file hash before use: `src/app/api/pda-iep-advice/analyze/route.ts:85`.
- Production test-token verification is now rejected: `src/lib/server/config.ts:93`.
- Baseline headers now include CSP `frame-ancestors`, `object-src`, `base-uri`, `Permissions-Policy`, `Referrer-Policy`, `X-Content-Type-Options`, and `X-Frame-Options`: `next.config.ts:3`.

## Medium / Launch-Gate Notes

### P5-SR-001: Production security store still needs a real deployment implementation

Severity: Medium before public launch.

Evidence:

- The current config still requires the in-memory security store while the production store is not implemented: `src/lib/server/config.ts:99`.
- The memory store is process-local and should not be used as the final public multi-instance session/rate-limit store.

Impact:

- A multi-instance production deployment would not share verification sessions, warning tokens, or rate limits across instances.

Fix:

- Add a production security store, such as Redis or the chosen hosting provider's managed KV/session store.
- Then update the config validation to require that production store instead of memory-backed storage.

Mitigation:

- Keep `FEATURE_PDA_IEP_ANALYZE_ENABLED=false` in production until the real store is configured and verified.

### P5-SR-002: Edge/proxy upload body limits must be configured before public exposure

Severity: Medium before public launch.

Evidence:

- App-level PDF validation rejects oversized files after `req.formData()` has parsed the request: `src/app/api/pda-iep-advice/analyze/route.ts:79` and `src/lib/server/uploads.ts:165`.

Impact:

- Without edge/proxy body limits, an attacker can force the app server to spend resources parsing large multipart requests before the app-level limit responds.

Fix:

- Configure the deployment platform, CDN, or reverse proxy with a request body limit at or below the app's `UPLOAD_MAX_FILE_BYTES` value.

Mitigation:

- Keep the analyzer behind human verification, feature gating, and IP/session rate limits until infrastructure limits are confirmed.

### P5-SR-003: Dependency audit has moderate PostCSS advisory through Next

Severity: Medium.

Evidence:

- `npm audit --audit-level=high` reports two moderate PostCSS advisories through `next`.
- The suggested `npm audit fix --force` would install `next@9.3.3`, which is a breaking downgrade.

Impact:

- The reported advisory is not currently fixed by an automatic non-breaking update path in this dependency tree.

Fix:

- Track and apply a patched Next.js/PostCSS dependency path once available without a breaking downgrade.

Mitigation:

- Do not apply the forced downgrade. Continue using the current Next.js line and rerun audit before public launch.

## Review Result

Phase 5 upload/API behavior is acceptable for local development and continued migration work. Public launch should wait for the production security store and infrastructure upload body limits.

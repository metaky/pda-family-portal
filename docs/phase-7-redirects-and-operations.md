# Phase 7 Redirects and Operations Plan

Date: 2026-06-24

## Redirect Strategy

The portal is now the canonical product direction, but old standalone tools may
stay live until the new production URL is chosen and monitored. Use a gradual
transition rather than surprising families who already know the old links.

### Declarative App

Portal target: `/tools/declarative-language-translator`

Recommended transition:

1. Keep the old Declarative App live until the portal has a public domain.
2. Add a short bridge page or banner in the old app: "Declarative Language Translator is now part of PDA Family Tools."
3. After production portal smoke checks pass, redirect the old root and translator routes to the portal route.
4. Keep any old privacy or terms routes either redirected to portal policy pages or available as historical policy pages until the redirect is confirmed.

### PDA Your IEP

Portal targets:

- `/tools/pda-iep-advice`
- `/tools/pda-iep-advice/analyze`
- `/tools/pda-iep-advice/accommodations`
- `/tools/pda-iep-advice/guide`

Recommended transition:

1. Keep old analyzer pages live until production Gemini, Turnstile, and session configuration are verified in the portal.
2. Redirect informational content pages first, because they have lower operational risk than upload flows.
3. Redirect upload/analyzer routes only after a production live-route smoke test passes with non-sensitive fixture PDFs.
4. Keep privacy and terms continuity clear so families understand that uploaded school documents are still processed transiently and are not analytics data.

### Behavior Report Help

Portal target: `/tools/pda-behavior-report-help`

Recommended transition:

1. Keep the old behavior-report route live until the portal route is verified with production Gemini and Turnstile.
2. Add bridge copy explaining that behavior report review is now a standalone PDA Family Tools feature, not a nested IEP page.
3. Redirect only after production dual-upload smoke testing passes.

## Bridge Page Copy

Use this compact copy if a direct redirect would feel abrupt:

```text
This tool has moved into PDA Family Tools.

The new portal keeps the same practical PDA-aware support, with shared privacy,
terms, and donation-supported access across the tools.

Continue to [matching portal route].
```

## Error Monitoring Plan

Start with lightweight, privacy-safe monitoring before adding a full event or
session replay stack.

Minimum launch monitoring:

- Hosting provider build/deploy failures.
- Server route errors for AI and upload endpoints.
- HTTP 4xx/5xx rate changes by route.
- Client console errors from production smoke checks.
- Manual contact channel for parents to report broken tools.

Do not enable session replay or request-body capture for upload-backed tools.
If a monitoring tool is added later, scrub or avoid:

- Uploaded file names and contents.
- Extracted document text.
- Typed translator phrases.
- Support Sheet Builder form answers.
- Generated analysis, translations, and support sheets.
- Child or school names.

Recommended first implementation:

- Use hosting-provider logs for API failures.
- Add privacy-safe coarse analytics events separately after the analytics schema is reviewed.
- Consider Sentry or similar only if configured with request/body scrubbing disabled for sensitive payloads.

## Maintenance and Feature-Unavailable Pattern

The portal already uses feature flags and maintenance mode for upload-backed AI
routes. Production should treat these as operational controls, not development
shortcuts.

Production pattern:

- `MAINTENANCE_MODE=true` disables protected upload-backed analysis routes with user-facing unavailable messages.
- `FEATURE_PDA_IEP_ANALYZE_ENABLED=false` disables PDA IEP Advice analyzer while leaving static PDA IEP content available.
- `FEATURE_BEHAVIOR_REPORT_ENABLED=false` disables PDA Behavior Report Help while leaving the route shell available.
- `RAG_MOCK_MODE=false` should be used for live production analysis.
- `SECURITY_ALLOW_TEST_TOKENS` must be false or unset in production.

Operational guidance:

- Prefer disabling one affected AI/upload feature over taking the whole portal offline.
- Keep non-upload tools and static guidance available during AI-provider outages.
- Use user-facing language that says the feature is temporarily unavailable, not that a secret or provider failed.
- Re-enable features only after production smoke checks pass.

## Production Redirect Validation

After redirects or bridge pages are configured:

- Visit the old Declarative App root and translator route.
- Visit old PDA Your IEP analyzer, accommodations, and guide routes.
- Visit old behavior-report route.
- Confirm each old URL lands on the intended portal route or bridge page.
- Confirm no redirect points to a local development URL.
- Confirm no old route exposes stale privacy, donation, or product naming that conflicts with the portal.

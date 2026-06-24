# Phase 7 Production Readiness

Date: 2026-06-24

## Deployment Target

Recommended default: Vercel for the public Next.js portal unless an existing Google Cloud / Cloud Run deployment path is chosen for operational consistency.

Why Vercel is the default recommendation:

- The app is a standard Next.js App Router project.
- Managed Next.js hosting reduces launch overhead for metadata routes, API routes, build caching, and production runtime configuration.
- Production secrets can be configured without committing local `.env` files.

Keep this open until the actual hosting account and public domain are selected.

## Required Production Environment

| Variable | Visibility | Required | Notes |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public | Yes | Canonical site origin, no trailing slash. Example: `https://example.com`. |
| `NEXT_PUBLIC_DONATION_URL` | Public | Before donation launch | Public donation destination. Leave unset until the live destination is chosen. |
| `GEMINI_API_KEY` | Secret | Yes for live AI routes | Server-only. Never use a `NEXT_PUBLIC_` prefix. |
| `GEMINI_MODEL` | Server config | Optional | Defaults to the configured portal model. |
| `TURNSTILE_SECRET_KEY` | Secret | Yes for protected upload routes | Server-side Cloudflare Turnstile verification secret. |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public | Yes for protected upload routes | Browser-visible Turnstile site key. |
| `SESSION_SIGNING_SECRET` | Secret | Yes | Long random signing secret for warning/session protection. |
| `RAG_MOCK_MODE` | Server config | Yes | Set to `false` for production live analysis. |
| `SECURITY_ALLOW_TEST_TOKENS` | Server config | Yes | Must be `false` or unset in production. |
| `SECURITY_USE_MEMORY_STORE` | Server config | Temporary | Current protected-route implementation requires this until production session storage is configured. |
| `FEATURE_PDA_IEP_ANALYZE_ENABLED` | Server config | Yes when live | Enable only after secrets and smoke tests are ready. |
| `FEATURE_BEHAVIOR_REPORT_ENABLED` | Server config | Yes when live | Enable only after secrets and smoke tests are ready. |
| `MAINTENANCE_MODE` | Server config | Optional | Use `true` to temporarily disable upload-backed AI routes. |

## Launch Smoke Checks

Run before public launch:

```bash
npm test
npm run build
npm run test:e2e
npm audit --audit-level=high
```

Production route checks after deployment:

- `/`
- `/tools/support-sheet-builder`
- `/tools/declarative-language-translator`
- `/tools/pda-iep-advice`
- `/tools/pda-iep-advice/analyze`
- `/tools/pda-behavior-report-help`
- `/privacy`
- `/terms`
- `/donate`
- `/sitemap.xml`
- `/robots.txt`
- `/llms.txt`

Live upload route checks should wait until production Gemini, Turnstile, and session secrets are configured.

## Privacy Guardrails

Analytics events may record:

- Route or tool name.
- Coarse action name such as `generate`, `print`, `copy_email`, `copy_short_text`, `share`, or `donation_click`.
- Coarse success/failure or error category.

Analytics events must not record:

- Child names.
- School names.
- Document text.
- Uploaded file content.
- Support Sheet Builder form answers.
- Typed phrases in the Declarative Language Translator.
- Generated translations, support sheets, IEP analysis, or behavior report analysis.

The portal currently emits these as sanitized browser events named
`pda-portal-analytics`. No external analytics provider is connected yet. If a
provider is added later, it should subscribe only to that sanitized event shape
or an equivalent allowlisted server contract.

Donation links are wired through `NEXT_PUBLIC_DONATION_URL`, but the final live
Stripe or payment destination still needs to be chosen and configured.

## Redirect Planning

Old standalone tools can remain live during transition. Before switching old URLs, decide for each source product whether the old URL should:

- 301 redirect directly to the matching portal route.
- Show a short "This tool moved into PDA Family Tools" bridge page.
- Stay live temporarily while the portal route is monitored.

Portal target routes:

- Declarative App: `/tools/declarative-language-translator`
- PDA Your IEP analyzer: `/tools/pda-iep-advice/analyze`
- PDA Your IEP accommodations: `/tools/pda-iep-advice/accommodations`
- PDA Your IEP guide: `/tools/pda-iep-advice/guide`
- Behavior report help: `/tools/pda-behavior-report-help`

## Operational Risks To Close Before Launch

- Choose the final deployment target and public domain.
- Configure production secrets in the hosting provider.
- Replace local/test human-verification behavior with real Turnstile.
- Decide the live donation destination.
- Add privacy-safe analytics only after the event schema is reviewed.
- Run a threat model or security scan for upload, AI, analytics, and deployment surfaces.
- Smoke-test all production routes and redirects from a browser.

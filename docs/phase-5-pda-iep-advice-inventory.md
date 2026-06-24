# Phase 5 PDA IEP Advice Migration Inventory

## Source Behavior

- Source project: `/Users/kyle.wegner/Antigravity`
- Analyzer route: `/analyze`
- API route: `/api/analyze`
- Upload validation: PDF only, non-empty, byte limit, readable PDF, page count, page dimensions, SHA-256 hash, and extracted text.
- Security: human verification required before upload, session cookie, browser-id binding, IP/user-agent/browser hash binding, per-session quota, and per-IP upload rate limit.
- Warning override: likely irrelevant documents return a warning and a signed one-use warning token scoped to the same session and file hash.
- RAG/model behavior: source docs are loaded from `src/data/rag_docs`; the prompt asks for PDA-affirming IEP/504 analysis with strict JSON output.
- Response schema: analyzer output returns score, parent-facing summary, strengths, opportunities, category suggestions, and categorized findings with direct quotes when available.
- Privacy: uploaded document content is sensitive school/family data and should not be sent to analytics, stored as a dashboard, or reused outside the requested analysis.

## Source Files Reviewed

- `src/app/api/analyze/route.ts`
- `src/lib/server/uploads.ts`
- `src/lib/server/security.ts`
- `src/lib/server/security-store.ts`
- `src/lib/server/config.ts`
- `src/lib/server/errors.ts`
- `src/lib/server/api-types.ts`
- `src/lib/rag-engine.ts`
- `src/data/rag_docs/`
- `tests/uploads.unit.spec.ts`
- `tests/security.unit.spec.ts`
- `tests/api.spec.ts`

## Portal Adaptation Decisions

- Use `/api/pda-iep-advice/analyze` instead of `/api/analyze` so the route matches the portal feature name.
- Keep the portal product name as PDA IEP Advice in user-facing copy; keep PDA Your IEP only as a migration/source reference.
- Keep the production feature disabled by default until environment, security, and model configuration are present; local development defaults to mock analysis with memory-backed verification so the migrated flow can be tested end to end.
- Preserve the source app's upload limits, warning-token flow, and security-session vocabulary so existing edge cases move forward intact.
- Upload/API parity, the RAG engine, analyzer UI, accommodations page, guide page, and privacy/terms copy are migrated into native portal routes.
- Treat PDA Behavior Report Help as a later standalone Phase 6 feature, even though it shares source upload/security/RAG utilities.

## Module Copy/Adapt Decision

- Copy mostly as-is: `api-types.ts`, `errors.ts`, upload preflight behavior, RAG prompt/schema validation, source docs.
- Copy with portal adaptation: server config feature names, analyzer route path, migration inventory status, user-facing product naming.
- Defer: production Redis or equivalent session-store wiring validation, production Turnstile visual integration, live model quality comparison, and edge upload body-limit verification.

## Final Phase 5 Status

- Native portal analyzer, accommodations, guide, privacy, and terms pages are migrated.
- Local mock analyzer verification and upload flow are browser-checked.
- Security review is captured in `docs/phase-5-pda-iep-security-review.md`.
- Public launch remains gated on production session/rate-limit storage, edge upload body limits, and live model parity.

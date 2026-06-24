# Phase 5 PDA IEP Advice Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the PDA Your IEP analyzer, accommodations, and guide into the portal as a native PDA IEP Advice feature suite.

**Architecture:** Migrate the source app in vertical slices, starting with the upload/API contract and security posture before adding the full analyzer UI. Keep the portal naming as PDA IEP Advice while preserving the source app's document validation, warning override, response schema, RAG prompts, privacy copy, and tests.

**Tech Stack:** Next.js App Router, React, TypeScript, Vitest, Playwright, pdf-lib, Gemini via `@google/generative-ai`, local memory store for development/test security sessions, optional Upstash for production session storage.

---

## Files and Responsibilities

- `docs/phase-5-pda-iep-advice-inventory.md`: Migration inventory of source behavior, prompts, documents, tests, and portal adaptation decisions.
- `src/lib/server/config.ts`: Portal server feature flags, upload limits, model configuration, security session settings, and test reset helper.
- `src/lib/server/errors.ts`: Shared public API error shape for user-safe upload/API errors.
- `src/lib/server/api-types.ts`: PDA IEP Advice response schema shared by server routes, UI, and tests.
- `src/lib/server/uploads.ts`: PDF validation, page/dimension limits, hash generation, text extraction, and local relevance checks.
- `src/lib/server/security-store.ts`: Development/test memory store and optional production Redis-compatible security store.
- `src/lib/server/security.ts`: Human-verification session binding, upload quota, warning override token creation/consumption, and privacy-safe fingerprinting.
- `src/lib/rag-engine.ts`: Source-backed prompt/RAG engine and strict model response validation.
- `src/data/rag_docs/`: PDA/source guidance docs used by the analyzer prompt.
- `src/app/api/pda-iep-advice/analyze/route.ts`: Portal analyzer API route.
- `src/components/PdaIepAnalyzer.tsx`: Native analyzer UI with upload, warning override, results, print/copy affordances, and post-value donation prompt.
- `src/components/UploadZone.tsx`: Portal-styled single PDF upload control.
- `src/app/tools/pda-iep-advice/analyze/page.tsx`: Analyzer route using the migrated UI.
- `src/app/tools/pda-iep-advice/accommodations/page.tsx`: Migrated accommodations guidance page.
- `src/app/tools/pda-iep-advice/guide/page.tsx`: Migrated PDA guide page.
- `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, or shared footer copy: Portal privacy/terms language that covers uploaded school documents.
- `src/lib/migration-inventory.ts`: Migration status and source-file notes.
- `tests/pda-iep-uploads.test.ts`: Unit tests for upload validation, relevance, and config defaults.
- `tests/pda-iep-api-shape.test.ts`: Unit tests for response/error shaping and warning response shape.
- `tests/e2e/pda-iep-advice.spec.ts`: Browser regression tests for the analyzer flow once UI is wired.
- `TODO.md`: Phase 5 checklist updates as each slice is completed.

## Task 1: Inventory and Migration Decisions

**Files:**
- Create: `docs/phase-5-pda-iep-advice-inventory.md`
- Modify: `TODO.md`

- [x] **Step 1: Write the inventory document**

Record the source app behavior discovered from `/Users/kyle.wegner/Antigravity`, including:

```markdown
# Phase 5 PDA IEP Advice Migration Inventory

## Source Behavior
- Analyzer route: `/analyze`
- API route: `/api/analyze`
- Upload validation: PDF only, non-empty, byte limit, readable PDF, page count, page dimensions, SHA-256 hash, extracted text.
- Security: human verification required, session cookie, browser-id binding, IP/user-agent/browser hash binding, per-session quota, per-IP upload rate limit.
- Warning override: likely irrelevant documents return a warning and a signed one-use warning token scoped to the same session and file hash.
- RAG/model behavior: source docs are loaded from `src/data/rag_docs`; prompt requests PDA-affirming IEP/504 analysis with strict JSON output.
- Privacy: uploaded document content is not analytics data and should not be stored by the portal.

## Portal Adaptation
- Use `/api/pda-iep-advice/analyze` instead of `/api/analyze`.
- Keep feature disabled by default until environment/security configuration is present.
- Keep UI naming as PDA IEP Advice; do not expose PDA Your IEP as the product name.
- Start with upload/API parity, then migrate the analyzer UI, accommodations page, guide page, and privacy/terms copy.
```

- [x] **Step 2: Mark inventory tasks complete**

Update Phase 5 in `TODO.md`:

```markdown
- [x] Inventory current upload, PDF parsing, security, human verification, and history behavior.
- [x] Inventory current RAG docs, prompts, and response schema.
- [x] Decide which Antigravity modules can be copied as-is and which need portal adaptation.
```

## Task 2: Upload and API Contract Foundation

**Files:**
- Create: `tests/pda-iep-uploads.test.ts`
- Create: `tests/pda-iep-api-shape.test.ts`
- Create: `src/lib/server/config.ts`
- Create: `src/lib/server/errors.ts`
- Create: `src/lib/server/api-types.ts`
- Create: `src/lib/server/uploads.ts`
- Create: `src/lib/server/security-store.ts`
- Create: `src/lib/server/security.ts`
- Create: `src/lib/human-verification.ts`
- Create: `src/app/api/pda-iep-advice/analyze/route.ts`
- Modify: `package.json`
- Modify: `TODO.md`

- [x] **Step 1: Write failing upload tests**

Create `tests/pda-iep-uploads.test.ts` with tests that import `preflightPdfUpload`, `assertLocalRelevance`, `getServerConfig`, and `resetServerConfigForTests`, then verify:

```ts
await preflightPdfUpload(validPdfFile) returns mimeType "application/pdf", pageCount 1, a fileHash, and extracted school-support text.
preflightPdfUpload(fakePdfFile) rejects with code "INVALID_FILE_TYPE".
preflightPdfUpload(twoPagePdfWithPageLimitOne) rejects with code "PAGE_LIMIT_EXCEEDED".
preflightPdfUpload(pdfOverByteLimit) rejects with code "FILE_TOO_LARGE".
preflightPdfUpload(oversizedPagePdf) rejects with code "PAGE_DIMENSIONS_UNSUPPORTED".
assertLocalRelevance("grocery receipt shopping list apples milk bread total due") throws code "LIKELY_IRRELEVANT".
getServerConfig().uploads exposes nonzero defaults.
```

- [x] **Step 2: Run upload tests to verify RED**

Run: `npm test -- tests/pda-iep-uploads.test.ts`

Expected: FAIL because `@/lib/server/uploads` and related server modules do not exist.

- [x] **Step 3: Write failing API shape tests**

Create `tests/pda-iep-api-shape.test.ts` with tests that verify:

```ts
apiErrorResponse(new PublicApiError("Complete the security check before uploading files.", 403, "VERIFICATION_REQUIRED")) returns a 403 JSON response with ok false, type "error", code "VERIFICATION_REQUIRED".
apiWarningResponse("LIKELY_IRRELEVANT", "This PDF does not appear to be a school support document.", "signed-token") returns a 422 JSON response with ok false, type "warning", code "LIKELY_IRRELEVANT", and warningId "signed-token".
parseStoredJson('{"ok":true}') returns { ok: true }.
parseStoredJson({ ok: true }) returns { ok: true }.
parseStoredJson(42) throws PublicApiError.
```

- [x] **Step 4: Run API tests to verify RED**

Run: `npm test -- tests/pda-iep-api-shape.test.ts`

Expected: FAIL because route helpers/security modules do not exist.

- [x] **Step 5: Add dependencies**

Run: `npm install pdf-lib @google/generative-ai`

Expected: `package.json` and `package-lock.json` include the migrated analyzer dependencies.

- [x] **Step 6: Implement minimal server modules**

Copy and adapt the source modules from `/Users/kyle.wegner/Antigravity`:

```text
src/lib/server/config.ts
src/lib/server/errors.ts
src/lib/server/api-types.ts
src/lib/server/uploads.ts
src/lib/server/security-store.ts
src/lib/server/security.ts
src/lib/human-verification.ts
```

Use portal route names and keep production feature flags disabled by default:

```text
FEATURE_PDA_IEP_ANALYZE_ENABLED=false by default in production
MAINTENANCE_MODE=true by default in production
SECURITY_USE_MEMORY_STORE=false by default in production
RAG_MOCK_MODE=false by default in production
```

- [x] **Step 7: Implement minimal analyzer API route helpers**

Create `src/app/api/pda-iep-advice/analyze/route.ts` with exported helpers:

```ts
export function apiErrorResponse(error: unknown): NextResponse<ApiResponse<AnalyzeReport>>
export function apiWarningResponse(code: string, message: string, warningId: string): NextResponse<ApiResponse<AnalyzeReport>>
```

The initial `POST` should return `FEATURE_DISABLED` unless the feature flag is enabled. Full RAG analysis is Task 3.

- [x] **Step 8: Run tests to verify GREEN**

Run:

```bash
npm test -- tests/pda-iep-uploads.test.ts tests/pda-iep-api-shape.test.ts
```

Expected: PASS.

- [x] **Step 9: Update TODO status**

Update Phase 5 in `TODO.md`:

```markdown
- [x] Write failing tests for upload validation and API response shape.
- [x] Port server config and environment handling needed for analyzer routes.
- [x] Port upload validation and security protections.
```

## Task 3: RAG Engine and Source Docs

**Files:**
- Create: `src/lib/rag-engine.ts`
- Create: `src/lib/analyze-report-normalization.ts`
- Create: `src/lib/server/mock-analysis.ts`
- Copy: `src/data/rag_docs/PDA_Guide_Clean.txt`
- Copy: `src/data/rag_docs/PDA Affirming IEP Guide.rtf`
- Modify: `src/app/api/pda-iep-advice/analyze/route.ts`
- Test: `tests/pda-iep-rag.test.ts`

- [x] **Step 1: Write failing RAG response tests**

Verify strict normalization for score, category, status, missing fields, and mock-mode analyzer output.

- [x] **Step 2: Run RAG tests to verify RED**

Run: `npm test -- tests/pda-iep-rag.test.ts`

Expected: FAIL because RAG modules are missing.

- [x] **Step 3: Port source RAG modules and docs**

Copy the source RAG engine, mock analysis, normalization helpers, and RAG docs. Adapt imports to portal paths and keep the API route under `/api/pda-iep-advice/analyze`.

- [x] **Step 4: Run RAG tests to verify GREEN**

Run: `npm test -- tests/pda-iep-rag.test.ts`

Expected: PASS.

## Task 4: Analyzer UI

**Files:**
- Create: `src/components/PdaIepAnalyzer.tsx`
- Create: `src/components/UploadZone.tsx`
- Modify: `src/app/tools/pda-iep-advice/analyze/page.tsx`
- Test: `tests/e2e/pda-iep-advice.spec.ts`

- [x] **Step 1: Write failing Playwright analyzer flow**

Verify invalid file rejection, valid PDF mocked success, warning override state, printable/readable result, and no mobile horizontal overflow.

- [x] **Step 2: Run Playwright test to verify RED**

Run: `npm run test:e2e -- tests/e2e/pda-iep-advice.spec.ts`

Expected: FAIL because the route is still a placeholder.

- [x] **Step 3: Port analyzer UI**

Adapt the source UI to portal styling, use the portal feature name, and preserve privacy language before upload.

- [x] **Step 4: Run Playwright test to verify GREEN**

Run: `npm run test:e2e -- tests/e2e/pda-iep-advice.spec.ts`

Expected: PASS.

- [x] **Step 5: Wire local analyzer verification**

Add a feature-specific human verification route, browser-id headers, test-token verification panel, and retry logic so local `next dev` can run the real analyzer API in mock mode without a production Gemini key.

## Task 5: Accommodations, Guide, Privacy, and Migration Status

**Files:**
- Modify: `src/app/tools/pda-iep-advice/accommodations/page.tsx`
- Modify: `src/app/tools/pda-iep-advice/guide/page.tsx`
- Modify: `src/app/about/page.tsx` or portal privacy/terms routes
- Modify: `src/lib/migration-inventory.ts`
- Modify: `TODO.md`

- [x] **Step 1: Port static guidance pages**

Move source accommodations and PDA guide content into portal routes, replacing old product naming with PDA IEP Advice.

- [x] **Step 2: Port privacy and disclaimer language**

Preserve or strengthen the source app stance: document text is uploaded only for analysis, not analytics, not accounts, not public sharing, and not stored as a parent dashboard.

- [x] **Step 3: Verify final Phase 5 checks**

Run:

```bash
npm test
npm run build
npm run test:e2e
```

Then browser-check analyzer, accommodations, guide, desktop, and mobile.

## Self-Review

- Spec coverage: Tasks cover Phase 5 inventory, upload/API tests, server config, upload security, RAG/docs, analyzer route, analyzer UI, accommodations, guide, privacy/terms, naming, migration status, and verification.
- Placeholder scan: Remaining future tasks describe exact files and expected behavior; no task is marked as done without a test or verification path.
- Type consistency: API response types use `ApiResponse<AnalyzeReport>`, upload functions return `PreflightedUpload`, and the portal analyzer route is consistently `/api/pda-iep-advice/analyze`.

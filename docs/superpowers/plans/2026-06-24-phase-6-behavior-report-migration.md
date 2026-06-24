# Phase 6 Behavior Report Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Begin Phase 6 by porting the PDA Behavior Report Help validation, API, and first native UI slice into the portal.

**Architecture:** Reuse the Phase 5 upload, security, and RAG foundations, adding behavior-report-specific types, mock output, pair validation, and a standalone `/tools/pda-behavior-report-help` experience. Keep the feature separate from PDA IEP Advice in navigation while sharing the same protected upload infrastructure.

**Tech Stack:** Next.js route handlers, React client components, Vitest, Playwright-ready UI patterns, pdf-lib upload preflight, Gemini-backed RAG with mock mode.

---

### Task 1: Inventory and Server Contract

**Files:**
- Modify: `src/lib/server/api-types.ts`
- Modify: `src/lib/server/mock-analysis.ts`
- Modify: `src/lib/rag-engine.ts`
- Modify: `src/lib/server/uploads.ts`
- Modify: `src/lib/server/security.ts`
- Modify: `src/lib/server/config.ts`
- Create: `src/app/api/pda-behavior-report-help/analyze/route.ts`
- Test: `tests/behavior-report-uploads.test.ts`
- Test: `tests/behavior-report-api-shape.test.ts`

- [ ] Write failing tests for behavior report upload-pair validation and safe API response shape.
- [ ] Run the new Vitest tests and confirm they fail because the behavior-report contract is missing.
- [ ] Add behavior report response types and mock analysis.
- [ ] Add upload-pair validation that requires both `behaviorReport` and `iepDocument`, hashes the pair, and reuses PDF preflight.
- [ ] Add the `behavior-report` security purpose and feature flag.
- [ ] Add the behavior-report API route using mock mode, warnings, verification, and shared error responses.
- [ ] Run the new Vitest tests and confirm they pass.

### Task 2: Native Portal UI Slice

**Files:**
- Create: `src/components/DualUploadZone.tsx`
- Create: `src/components/BehaviorReportAnalyzer.tsx`
- Modify: `src/components/HumanVerificationPanel.tsx`
- Modify: `src/app/tools/pda-behavior-report-help/page.tsx`
- Test: `tests/e2e/behavior-report-help.spec.ts`

- [ ] Write or port a Playwright test for selecting two PDFs, completing verification, and seeing behavior-report results.
- [ ] Run the e2e test and confirm it fails while the route is still a placeholder.
- [ ] Replace the placeholder with a standalone analyzer UI that uses two file inputs.
- [ ] Render summary, missed supports, IEP guidance, recommendations, PDA considerations, warning override, and print/save action.
- [ ] Run the e2e test and browser smoke checks.

### Task 3: Tracker and Parity Notes

**Files:**
- Modify: `TODO.md`
- Create: `docs/phase-6-pda-behavior-report-inventory.md`

- [ ] Document source files inspected from `/Users/kyle.wegner/Antigravity`.
- [ ] Check off only completed Phase 6 tasks.
- [ ] Leave unverified parity items unchecked until browser and security review are complete.

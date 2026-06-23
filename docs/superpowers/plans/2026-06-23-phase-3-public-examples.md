# Phase 3 Public Examples Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let parents understand the Support Sheet Builder's value before entering personal information and make tool sharing safe and natural.

**Architecture:** Add public example metadata in a small library, render example index/detail routes from that metadata, and add a generated-state share action that shares only the tool URL. Keep child-specific data local and do not add server storage or data-bearing share links.

**Tech Stack:** Next.js App Router, React client component for the builder, Vitest for deterministic example/share metadata checks, Playwright for route and sharing browser checks.

---

### Task 1: Example Metadata And Unit Tests

**Files:**
- Create: `src/lib/support-sheet-examples.ts`
- Create: `tests/support-sheet-examples.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/support-sheet-examples.test.ts` with assertions that five examples exist for teacher, family, childcare, medical, and activity audiences; that slugs are stable; that names are fictional sample names; and that generated output contains the example's audience-specific value copy.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/support-sheet-examples.test.ts`

Expected: fail because `src/lib/support-sheet-examples.ts` does not exist.

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/support-sheet-examples.ts` exporting `supportSheetExamples`, `getSupportSheetExample(slug)`, and `supportSheetExampleSlugs`. Build each example from `supportSheetPresets` and `generateSupportSheetOutputs`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- tests/support-sheet-examples.test.ts`

Expected: pass.

### Task 2: Public Example Routes

**Files:**
- Create: `src/app/tools/support-sheet-builder/examples/page.tsx`
- Create: `src/app/tools/support-sheet-builder/examples/[slug]/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `tests/e2e/support-sheet-builder.spec.ts`

- [ ] **Step 1: Write failing route tests**

Add a Playwright test that visits `/tools/support-sheet-builder/examples` and every detail route, confirms each page makes value clear without a form, and confirms example routes contain no editable child-input form.

- [ ] **Step 2: Run route test to verify it fails**

Run: `npm run test:e2e`

Expected: fail because the example routes do not exist.

- [ ] **Step 3: Implement routes**

Create an examples index with links to five example pages. Create a detail route that renders the generated one-page support sheet output as read-only sample content, with calls to build a custom sheet and view all examples.

- [ ] **Step 4: Run route test to verify it passes**

Run: `npm run test:e2e`

Expected: pass.

### Task 3: Safe Share Action After Generation

**Files:**
- Modify: `src/components/SupportSheetBuilder.tsx`
- Modify: `tests/e2e/support-sheet-builder.spec.ts`

- [ ] **Step 1: Write failing browser test**

Extend the builder e2e happy path to generate a support sheet, click "Share this tool", confirm visible success feedback, and confirm the copied/shared text contains only `/tools/support-sheet-builder`, not a child name or generated output.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:e2e`

Expected: fail because the share action does not exist.

- [ ] **Step 3: Implement share action**

Add a share button to the generated donation/action panel. Use `navigator.share` when available, otherwise copy the current-origin Support Sheet Builder URL to the clipboard. Do not include child names or generated support sheet content in the share payload.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:e2e`

Expected: pass.

### Task 4: Checklist, Visual QA, And Commit

**Files:**
- Modify: `TODO.md`

- [ ] **Step 1: Run full verification**

Run:

```bash
npm test
npm run test:e2e
npm run build
npm audit --audit-level=high
```

- [ ] **Step 2: Run browser/CLI QA**

Use Browser or persistent Playwright for route health and visual QA. Use `$playwright-cli` snapshots for `/tools/support-sheet-builder/examples` and one detail route.

- [ ] **Step 3: Update checklist**

Check completed Phase 3 tasks in `TODO.md`. Leave deployment-URL footer items unchecked if no canonical public URL is known.

- [ ] **Step 4: Commit**

Commit with message: `Add public support sheet examples`.

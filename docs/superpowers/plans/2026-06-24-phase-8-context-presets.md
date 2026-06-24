# Phase 8 Context Presets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional school-year, appointment, and activity-context starters to the Support Sheet Builder without adding accounts, storage, dashboards, or AI.

**Architecture:** Keep the feature template-first and local to the browser. Define reusable context presets in `src/lib/support-sheet.ts`, apply them by merging preset values into the existing answer state, and expose them as lightweight buttons in `src/components/SupportSheetBuilder.tsx`.

**Tech Stack:** Next.js App Router, React client state, TypeScript, Vitest, Playwright e2e.

---

### Task 1: Context Preset Model and Generator Coverage

**Files:**
- Modify: `tests/support-sheet-generator.test.ts`
- Modify: `src/lib/support-sheet.ts`

- [x] **Step 1: Write failing tests**

Add a test that imports `applySupportSheetContextPreset` and `supportSheetContextPresets`, verifies the three preset IDs, and verifies that applying a preset preserves the child identity while adding context-specific section notes and selected support options.

- [x] **Step 2: Run the focused test**

Run: `npm test -- tests/support-sheet-generator.test.ts`

Expected: FAIL because `applySupportSheetContextPreset` and `supportSheetContextPresets` do not exist yet.

- [x] **Step 3: Implement the preset model**

Add `SupportSheetContextPreset`, export `supportSheetContextPresets`, and export `applySupportSheetContextPreset(answers, presetId)` from `src/lib/support-sheet.ts`.

- [x] **Step 4: Run the focused test again**

Run: `npm test -- tests/support-sheet-generator.test.ts`

Expected: PASS.

### Task 2: Builder UI and Regression Coverage

**Files:**
- Modify: `src/components/SupportSheetBuilder.tsx`
- Modify: `tests/e2e/support-sheet-builder.spec.ts`
- Modify: `TODO.md`

- [x] **Step 1: Write failing e2e coverage**

Add a browser test that clicks a context starter, confirms the child name is unchanged, generates the sheet, and verifies the generated sheet contains the selected context language.

- [x] **Step 2: Run the focused e2e test**

Run: `npm run test:e2e -- tests/e2e/support-sheet-builder.spec.ts`

Expected: FAIL because the context starter UI does not exist yet.

- [x] **Step 3: Add context starter buttons**

Render the three context presets near the existing sample starters. On click, merge the preset into the current answers while preserving child details.

- [x] **Step 4: Update TODO**

Mark the Phase 8 context preset checklist item complete.

- [x] **Step 5: Run full verification**

Run:

```bash
npm test
npm run build
npm run test:e2e
```

Expected: all pass.

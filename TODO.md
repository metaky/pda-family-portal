# PDA Family Tools Portal TODO

This file is the working execution tracker for the project. The PRD remains the product source of truth:

- Product brief / PRD: `pda-family-portal-support-sheet-prd.md`
- Current app: Next.js portal in `src/`
- Local source apps for migration:
  - Declarative App: `/Users/kyle.wegner/Dev Projects/declarative`
  - PDA Your IEP / behavior report source: `/Users/kyle.wegner/Antigravity`

Use this file to stage work, check off completed tasks, and keep each phase tied to concrete verification steps.

## Working Rules

- Keep the PRD as the strategy document. Update it only when the product direction changes.
- Keep this `TODO.md` as the execution checklist. Update it when work is completed or newly discovered.
- Commit after each completed phase or meaningful vertical slice.
- Prefer small native portal features over permanent external links.
- Preserve source-project prompts, privacy language, behavior, tests, and hard-won edge cases during migrations.
- Do not add accounts, cloud saving, parent dashboards, daily logs, or server-side Support Sheet Builder storage unless a future PRD explicitly changes the MVP scope.
- Do not record child names, school names, document text, generated output, or form answers in analytics.

## Standard Verification Commands

Run these before committing code changes:

```bash
npm test
npm run build
```

Run this when dependencies or framework versions change:

```bash
npm audit --audit-level=high
```

Use browser QA for user-facing changes:

- Desktop: `http://localhost:3000`
- Mobile-sized viewport: check at roughly `390 x 844`
- Confirm no horizontal overflow.
- Confirm no clipped or unreadable text in primary workflows.
- Confirm donation prompts appear only after value is delivered.

## Tool and Skill Routing

Use the right tool for the confidence level needed. A passing build is not enough for user-facing portal work.

### Planning and Implementation Discipline

- Use `superpowers:writing-plans` before starting a multi-step phase or migration.
- Use `superpowers:test-driven-development` for feature and bugfix work. Write the failing test first, verify it fails for the right reason, then implement.
- Use the PRD for product direction and this file for execution tracking.
- Update this file when a task is completed, newly discovered, split, or deliberately deferred.

### Unit and Service Tests

Use Vitest for deterministic logic:

- Template generation in `src/lib/support-sheet.ts`.
- Migration inventory logic.
- API response shaping once AI/upload routes are ported.
- Privacy guardrails that can be tested without a browser.

Commands:

```bash
npm test
```

### Checked-In Playwright Tests

Use checked-in Playwright specs when a browser flow should become a permanent regression guard.

Add this during Phase 2 before launch hardening:

- `@playwright/test` as a dev dependency.
- `playwright.config.ts`.
- `tests/e2e/support-sheet-builder.spec.ts`.
- `npm run test:e2e`.

Good candidates for checked-in tests:

- Support Sheet Builder happy path: choose audience, edit fields, generate, switch output tabs.
- Donation prompt absent before generation and present after generation.
- Email and short text copy buttons show success feedback.
- Mobile viewport has no horizontal overflow.
- Migrated upload flows reject invalid files and accept valid fixtures.

Do not replace unit tests with browser tests. Use browser tests for user flows, not template string minutiae.

### `$playwright` and `$playwright-cli`

Use `$playwright` / `$playwright-cli` for quick real-browser checks from the terminal:

- Smoke-test a route after a change.
- Fill a form once and inspect the visible result.
- Take snapshots before using element refs.
- Capture console or network output while debugging.
- Save a screenshot or trace for temporary QA evidence.

Prerequisite:

```bash
command -v npx >/dev/null 2>&1
```

Preferred wrapper:

```bash
export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"
"$PWCLI" open http://127.0.0.1:3000 --headed
"$PWCLI" snapshot
```

Session hygiene:

- Run browser commands serially.
- Open or confirm the session before navigating.
- Re-snapshot after navigation or UI-changing actions.
- Store temporary screenshots/traces under `output/playwright/`.
- Do not commit Playwright artifacts unless a task explicitly asks for a durable artifact.

### `$playwright-interactive`

Use `$playwright-interactive` for iterative UI work where visual quality matters:

- Layout changes to the portal shell, tool pages, preview pane, print layout, or mobile behavior.
- Debugging clipping, overflow, z-index, focus, console errors, or responsive issues.
- Multi-step QA where keeping the same browser/session saves time.
- Before signing off on a visually meaningful feature.

Required QA inventory before signoff:

- User-visible claims being made.
- Controls and modes changed or introduced.
- Expected state changes for each control.
- Desktop and mobile visual checks.
- At least two off-happy-path checks.

Required signoff checks:

- Functional path with normal user input.
- Separate visual QA pass.
- Viewport fit check, including no horizontal overflow.
- Screenshot review for the state being signed off.
- Short exploratory pass after scripted checks.

### Frontend Testing Debugging Skill

Use `build-web-apps:frontend-testing-debugging` for rendered frontend fixes or QA-heavy UI changes. It should define the target flow, validate page identity, check console health, prove at least one interaction, and inspect desktop plus mobile when practical.

### Security and Privacy Tools

Use security-focused review before and after porting upload or AI-backed routes:

- Use `security-best-practices` or `codex-security:security-scan` for upload/API migrations.
- Use `codex-security:threat-model` before public launch of PDA IEP Advice or PDA Behavior Report Help.
- Confirm analytics never captures child names, school names, document text, typed phrases, generated output, or form answers.

### Deployment and External-Service Tools

- Use `sites:sites-building` / `sites:sites-hosting` only if this project becomes attached to Sites or gets a `.openai/hosting.json`.
- Use `github:*` skills/tools if the project moves to GitHub PRs or CI checks.
- Use `openai-docs` only if a future phase changes model/API providers to OpenAI products.
- Use official provider docs when changing Gemini, Next.js, security, upload, or deployment behavior.

## Phase 0: Baseline Repository

Goal: Make the project safe to continue in repeatable Codex sessions.

- [x] Initialize git repository on `main`.
- [x] Add `.gitignore` for `node_modules`, `.next`, env files, logs, and browser/test artifacts.
- [x] Commit initial portal MVP.
- [x] Verify `npm test` passes.
- [x] Verify `npm run build` passes.

Done when:

- [x] `git status --short` is clean after commit.
- [x] Latest commit contains the app source, PRD, tests, package files, and project config.

## Phase 1: Portal Foundation and Migration Inventory

Goal: Make the portal structure clear enough that the existing apps are treated as source projects to migrate, not permanent external destinations.

- [x] Portal home exists.
- [x] Shared portal navigation exists.
- [x] Tool cards exist for all four initial features.
- [x] Native route exists for Declarative Language Translator.
- [x] Native route exists for Support Sheet Builder.
- [x] Native route exists for PDA IEP Advice.
- [x] Native routes exist for PDA IEP Advice analyzer, accommodations, and guide.
- [x] Native route exists for PDA Behavior Report Help as a standalone feature.
- [x] About page exists.
- [x] Donation placeholder page exists.
- [x] Footer links to trusted PDA resources.
- [x] Migration inventory page exists.
- [x] Migration inventory names real source files from Declarative App.
- [x] Migration inventory names real source files from PDA Your IEP / behavior report source.

Verification:

- [x] `npm test`
- [x] `npm run build`
- [x] Browser check `/migration-inventory` includes both local source project paths.
- [x] Browser check `/tools/pda-behavior-report-help` presents behavior report help as its own feature.

Remaining cleanup:

- [ ] Decide whether placeholder tool routes should include temporary bridge links to current live tools before public launch.
- [ ] Add any missing canonical metadata once deployment URL is known.

## Phase 2: Support Sheet Builder MVP

Goal: Make the first complete version of the new tool useful enough for a parent to generate, edit, print, and copy a support sheet without logging in.

- [x] Audience picker exists.
- [x] Guided form exists.
- [x] Structured response state exists.
- [x] Template engine exists in `src/lib/support-sheet.ts`.
- [x] Unit tests cover generated sheet, email, short text, privacy copy, and editable draft shape.
- [x] Editable one-page preview exists.
- [x] Print/save button exists.
- [x] Copyable email version exists.
- [x] Copyable short text version exists.
- [x] Privacy note explains no account and no server-side Support Sheet Builder storage.
- [x] Plain-language disclaimer exists.
- [x] Donation prompt appears after generation.
- [x] Reset/clear form exists.

Quality tasks:

- [ ] Improve audience-specific wording so teacher, family, childcare, activity, and medical outputs differ more meaningfully.
- [ ] Add custom free-text fields for each section, not only one general note.
- [ ] Add a visible "copy email" and "copy short text" success state that is easy to notice on mobile.
- [ ] Add a print-specific QA pass for one-page output length at common paper sizes.
- [ ] Add checked-in Playwright e2e setup: `@playwright/test`, `playwright.config.ts`, `tests/e2e/support-sheet-builder.spec.ts`, and `npm run test:e2e`.
- [ ] Add browser tests for the complete builder flow.
- [ ] Add tests that verify no Support Sheet Builder API route or server persistence is used.
- [ ] Add sample input presets for a teacher, grandparent, babysitter, dentist, and coach.

Verification:

- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run test:e2e` once the checked-in Playwright harness exists.
- [ ] Desktop browser: generate support sheet, edit preview text, switch to email, switch to short text.
- [ ] Mobile browser: generate support sheet and confirm no horizontal overflow.
- [ ] Use `$playwright-interactive` for final desktop and mobile visual QA when layout, print preview, or output editing changes.
- [ ] Use `$playwright-cli` for quick route smoke checks or trace/screenshot capture during debugging.
- [ ] Print preview: confirm output is readable and suitable for one page or a clearly acceptable print flow.
- [ ] Copy email: paste into a plain text field and confirm it is readable without formatting.
- [ ] Copy short text: confirm it is short enough for a normal message.
- [ ] Confirm donation prompt is absent before generation and present after generation.

## Phase 3: Public Examples and Organic Sharing

Goal: Let parents understand the tool's value before entering personal information and make sharing happen naturally.

- [ ] Create public example route structure.
- [ ] Add example support sheet for a teacher.
- [ ] Add example support sheet for grandparents or relatives.
- [ ] Add example support sheet for babysitter or childcare.
- [ ] Add example support sheet for dentist or medical provider.
- [ ] Add example support sheet for coach, camp, or activity leader.
- [ ] Add "share this tool" action after generation.
- [ ] Add quiet footer URL to printable output once deployment URL is known.
- [ ] Add quiet footer URL to copied email text once deployment URL is known.

Verification:

- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run test:e2e` once the checked-in Playwright harness exists.
- [ ] Browser check each example route.
- [ ] Use `$playwright-cli` snapshots for route smoke checks.
- [ ] Use `$playwright-interactive` if examples introduce new layout patterns or visual states.
- [ ] Confirm examples contain no real child data.
- [ ] Confirm example pages make value clear without requiring form entry.
- [ ] Confirm share/footer copy can be removed or edited by the parent.

## Phase 4: Declarative Language Translator Migration

Goal: Bring the proven Declarative App functionality into the portal as a native feature.

Source project:

```text
/Users/kyle.wegner/Dev Projects/declarative
```

Primary source files:

- `components/Translator.tsx`
- `services/geminiService.ts`
- `services/translationPrompt.js`
- `services/translationUtils.ts`
- `services/historyStorage.ts`
- `services/analytics.ts`
- `components/DonationCallout.tsx`
- `components/PrivacyPolicy.tsx`
- `components/TermsOfService.tsx`
- `evals/`
- `server.js`

Tasks:

- [ ] Inventory current translator behavior and interaction states.
- [ ] Inventory prompt behavior, tone options, variation behavior, and quality eval assets.
- [ ] Decide whether portal translator API should reuse the existing Gemini service directly or adapt it into Next.js route handlers.
- [ ] Write failing tests for the portal translator service contract.
- [ ] Port translator UI into `/tools/declarative-language-translator`.
- [ ] Port translation prompt behavior.
- [ ] Port variation behavior.
- [ ] Port local history behavior if it still fits the portal UX.
- [ ] Port privacy and terms language where still relevant.
- [ ] Ensure analytics does not capture typed phrases or generated translations.
- [ ] Add donation prompt after translation value is delivered.
- [ ] Update migration inventory status when parity is verified.

Verification:

- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run test:e2e` once translator e2e coverage exists.
- [ ] Browser check short parent phrase translation.
- [ ] Browser check tone/variation controls.
- [ ] Browser check copy-to-clipboard.
- [ ] Browser check loading, error, and empty states.
- [ ] Use `$playwright-cli` for quick snapshots and console/network inspection during migration.
- [ ] Use `$playwright-interactive` for final visual QA of the migrated translator route.
- [ ] Compare output quality against existing Declarative App examples/evals.
- [ ] Confirm no sensitive typed/generated text is sent to analytics.

## Phase 5: PDA IEP Advice Migration

Goal: Bring the high-value PDA Your IEP analyzer, accommodations, and guide into the portal as a native feature suite.

Source project:

```text
/Users/kyle.wegner/Antigravity
```

Primary source files:

- `src/app/analyze/page.tsx`
- `src/components/analyze-page-client.tsx`
- `src/components/upload-zone.tsx`
- `src/lib/rag-engine.ts`
- `src/lib/server/uploads.ts`
- `src/lib/server/security.ts`
- `src/lib/server/api-types.ts`
- `src/data/rag_docs/`
- `src/app/accommodations/page.tsx`
- `src/app/pda-guide/page.tsx`
- `src/app/privacy/page.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/terms/page.tsx`
- `tests/critical-flows.spec.ts`
- `tests/analyze.spec.ts`
- `tests/api.spec.ts`

Tasks:

- [ ] Inventory current upload, PDF parsing, security, human verification, and history behavior.
- [ ] Inventory current RAG docs, prompts, and response schema.
- [ ] Decide which Antigravity modules can be copied as-is and which need portal adaptation.
- [ ] Write failing tests for upload validation and API response shape.
- [ ] Port server config and environment handling needed for analyzer routes.
- [ ] Port upload validation and security protections.
- [ ] Port RAG engine and source docs.
- [ ] Port analyzer API route under portal route structure.
- [ ] Port analyzer UI into `/tools/pda-iep-advice/analyze`.
- [ ] Port accommodations page into `/tools/pda-iep-advice/accommodations`.
- [ ] Port guide page into `/tools/pda-iep-advice/guide`.
- [ ] Port privacy, terms, and disclaimer language into portal-level pages or shared components.
- [ ] Replace old product naming with PDA IEP Advice where user-facing.
- [ ] Update migration inventory status when parity is verified.

Verification:

- [ ] `npm test`
- [ ] `npm run build`
- [ ] Port or rewrite relevant Playwright tests from Antigravity.
- [ ] `npm run test:e2e` once analyzer e2e coverage exists.
- [ ] Browser check valid PDF upload.
- [ ] Browser check invalid file rejection.
- [ ] Browser check analyzer output is printable/readable.
- [ ] Browser check accommodations route.
- [ ] Browser check guide route.
- [ ] Use `$playwright-cli` for upload smoke checks with fixtures and console/network inspection.
- [ ] Use `$playwright-interactive` for final analyzer, accommodations, guide, desktop, and mobile visual QA.
- [ ] Run security-focused review before public exposure of upload/API behavior.
- [ ] Confirm uploaded document content is not captured in analytics.
- [ ] Confirm privacy stance is at least as strong as the source app.

## Phase 6: PDA Behavior Report Help Migration

Goal: Bring the existing behavior report analyzer into the portal as a standalone native feature.

Source project:

```text
/Users/kyle.wegner/Antigravity
```

Primary source files:

- `src/app/behavior-report/page.tsx`
- `src/components/behavior-report-page-client.tsx`
- `src/components/dual-upload-zone.tsx`
- `src/lib/analyze-report-normalization.ts`
- `src/lib/rag-engine.ts`
- `src/lib/server/uploads.ts`
- `src/lib/server/security.ts`
- `src/lib/server/api-types.ts`
- `tests/behavior-report.spec.ts`
- `tests/api.spec.ts`

Tasks:

- [ ] Inventory current behavior report flow and output schema.
- [ ] Preserve standalone route at `/tools/pda-behavior-report-help`.
- [ ] Write failing tests for dual-upload validation.
- [ ] Port dual-upload UI.
- [ ] Port behavior report API route.
- [ ] Port report normalization logic.
- [ ] Port IEP/504 comparison behavior.
- [ ] Preserve output focus on missed supports, context, PDA-aware interpretation, and next steps.
- [ ] Replace old product naming with PDA Behavior Report Help where user-facing.
- [ ] Update migration inventory status when parity is verified.

Verification:

- [ ] `npm test`
- [ ] `npm run build`
- [ ] Port or rewrite `tests/behavior-report.spec.ts`.
- [ ] `npm run test:e2e` once behavior report e2e coverage exists.
- [ ] Browser check valid behavior report plus IEP/504 upload.
- [ ] Browser check invalid file rejection.
- [ ] Browser check generated output is readable and printable.
- [ ] Use `$playwright-cli` for upload smoke checks with fixtures and console/network inspection.
- [ ] Use `$playwright-interactive` for final behavior report desktop and mobile visual QA.
- [ ] Run security-focused review before public exposure of upload/API behavior.
- [ ] Confirm this feature is not nested under PDA IEP Advice in navigation.
- [ ] Confirm uploaded document content is not captured in analytics.

## Phase 7: Launch, SEO, Redirects, and Operational Readiness

Goal: Make the portal ready to be the canonical home without losing continuity from existing standalone tools.

- [ ] Choose deployment target.
- [ ] Add production environment documentation.
- [ ] Add canonical metadata for portal pages.
- [ ] Add `llms.txt` or equivalent AI-readable project summary if useful.
- [ ] Add sitemap/robots handling.
- [ ] Add live donation destination.
- [ ] Add privacy-safe analytics events for generation, print/export, email copy, short-text copy, donation click, and share click.
- [ ] Confirm analytics never captures child, school, document, typed phrase, or generated-output content.
- [ ] Create bridge/redirect plan for old Declarative App URLs.
- [ ] Create bridge/redirect plan for old PDA Your IEP URLs.
- [ ] Create bridge/redirect plan for old behavior report URLs.
- [ ] Add basic error monitoring plan.
- [ ] Add maintenance-mode or feature-unavailable pattern if migrated AI/API features are temporarily unavailable.

Verification:

- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run test:e2e` once checked-in Playwright coverage exists.
- [ ] Browser check production deployment.
- [ ] Use `$playwright-cli` for production route smoke checks, console/network checks, and redirect validation.
- [ ] Use `$playwright-interactive` for final launch visual QA on desktop and mobile.
- [ ] Run a threat model or security scan for upload, AI, analytics, and deployment surfaces.
- [ ] Check canonical URLs in page metadata.
- [ ] Check old URLs route to bridge or redirect pages when ready.
- [ ] Confirm analytics payloads are privacy-safe.
- [ ] Confirm donation links work.

## Phase 8: Better Personalization Without Daily Burden

Goal: Improve output quality without turning the product into a tracker, dashboard, or maintenance loop.

- [ ] Evaluate whether local-only browser saving is worth adding.
- [ ] If local saving is added, clearly label it as stored on the user's device.
- [ ] Add optional "help me word this better" assistance only after template-first behavior is solid.
- [ ] Add stronger audience-specific template variations.
- [ ] Add optional school-year, appointment, or activity-context presets.
- [ ] Add user-editable tone controls if they improve output without adding complexity.

Verification:

- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run test:e2e` when personalization affects browser behavior.
- [ ] Browser check local-only behavior.
- [ ] Use `$playwright-interactive` for local-storage/privacy-state QA when local-only saving is added.
- [ ] Confirm no server-side Support Sheet Builder storage was introduced.
- [ ] Confirm new personalization options do not make the first useful output slower or more demanding.

## Current Best Next Build

Recommended next task:

1. Improve Support Sheet Builder output quality before migrating heavier AI/upload features.
2. Start with audience-specific template wording and public example sheets.
3. Add browser-level tests for the builder flow.

Why:

- It strengthens the tool that is already native in the portal.
- It improves shareability before launch.
- It creates a stronger design/content pattern for later migrated tools.
- It avoids jumping into the heavier upload/AI migrations before the new portal's first tool feels genuinely useful.

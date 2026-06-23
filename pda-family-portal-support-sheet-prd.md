# Product Brief + Build PRD: PDA Family Portal and Support Sheet Builder

Date: 2026-06-23  
Status: Draft for build planning  
Primary audience: Kyle, Codex build sessions, and any future collaborator helping shape the product  

## Why This Document Type

This should be treated as a **Product Brief + Build PRD**, not a traditional corporate PRD.

A normal PRD usually focuses on feature requirements. That is useful, but not enough here. This product also needs a clear organic-sharing story because there is no marketing team, no ad budget, and no appetite for a tool that asks exhausted parents to maintain another system.

This document therefore combines:

- **Product strategy:** why this should exist, why it may spread, and how it fits the larger PDA family tool vision.
- **MVP definition:** what to build first and what to intentionally leave out.
- **Build requirements:** screens, flows, content, exports, privacy expectations, and acceptance criteria.
- **Launch positioning:** how to explain the value quickly to parents and caregivers.

## Executive Summary

Create a free web portal for PDA families that brings together Kyle's existing and future PDA tools as native features in one place.

The portal should eventually include:

- **Declarative Language Translator:** migrated or rebuilt from the existing Declarative App functionality. It turns direct or demand-heavy language into more declarative, autonomy-preserving phrasing.
- **PDA IEP Advice:** migrated or rebuilt from the existing PDA Your IEP analyzer functionality. It helps parents review IEPs, 504 plans, accommodations, and school advocacy language through a PDA-aware lens.
- **PDA Behavior Report Help:** migrated or rebuilt from the existing behavior report functionality on the PDA Your IEP site. It helps parents review behavior incident reports through a PDA-aware lens and compare what happened against the child's documented supports.
- **PDA Support Sheet Builder:** a new low-friction feature that creates a one-page, audience-specific handoff sheet for adults who need to support a PDA child.

The existing standalone projects should be treated as source applications, not merely external links. The portal should pull the best proven logic, prompts, content, privacy posture, and interface patterns from those projects into a unified experience.

The first new component should be the **PDA Support Sheet Builder**.

Its promise:

> Create a one-page guide for the adults who do not understand your PDA child yet.

The parent should be able to answer a short set of prompts and receive a polished, printable, copyable, and shareable support sheet for a teacher, grandparent, babysitter, coach, dentist, therapist, or other adult.

The product should not feel like paperwork. It should feel like relief.

## Product Vision

The long-term vision is a single trusted free destination for practical PDA family tools.

This should become the canonical product home. Existing apps may remain live during the transition, but the strategic direction is not to maintain a loose network of separate branded tools. The direction is to migrate, duplicate, fork, or rebuild the useful parts of those tools into one coherent portal.

This portal should not try to become a social network, course platform, tracker, or daily parenting dashboard. The strongest product identity is:

> Free, practical tools that reduce the amount of explaining, translating, advocating, and emotional labor PDA families have to do.

The family of tools should share a common philosophy:

- Low input whenever possible.
- High-value output.
- No daily maintenance loops.
- No guilt, streaks, or pressure.
- Clear artifacts parents can use immediately.
- Practical PDA-aware language that helps other adults respond better.
- Donation-supported, but usable without payment.

## Strategic Fit

The current standalone Declarative App works because the value is instantly legible:

> Type a phrase. Get a better phrase.

The current standalone PDA Your IEP project works because the value is high enough to justify deeper input:

> Put in effort once. Get stronger school advocacy.

The Support Sheet Builder should sit between those two:

> Answer a few questions. Get a usable handoff sheet you can send to the next adult.

It is not quite as instantly magical as Declarative App, so the framing matters. The public-facing pitch should not be "build a profile." That sounds like administrative work.

The better positioning is:

> Stop re-explaining your child from scratch.

Or:

> Help other adults stop accidentally escalating your child.

The Support Sheet Builder has organic-sharing potential because the output itself is meant to be sent to other people. Each PDF, email, or text handoff can quietly introduce the tool to another teacher, therapist, relative, or parent.

The broader portal also has organic-sharing potential because each feature can lead naturally to another:

- A parent using the Declarative Language Translator may later need a teacher handoff sheet.
- A parent preparing for an IEP meeting may also need a PDA support sheet for school staff.
- A parent reviewing a behavior incident may need PDA IEP Advice if the report reveals gaps in documented supports.
- A parent using the Support Sheet Builder may discover the IEP advice or behavior report tools when school support becomes the next problem.

## Problem Statement

Parents and caregivers of PDA children often have to repeatedly explain the same things to new adults:

- Why direct demands can backfire.
- Why typical rewards, consequences, or "firm boundaries" may escalate rather than help.
- What the child looks like when they are starting to struggle.
- What language works better.
- What to avoid in the moment.
- How to help the child recover.

This explaining often happens when the parent is already tired, anxious, defensive, or under pressure.

The current alternatives are not good enough:

- Blank templates still require the parent to write everything from scratch.
- Long PDA articles are useful but too much to hand to a substitute teacher, grandparent, babysitter, or dentist.
- Generic autism passports may miss PDA-specific communication needs.
- Parent-written notes can sound defensive, too long, too emotional, or too vague, even when the parent is right.

The product should turn a parent's lived knowledge into calm, credible, audience-specific language.

## Target Users

### Primary User

The primary user is a parent or caregiver of a PDA child who needs another adult to understand the child quickly.

Likely emotional state:

- Tired.
- Time-constrained.
- Protective.
- Frustrated from not being believed.
- Worried that another adult will unintentionally make things worse.
- Hoping for something practical enough to send without overexplaining.

### Secondary Recipients

The generated support sheet is intended for:

- Teachers.
- Substitute teachers.
- School administrators.
- Grandparents.
- Relatives.
- Babysitters.
- Coaches.
- Camp or activity leaders.
- Doctors.
- Dentists.
- Therapists.
- Evaluators.

These recipients are not the main users of the tool, but they must be able to understand and act on the output.

## Core Use Cases

### Use Case 1: New Teacher or School Staff

A parent wants to send a short, credible support sheet before the school year starts, after a classroom change, or before a meeting.

The output should help staff understand:

- What helps the child feel safe.
- How to phrase requests.
- What early signs of distress look like.
- What can escalate the situation.
- What to do before using consequences or formal behavior plans.

### Use Case 2: Grandparent or Relative

A parent wants a family member to understand that PDA support is not permissive parenting.

The output should gently explain:

- Why direct pressure can make things harder.
- Why preserving autonomy matters.
- What connection looks like for this child.
- How the relative can help without turning it into a debate about discipline.

### Use Case 3: Babysitter or Childcare

A parent needs a practical, short handoff sheet for someone supervising the child.

The output should focus on:

- Safety.
- What to avoid.
- Easy ways to lower demands.
- What to do if the child is overwhelmed.
- When to contact the parent.

### Use Case 4: Medical, Dental, or Therapy Appointment

A parent wants to reduce distress around an appointment.

The output should focus on:

- Consent and previewing.
- Giving choices.
- Avoiding surprise demands.
- Reducing language when the child is overwhelmed.
- Letting the child recover or pause.

### Use Case 5: Activity, Camp, or Coach

A parent wants a non-school adult to understand the child without reading a long clinical explanation.

The output should focus on:

- Participation without pressure.
- Flexible expectations.
- Avoiding public callouts.
- Protecting dignity.
- Offering choices and exits.

## Product Principles

1. **Less explaining, more understanding.**  
   The product exists to reduce parent labor, not create a new parent task.

2. **No daily loop.**  
   This should be event-driven. Parents use it when a new adult, setting, transition, or appointment creates a need.

3. **Output first.**  
   The generated sheet, email, and text are the product. The form is only a means to get there.

4. **PDA-aware, not behaviorist.**  
   Language should emphasize safety, autonomy, collaboration, nervous-system load, flexibility, and low-arousal support.

5. **Parent-editable.**  
   The tool should never pretend it knows the child better than the caregiver does.

6. **No shame.**  
   The experience should not imply that the parent has failed to explain properly before.

7. **Private by default.**  
   Child information is sensitive. The MVP should not require accounts or server-side storage.

8. **Shareable by design.**  
   The output should be something a parent can confidently send.

## Positioning

### Primary Headline Options

Recommended:

> Create a one-page guide for the adults who do not understand your PDA child yet.

Alternative:

> Stop re-explaining your child from scratch.

Alternative:

> Help teachers, relatives, and caregivers support your PDA child with less guesswork.

### Supporting Copy

Recommended:

> Answer a few simple prompts and get a printable, copyable support sheet for teachers, grandparents, babysitters, coaches, providers, and other adults in your child's life.

### Value Proposition

For PDA parents and caregivers who are tired of repeatedly explaining their child, the Support Sheet Builder creates a calm, practical, audience-specific handoff sheet in minutes.

Unlike blank templates or long articles, it helps turn parent knowledge into language another adult can understand and use.

### Donation-Supported Framing

Donation prompt should appear after value is delivered, not before.

Suggested copy:

> If this saved you an hour of emotional labor, you can help keep it free for the next parent.

## Portal Information Architecture

The portal should be designed as a home for multiple native features, not a directory of separate apps.

Former standalone project names can remain useful internally, but the parent-facing portal should present them as clear feature names. The parent should not need to know that these began as separate projects.

Suggested top-level structure:

- **Home:** short explanation of the free PDA family tools.
- **Tools:** list of available tools.
- **Declarative Language Translator:** migrated Declarative App functionality.
- **Support Sheet Builder:** new tool described in this document.
- **PDA IEP Advice:** migrated PDA Your IEP analyzer and school-advocacy functionality.
- **PDA Behavior Report Help:** migrated behavior report functionality from the PDA Your IEP site, treated as a separate portal feature.
- **About:** mission, disclaimers, donation-supported model.
- **Donate:** optional support.

The portal should make tools feel related but not tangled. Each tool should have its own clear purpose and URL.

Suggested URL pattern:

- `/tools/declarative-language-translator`
- `/tools/support-sheet-builder`
- `/tools/pda-iep-advice`
- `/tools/pda-iep-advice/analyze`
- `/tools/pda-iep-advice/accommodations`
- `/tools/pda-behavior-report-help`

Existing standalone URLs can be used as a temporary launch bridge while migration is incomplete. The final strategy should be native portal routes, not iframes and not permanent external handoffs.

`/tools/pda-behavior-report-help` is a provisional route name. Final naming can change later, but the product strategy should remain: behavior report review is a standalone feature in the portal, not a nested IEP analyzer screen.

### Feature Naming Strategy

Use plain feature names in the portal.

| Existing standalone project | Portal feature name | Parent-facing job |
| --- | --- | --- |
| Declarative App | Declarative Language Translator | Turn direct, demand-heavy language into gentler PDA-aware phrasing. |
| PDA Your IEP analyzer | PDA IEP Advice | Review IEPs, 504 plans, accommodations, and school supports through a PDA-aware lens. |
| PDA Your IEP behavior report tool | PDA Behavior Report Help | Review behavior incident reports through a PDA-aware lens and identify missed supports or next steps. |
| New feature | Support Sheet Builder | Create a one-page guide for adults supporting the child. |

The old project names can be retained in code comments, migration notes, redirects, or source documentation, but they should not drive the new portal's product language.

## Existing Source Apps and Migration Strategy

The portal should not imitate the existing tools from scratch. It should reuse the best of the real projects already available locally and on GitHub.

### Local Source Projects

Use these local projects as migration sources:

- **Declarative App source:** `/Users/kyle.wegner/Dev Projects/declarative`
- **PDA Your IEP source:** `/Users/kyle.wegner/Antigravity`

The local PDA IEP source is the heavier technical foundation because it already uses Next.js, file uploads, PDF parsing, API routes, privacy pages, and Playwright tests. Declarative App is simpler and should be easier to port into that kind of portal.

### Recommended Technical Direction

Build the new portal as a unified Next.js app, most likely by creating a new portal project and using the PDA Your IEP project as the closest technical reference or controlled fork.

Rationale:

- PDA IEP Advice and PDA Behavior Report Help both require server-side upload handling, PDF extraction, AI calls, rate limiting, privacy copy, and testing.
- Declarative Language Translator is a smaller interactive tool and can be ported into a Next.js route more easily than rebuilding the IEP analyzer inside a Vite/Express app.
- The Support Sheet Builder can be implemented cleanly as a template-driven Next.js feature with mostly client-side state and print-friendly output.

The implementation should avoid a blind wholesale copy. Use a controlled migration:

1. Inventory the existing feature behavior and reusable modules.
2. Create the new portal shell and shared design system.
3. Port or adapt one feature at a time.
4. Preserve working prompts, evaluation assets, privacy language, and tests wherever they still fit.
5. Replace old branding with portal-level naming.
6. Verify parity before redirecting or de-emphasizing the old standalone experiences.

### Declarative Language Translator Migration

Source project:

`/Users/kyle.wegner/Dev Projects/declarative`

Reusable pieces to inspect and migrate:

- `components/Translator.tsx`
- `services/geminiService.ts`
- `services/translationPrompt.js`
- `services/translationUtils.ts`
- `services/historyStorage.ts`
- `services/analytics.ts`
- `components/DonationCallout.tsx`
- `components/PrivacyPolicy.tsx`
- `components/TermsOfService.tsx`
- `evals/` prompt sets and quality rubrics
- `server.js` and API behavior for `/api/translate`

Portal migration goal:

- Native route: `/tools/declarative-language-translator`
- Parent-facing name: "Declarative Language Translator"
- Preserve the fast input-output loop.
- Preserve the proven translation prompt behavior and quality evaluation assets.
- Rework UI only enough to fit the portal shell.
- Keep the donation moment after value is delivered.

### PDA IEP Advice Migration

Source project:

`/Users/kyle.wegner/Antigravity`

Reusable pieces to inspect and migrate:

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

Portal migration goal:

- Main native route: `/tools/pda-iep-advice`
- Analyzer route: `/tools/pda-iep-advice/analyze`
- Accommodations route: `/tools/pda-iep-advice/accommodations`
- Guide route: `/tools/pda-iep-advice/guide`
- Parent-facing name: "PDA IEP Advice"
- Keep the high-value, higher-touch nature of the feature.
- Preserve the privacy-conscious upload stance.

### PDA Behavior Report Help Migration

Source project:

`/Users/kyle.wegner/Antigravity`

Reusable pieces to inspect and migrate:

- `src/app/behavior-report/page.tsx`
- `src/components/behavior-report-page-client.tsx`
- `src/components/dual-upload-zone.tsx`
- `src/lib/analyze-report-normalization.ts`
- `src/lib/rag-engine.ts`
- `src/lib/server/uploads.ts`
- `src/lib/server/security.ts`
- `src/lib/server/api-types.ts`
- `src/app/privacy/page.tsx`
- `src/app/privacy-policy/page.tsx`
- `src/app/terms/page.tsx`
- `tests/behavior-report.spec.ts`
- `tests/api.spec.ts`

Portal migration goal:

- Native route: `/tools/pda-behavior-report-help`
- Parent-facing name: "PDA Behavior Report Help" as a provisional name.
- Treat behavior incident review as a standalone product in the portal, not a nested page under PDA IEP Advice.
- Preserve the current ability to compare a behavior incident report against an IEP or 504 Plan.
- Keep the output focused on missed supports, context, PDA-aware interpretation, and practical next steps.
- Preserve the privacy-conscious upload stance.
- Finalize product naming later without changing the standalone-product architecture.

### Transition and Redirect Strategy

During migration, the old sites can stay live. They should act as continuity anchors while the new portal reaches parity.

Recommended transition:

1. New portal launches with Support Sheet Builder and feature cards.
2. Any not-yet-migrated features temporarily link to the old standalone app.
3. Once a feature is migrated and verified, the portal becomes the primary experience.
4. Old domains can redirect to the corresponding portal routes or show a simple "This tool has moved into PDA Family Tools" page.
5. Keep canonical SEO and `llms.txt` style metadata updated so search engines and AI assistants understand the new home.

### Migration Acceptance Criteria

A migrated feature is considered complete when:

- The parent-facing feature exists at the new portal route.
- Core behavior matches or improves on the old standalone feature.
- The old feature's strongest prompts, content, and privacy language have been reviewed and ported where still appropriate.
- Existing tests have been ported, rewritten, or replaced with equivalent coverage.
- Analytics do not capture sensitive child, school, document, or generated-output content.
- Donation prompts remain value-after-delivery.
- The feature uses portal naming and navigation rather than old standalone branding.
- The old URL has a clear redirect, bridge page, or deprecation plan.

## MVP Scope

### Build First

The first version should include:

- Portal landing page with tool cards.
- Native route structure for all four initial feature areas.
- Clear feature naming that does not depend on the old standalone app names.
- Support Sheet Builder landing section.
- Audience picker.
- Guided form.
- Generated one-page support sheet preview.
- Editable generated text.
- Print-friendly output.
- Copyable email version.
- Copyable short text version.
- Donation prompt after generation/export.
- Privacy note explaining that no account is required and child details are not stored by default.
- Source/grounding page or footer linking to trusted PDA resources.
- Temporary bridge links to existing Declarative App, PDA Your IEP, and the existing behavior report route only where the native portal feature has not been migrated yet.
- A migration inventory that maps current source files to future portal features.

### Do Not Build First

Do not include these in the MVP:

- User accounts.
- Cloud saving.
- Parent dashboards.
- Daily tracking.
- Daily behavior logs or tracking workflows.
- Sharing links that store child information on a server.
- Multi-child household management.
- Professional collaboration workflows.
- Paid tiers.
- AI-only generation that cannot work without an API.
- Medical, legal, diagnostic, or school-law guarantees.
- Permanent iframes or thin wrappers around the old standalone apps.
- A full migration of every existing feature before the Support Sheet Builder can ship.

## Recommended Build Approach

Build the portal as a unified app with native feature routes.

For the Support Sheet Builder specifically, build it as a mostly template-driven web app first.

This means the app uses structured questions and carefully written content templates to generate the support sheet. This is cheaper, more predictable, more private, and easier to verify than an AI-first version.

Optional AI assistance can be added later as a "help me word this better" feature, especially for turning rough parent notes into calm, audience-appropriate phrasing.

For the existing tools, use source-guided migration rather than emulation. That means the builder should inspect and port the actual working code, prompts, content, privacy approach, and tests from the existing projects.

Recommended portal build base:

- Use Next.js for the new portal because the IEP feature set already depends on server-side upload and document processing patterns.
- Treat `/Users/kyle.wegner/Antigravity` as the closest technical reference or fork candidate.
- Treat `/Users/kyle.wegner/Dev Projects/declarative` as the feature source for the translator.
- Keep the portal product language unified even when the underlying feature code comes from different source projects.

### Why Template-First Is Recommended

- Lower cost to operate.
- Easier to keep free.
- More consistent outputs.
- Less risk of incorrect or overconfident language.
- Easier to run fully in the browser.
- Better privacy posture.
- Easier for Codex to build and test.

## User Flow

### Step 1: Choose Audience

Prompt:

> Who is this support sheet for?

Options:

- Teacher or school staff.
- Substitute teacher.
- Grandparent or relative.
- Babysitter or childcare.
- Coach, camp, or activity leader.
- Doctor, dentist, or therapist.
- Custom adult.

The selected audience changes the default wording, examples, and output emphasis.

### Step 2: Basic Child Context

Fields:

- Child name or nickname.
- Optional pronouns.
- Child age range.
- A few things the child enjoys, trusts, or connects through.

The tool should explain that parents can use a nickname if they prefer.

### Step 3: What Helps

Prompt:

> What helps this child feel safer or more regulated?

Input style:

- Multi-select chips.
- Optional text field.

Example options:

- Extra processing time.
- Choices.
- Indirect language.
- Humor or playfulness.
- Low voice / calm tone.
- Space to pause.
- Previewing what will happen.
- Reduced language when overwhelmed.
- A trusted adult nearby.
- Sensory supports.
- Permission to opt out or try later.

### Step 4: What Feels Like a Demand

Prompt:

> What kinds of things can quickly feel like pressure?

Example options:

- Direct instructions.
- Being watched.
- Being rushed.
- Public correction.
- Unexpected transitions.
- Losing control over choices.
- Too many questions.
- Consequences or threats.
- Praise that creates performance pressure.
- Physical prompting.

### Step 5: Early Signs of Distress

Prompt:

> How might someone notice that the child is starting to struggle?

Example options:

- Goes quiet.
- Says no repeatedly.
- Negotiates or delays.
- Leaves the area.
- Becomes silly or disruptive.
- Freezes.
- Becomes louder.
- Hides.
- Complains of pain or illness.
- Appears controlling.

The generated language should avoid moralizing these signs.

### Step 6: Please Avoid

Prompt:

> What usually makes things harder?

Example options:

- Pushing through refusal.
- Repeating the demand louder.
- Public consequences.
- Taking away preferred items in the moment.
- Debating.
- Saying "you have to."
- Surprise changes.
- Touching without consent.
- Turning it into a power struggle.

### Step 7: If Things Escalate

Prompt:

> What should the adult do if things are getting hard?

Example options:

- Reduce language.
- Create space.
- Remove the immediate demand if possible.
- Offer a neutral reset.
- Avoid consequences in the moment.
- Contact parent/caregiver.
- Move to a quieter area.
- Offer choices without requiring an answer.
- Wait before trying again.

### Step 8: Recovery and Afterward

Prompt:

> What helps after a hard moment?

Example options:

- Time alone.
- No post-event lecture.
- Reconnection without shame.
- A snack or drink.
- Quiet activity.
- Preferred interest.
- Sensory regulation.
- Try again later.
- Parent contact.

### Step 9: Generate Outputs

The tool generates:

- One-page support sheet.
- Email version.
- Short text version.

The parent can edit all generated text before printing or copying.

## Generated Output Requirements

### One-Page Support Sheet

The printable support sheet should include:

- Title: "How to Support [Name]"
- Audience-specific subtitle.
- Short child-introduction section.
- What helps.
- What may feel like pressure.
- Early signs of distress.
- Please avoid.
- If things escalate.
- Recovery / afterward.
- Contact or parent note.
- Quiet footer linking back to the free tool.

The design should be simple, credible, and printer-friendly. It should not look childish or overly clinical.

### Email Version

The email version should include:

- A short greeting.
- A calm explanation of why the parent is sharing the support sheet.
- The same support content in readable plain text.
- A collaborative closing.

Example tone:

> I wanted to share a short support guide for [Name]. PDA can mean that everyday demands sometimes register as a threat, especially when [Name] feels rushed, watched, or out of control. The ideas below are the approaches that tend to help [Name] stay connected and able to participate.

### Short Text Version

The short version should be appropriate for a babysitter, relative, coach, or quick message.

It should be concise enough to paste into a text message.

Example shape:

> Quick note for supporting [Name]: direct instructions can feel like pressure, so choices, indirect language, and extra time usually work better. If [Name] gets stuck, please reduce language, give space, and avoid turning it into a power struggle. If things are escalating, call/text me.

## Content Model

The app should store the parent's answers in a structured object.

Conceptual shape:

```json
{
  "audience": "teacher",
  "child": {
    "name": "Sam",
    "pronouns": "they/them",
    "ageRange": "elementary",
    "connectionPoints": ["Minecraft", "drawing", "animals"]
  },
  "helps": ["choices", "extra_processing_time", "indirect_language"],
  "demands": ["direct_instructions", "being_rushed", "public_correction"],
  "distressSigns": ["goes_quiet", "negotiates_or_delays", "leaves_area"],
  "avoid": ["pushing_through_refusal", "public_consequences", "debating"],
  "escalationPlan": ["reduce_language", "create_space", "remove_demand"],
  "recovery": ["time_alone", "no_post_event_lecture", "reconnect_without_shame"],
  "customNotes": ""
}
```

The app should use this structured data to render the support sheet, email, and text message.

## Template Strategy

Each selectable item should have:

- A parent-facing label.
- A recipient-facing phrase.
- Audience-specific variations where needed.
- Optional explanatory text.

Example:

Parent-facing label:

> Direct instructions.

Recipient-facing teacher wording:

> Direct instructions can quickly feel like pressure. [Name] often does better when adults use indirect language, offer choices, or invite collaboration.

Recipient-facing grandparent wording:

> Direct instructions can feel much bigger to [Name] than they look from the outside. Offering choices or making things feel collaborative usually works better than insisting in the moment.

Recipient-facing medical wording:

> Direct instructions can increase distress, especially during unfamiliar procedures. Previewing, asking consent, and offering choices can help [Name] stay more regulated.

## Tone Guidelines

Generated language should be:

- Calm.
- Practical.
- Non-accusatory.
- Credible.
- Neuroaffirming.
- Specific.
- Short enough for a busy adult to use.

Generated language should avoid:

- Blaming the child.
- Blaming the recipient.
- Saying the child is manipulative.
- Overpromising outcomes.
- Overclinical language.
- Long explanations of PDA.
- Legal threats.
- Jargon without explanation.

## Privacy Requirements

MVP privacy expectations:

- No login required.
- Do not store child details on the server.
- Keep form data local to the browser during the session.
- If local saving is added, clearly explain it is stored on the user's device.
- Do not create share links containing child information in the MVP.
- Make it easy to clear/reset the form.

Suggested privacy note:

> This tool does not require an account. The information you enter is used to create your support sheet and should not be stored by us unless a future version clearly asks for your permission.

If analytics are used, avoid recording form answers or child details.

## Safety and Disclaimer Requirements

The tool should include a plain-language disclaimer:

> This tool is for practical communication and educational support. It is not medical, legal, diagnostic, or therapeutic advice. You know your child best; edit anything that does not fit.

For school-related outputs, avoid implying that the document creates legal accommodations by itself.

## Success Metrics

Because this project depends on organic sharing, success should be measured by usefulness and spread, not account creation.

Recommended metrics:

- Number of support sheets generated.
- Number of print/export actions.
- Number of email/text copy actions.
- Donation conversion after export.
- Repeat usage within the same browser, if measurable without storing sensitive content.
- Referral traffic from generated-output footer links.
- Qualitative comments from parent groups or direct feedback.

Do not optimize for:

- Time on page.
- Daily active users.
- Account creation.
- Streaks.
- Content consumption.

## Organic Sharing Mechanics

The product should be built so sharing happens naturally through use.

Recommended mechanics:

- Footer on generated PDFs: "Created with the free PDA Support Sheet Builder" plus URL.
- Similar quiet footer in copied email, removable by the parent.
- Public sample support sheets for common audiences.
- A concise "share this tool" button after export.
- Donation prompt after a successful output.

The public sample pages are especially important because they let people understand the value before entering personal information.

Suggested sample pages:

- Example support sheet for a new teacher.
- Example support sheet for grandparents.
- Example support sheet for a babysitter.
- Example support sheet for a dentist.
- Example support sheet for a coach or activity leader.

## MVP Acceptance Criteria

The MVP is ready when:

- A parent can understand the value within 5 seconds of landing on the tool.
- A parent can generate a useful support sheet in under 5 minutes.
- The generated one-page output prints cleanly.
- The parent can edit generated wording before printing or copying.
- The email version is copyable and readable without formatting.
- The short text version is concise enough for a message.
- The tool works on mobile and desktop.
- The tool does not require login.
- The tool does not store child details server-side.
- The portal presents Declarative Language Translator, PDA IEP Advice, PDA Behavior Report Help, and Support Sheet Builder as related native features.
- The PRD or build plan identifies which existing source files/modules are being migrated from the Declarative App and PDA Your IEP projects.
- Any temporary links to old standalone apps are clearly treated as launch bridges, not the final architecture.
- The donation ask appears only after useful output is produced.

## Suggested Build Phases

### Phase 1: Portal Foundation and Migration Inventory

Goal: Create the home for the broader PDA family tool ecosystem and make the source migration explicit.

Build:

- Portal home.
- Tool cards for Declarative Language Translator, Support Sheet Builder, PDA IEP Advice, and PDA Behavior Report Help.
- Navigation.
- About/mission page.
- Shared privacy/disclaimer structure.
- Shared donation/support entry point.
- Native route placeholders for each feature.
- Source inventory for what will be migrated from `/Users/kyle.wegner/Dev Projects/declarative` and `/Users/kyle.wegner/Antigravity`.
- Temporary bridge links to old live tools only when the native route is not migrated yet.

### Phase 2: Support Sheet Builder MVP

Goal: Build the first complete version of the new tool.

Build:

- Audience picker.
- Guided form.
- Structured response state.
- Template engine.
- Editable output preview.
- Print stylesheet.
- Copy email.
- Copy short text.
- Donation prompt.
- Privacy/disclaimer copy.

### Phase 3: Declarative Language Translator Migration

Goal: Bring the proven Declarative App functionality into the portal as a native feature.

Build:

- Native route at `/tools/declarative-language-translator`.
- Ported translation UI and interaction model.
- Ported Gemini translation service and prompt behavior.
- Ported or adapted prompt quality evaluation materials.
- Portal-consistent privacy, donation, and analytics handling.
- Old Declarative App links updated to point toward the portal once parity is verified.

### Phase 4: PDA IEP Advice Migration

Goal: Bring the high-value PDA Your IEP functionality into the portal as a native feature suite.

Build:

- Native route at `/tools/pda-iep-advice`.
- IEP/504 analyzer migration.
- PDA accommodations library migration.
- PDA-affirming IEP guide migration.
- Upload/privacy/security behavior preserved or improved.
- Existing tests ported or rewritten against portal routes.

### Phase 5: PDA Behavior Report Help Migration

Goal: Bring the existing behavior report analyzer into the portal as a standalone native feature.

Build:

- Native route at `/tools/pda-behavior-report-help`.
- Behavior incident report upload and review flow.
- IEP/504 comparison upload flow where needed.
- PDA-aware interpretation of incident context, missed supports, and next steps.
- Upload/privacy/security behavior preserved or improved.
- Existing behavior report tests ported or rewritten against portal routes.
- Final name left flexible while the standalone-product architecture remains fixed.

### Phase 6: Redirects, SEO, and Ecosystem Cleanup

Goal: Make the portal the canonical home without breaking families who already know the old URLs.

Build:

- Redirect or "moved into PDA Family Tools" strategy for existing domains.
- Updated metadata, sitemap, and `llms.txt` style content.
- Cross-feature recommendations inside the portal.
- Final naming cleanup so old project names appear only where historically useful.

### Phase 7: Public Examples and Organic Sharing

Goal: Make the value easier to see and easier to share.

Build:

- Public sample support sheets.
- Shareable landing content.
- Footer attribution in generated outputs.
- Feedback link.

### Phase 8: Better Personalization

Goal: Improve output quality without adding parent burden.

Possible additions:

- "Make this warmer / shorter / more school-formal" tone controls.
- Optional AI wording helper.
- Local browser save.
- Duplicate profile for a different audience.
- Multiple child support, only if demand exists.

## Key Product Risks

### Risk 1: The Value Is Too Abstract

Mitigation:

- Lead with the pain: "Stop re-explaining your child from scratch."
- Show sample outputs before asking for input.
- Make the first screen concrete: teacher, grandparent, babysitter, dentist.

### Risk 2: The Tool Feels Like Paperwork

Mitigation:

- Keep prompts short.
- Use chips and examples.
- Show live progress.
- Generate useful text early.
- Let parents skip anything.

### Risk 3: Output Is Too Generic

Mitigation:

- Audience-specific templates.
- Include connection points and early distress signs.
- Let parents edit every section.
- Provide optional custom notes.

### Risk 4: Recipients Ignore the Sheet

Mitigation:

- Keep output to one page.
- Use plain language.
- Avoid long PDA theory.
- Make the most actionable points visually scannable.

### Risk 5: Privacy Concerns Reduce Trust

Mitigation:

- No account.
- No server-side storage.
- Clear privacy note.
- No share links with child information in MVP.

## Open Product Decisions

These are not blockers for an MVP, but they should be decided before public launch:

- Final portal name.
- Final tool name.
- Final behavior report product name.
- Whether the new portal is created as a fresh repo or as a controlled fork of the PDA Your IEP codebase.
- Whether Declarative App's existing domain redirects immediately after migration or remains as a lightweight landing page for a while.
- Whether PDA Your IEP's existing domain redirects immediately after migration or remains as a lightweight landing page for a while.
- Donation provider and wording.
- Whether AI assistance should be included in the first public version.
- Whether to include "PDA" in the tool name for SEO and clarity, or use softer parent-facing language.

The strategic decision is already made: Declarative App, PDA Your IEP's analyzer functionality, and the existing behavior report functionality should become portal features. The remaining decisions are about migration mechanics, redirect timing, and final naming.

## Recommended Names

### Portal Name Candidates

- PDA Family Tools.
- PDA Parent Tools.
- Low Demand Family Tools.
- PDA Practical Tools.
- The PDA Toolkit.

Recommended working name:

> PDA Family Tools

Reason: clear, plain, search-friendly, and flexible enough to hold multiple tools.

### Tool Name Candidates

- PDA Support Sheet Builder.
- PDA Handoff Sheet.
- PDA One-Page Support Plan.
- How to Support My PDA Child.
- PDA Support Passport.

Recommended working name:

> PDA Support Sheet Builder

Public-facing headline can still be stronger than the name:

> Create a one-page guide for the adults who do not understand your PDA child yet.

### Existing Feature Rename Recommendations

Recommended portal names:

- Declarative App becomes **Declarative Language Translator**.
- PDA Your IEP becomes **PDA IEP Advice**.
- Behavior Report Analyzer becomes **PDA Behavior Report Help** as a provisional standalone feature name.

This keeps the portal practical and descriptive. Parents should immediately understand what each feature does without learning separate product brands.

The behavior report name should be finalized later. The important decision for now is architectural: it is a separate product surface in the portal, even though its source code currently lives in the PDA Your IEP project.

## Source Grounding

The product should remain grounded in reputable PDA and autism support guidance.

Useful sources for future content review:

- PDA Society: [What Helps guides](https://www.pdasociety.org.uk/what-helps-guides/), especially PDA approaches, PANDA, low arousal approaches, transitions, and parenting guidance.
- PDA Society: [PDA approaches](https://www.pdasociety.org.uk/what-helps-guides/pda-approaches/) as a direct content-grounding source for low-demand, collaborative, low-arousal support.
- PDA Society: [PDA In Our Words](https://www.pdasociety.org.uk/research-professional-practice/in-our-words/) and the [full report PDF](https://www.pdasociety.org.uk/wp-content/uploads/2025/12/PDA-In-Our-Words-Full-Report.pdf), especially parent/carer sections about advocacy burden, being believed, judgement, and family support needs.
- PDA North America: [main resources](https://pdanorthamerica.org/) and the [PDA for Teaching Professionals PDF](https://pdanorthamerica.org/wp-content/uploads/2023/08/PDA-for-Teaching-Professionals-1.pdf).
- National Autistic Society: [demand avoidance guidance](https://www.autism.org.uk/advice-and-guidance/behaviour/demand-avoidance) and [autism health passport](https://www.autism.org.uk/advice-and-guidance/physical-health/my-health-passport) concepts.
- NHS England: [health and care passport](https://www.england.nhs.uk/publication/health-and-care-passports/) concept, as broader validation that short personal support documents can help communicate needs.

The product should not copy these resources. It should use them as grounding while creating original, practical parent-facing outputs.

## First Build Prompt for Codex

Use this prompt when starting a future build session:

> Build the first MVP of the PDA Family Tools portal and the PDA Support Sheet Builder described in `pda-family-portal-support-sheet-prd.md`. Treat Declarative App and PDA Your IEP as source projects that will be migrated into the portal as native features, not permanent external links. Use `/Users/kyle.wegner/Antigravity` as the source for PDA IEP Advice and PDA Behavior Report Help, and `/Users/kyle.wegner/Dev Projects/declarative` as the source for Declarative Language Translator. Start with a Next.js portal shell with native routes for Declarative Language Translator, Support Sheet Builder, PDA IEP Advice, and PDA Behavior Report Help. Treat PDA Behavior Report Help as a standalone portal feature even though its source functionality currently lives in the PDA Your IEP project. Then implement the Support Sheet Builder as a no-login, template-driven tool with an audience picker, guided form, editable one-page support sheet preview, print-friendly output, copyable email version, copyable short text version, privacy/disclaimer copy, and donation prompt after generation. Keep child data local to the browser and do not add server-side storage for Support Sheet Builder in the MVP. Include a migration inventory for the existing Declarative, PDA IEP, and behavior report features so later build phases can port the actual working modules, prompts, privacy language, and tests rather than emulating them.

## Bottom Line

This product should not be sold as a "profile builder."

It should be sold as relief from one of the most exhausting parts of PDA parenting:

> explaining your child, again, to someone who may accidentally make things worse.

If the builder can produce a calm, credible, one-page artifact that parents are proud to send, it has a real chance to spread through the same organic channels that helped Declarative App: usefulness first, sharing second, donations after value.

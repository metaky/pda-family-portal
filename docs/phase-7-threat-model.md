# PDA Family Tools Portal Threat Model

Date: 2026-06-24

## Overview

PDA Family Tools is a public Next.js portal for caregivers and advocates. It
offers static guidance pages, local-first browser tools, a declarative language
translator, and protected upload-backed AI analyzers for IEP/504 documents and
behavior incident reports.

The most sensitive assets are:

- Uploaded school-support PDFs and extracted document text.
- Generated AI analysis about a child, school document, or behavior incident.
- Server-only secrets such as `GEMINI_API_KEY`, `TURNSTILE_SECRET_KEY`, and
  `SESSION_SIGNING_SECRET`.
- Verification sessions, warning override tokens, and abuse-control counters.
- Donation routing integrity for public Stripe-hosted checkout links.
- The portal's public credibility as a parent-facing support resource.

The repository is not an authenticated multi-tenant application. It does not
store parent accounts, child profiles, uploaded files, generated outputs, or
payments. Stripe checkout is hosted by Stripe, and the portal only links to
public Stripe destinations.

## Threat Model, Trust Boundaries, and Assumptions

Primary runtime surfaces:

- Public pages and client components under `src/app/` and `src/components/`.
- Public API routes:
  - `src/app/api/declarative/translate/route.ts`
  - `src/app/api/pda-iep-advice/human-verify/route.ts`
  - `src/app/api/pda-iep-advice/analyze/route.ts`
  - `src/app/api/pda-behavior-report-help/analyze/route.ts`
- Server helpers for configuration, security sessions, upload preflight, model
  calls, and analytics filtering under `src/lib/`.
- Cloud Run deployment scaffolding in `Dockerfile` and `cloudbuild.yaml`.

Trust boundaries:

- Browser to server API: all browser form data, request bodies, headers,
  uploaded PDFs, and local-storage browser IDs are attacker-controlled.
- Server to Gemini: PDF bytes, extracted text, and prompts cross from the portal
  server to Google Gemini when live analysis is enabled.
- Server to Cloudflare Turnstile: verification tokens and client IPs cross to
  Cloudflare during human verification.
- Browser to Stripe: donation clicks leave the portal and enter Stripe-hosted
  checkout. Payment details must never be collected by this app.
- Developer/operator to deployment: environment variables and Cloud Run
  substitutions are operator-controlled. Public `NEXT_PUBLIC_` values may be
  visible to users; non-public secrets must never use that prefix.
- Static RAG source files in `src/data/rag_docs/` are developer-controlled
  repository content, not user-controlled runtime input.

Attacker-controlled inputs:

- Typed phrases in the Declarative Language Translator.
- Uploaded PDF bytes, filenames, MIME types, page counts, page dimensions, and
  extractable document text.
- `warningId` values, verification tokens, browser IDs, user agents, and
  network-origin headers.
- Client-side analytics properties passed from UI event handlers.
- Requests to public pages, metadata routes, donation routes, and API endpoints.

Operator-controlled inputs:

- Feature flags, model mode, upload limits, security TTLs, quotas, Turnstile
  configuration, session signing secrets, Gemini configuration, donation URLs,
  public site URL, and Cloud Run substitutions.

Repository-wide invariants:

- Child names, school names, document text, typed phrases, uploaded content, and
  generated output must not be sent to analytics.
- Uploaded documents must not be written to disk, exposed through `public/`, or
  rendered as active browser content.
- Upload-backed AI routes must require human verification, server-side upload
  validation, quota/rate limiting, feature gating, and production secrets before
  public exposure.
- Server-only API keys and signing secrets must stay server-side.
- Model output must be parsed into typed data and rendered through React text
  nodes, not raw HTML.
- Donation links may be public, but the app must not handle payment card data.
- Production must not run with test verification tokens enabled.

Important assumptions:

- Cloud Run, CDN, or the chosen edge layer will enforce request body limits at
  or below the app's upload size limit before broad public launch.
- A production-ready shared security store will replace or supersede the current
  process-local in-memory session/rate-limit store before running multiple
  public Cloud Run instances with upload features enabled.
- Operators will configure real Turnstile keys before enabling protected upload
  routes in production.
- `.env.local` remains ignored and is not committed.

## Attack Surface, Mitigations, and Attacker Stories

### Public Pages and Client Rendering

The main XSS risk is attacker-controlled text flowing back into rendered pages.
Relevant inputs include translator phrases, uploaded document-derived model
outputs, and model-generated analysis. The current implementation renders
content through React text interpolation and does not use raw HTML rendering in
the reviewed upload/report surfaces. Baseline security headers in
`next.config.ts` set `object-src 'none'`, `base-uri 'self'`,
`frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options:
nosniff`, and a restrictive permissions policy.

Realistic attacker story: an attacker submits a malicious phrase or PDF text
that attempts to make the model return HTML or script. The important invariant
is that output remains escaped text and is not passed to `dangerouslySetInnerHTML`.

### Declarative Translator API

The translator accepts user text and calls Gemini through the server-side SDK in
`src/app/api/declarative/translate/route.ts`. Its main risks are model abuse,
prompt injection against output quality, cost abuse, and accidental logging of
typed phrases. The route validates request shape and uses mock mode in tests,
but it does not currently have the same human-verification/rate-limit layer as
upload-backed analyzers.

Realistic attacker story: an automated client sends many translation requests
to burn Gemini quota. This is an operational abuse risk rather than a direct
data breach because the route does not store typed phrases or expose server
secrets.

### Human Verification, Sessions, and Warning Overrides

`src/app/api/pda-iep-advice/human-verify/route.ts` verifies a Turnstile token or
test token when allowed, rate-limits verification attempts, and creates an
HTTP-only session cookie. `src/lib/server/security.ts` binds verified sessions
to purpose, IP hash, user-agent hash, and browser-ID hash; enforces session
quota and per-IP upload limits; and signs one-use warning override IDs with
`SESSION_SIGNING_SECRET`.

Realistic attacker story: an attacker tries to reuse a verified IEP analyzer
session against the behavior report endpoint, replay a warning override for a
different file, or bypass verification by omitting the browser ID. The current
purpose binding, fingerprint binding, file-hash binding, and HMAC signature are
the relevant mitigations.

Remaining launch risk: the current security store is process-local when
`SECURITY_USE_MEMORY_STORE=true`, which is acceptable for local development but
not a final multi-instance public deployment store.

### PDF Upload and AI Analysis Routes

The upload-backed routes are the most privacy-sensitive surfaces:

- `src/app/api/pda-iep-advice/analyze/route.ts`
- `src/app/api/pda-behavior-report-help/analyze/route.ts`

`src/lib/server/uploads.ts` validates that uploads are non-empty PDFs by bytes,
not browser MIME type; rejects oversized files, unreadable/encrypted PDFs,
excessive page counts, and oversized page dimensions; hashes files for warning
scoping; and extracts text in memory. Files are not persisted to disk.

Realistic attacker stories:

- Upload a malformed or huge PDF to exhaust server CPU or memory.
- Upload irrelevant files to trigger expensive model calls.
- Submit malicious PDF text that attempts to manipulate model output.
- Replay a warning override token for a different file pair.

Current mitigations include feature gates, maintenance mode, human verification,
quota/rate limits, upload preflight, local relevance checks for behavior report
pairs, model validation, and typed response parsing. The edge/body-limit
assumption remains important because app-level validation happens after
`req.formData()` begins parsing the multipart body.

### Gemini and Model Output

Gemini receives prompts plus user-provided PDF bytes for live analysis. The app
does not store Gemini responses, but generated output is sensitive because it can
describe a child's school supports or behavior incident. The RAG engine in
`src/lib/rag-engine.ts` parses JSON output into typed response shapes and throws
public retryable errors for invalid model responses.

Realistic attacker story: a prompt-injection payload in a PDF tells the model to
ignore the system prompt, leak policy text, or emit unexpected fields. The app's
main security invariant is not that model content is always correct; it is that
model output cannot execute as code, cannot expose server secrets, and must fit
the expected response schema before rendering.

### Analytics

Analytics is currently a browser-dispatched sanitized event named
`pda-portal-analytics`. `src/lib/client/analytics.ts` allowlists event names and
property keys. Tests confirm sensitive keys such as child name, school name,
document text, typed phrase, form answers, and generated output are dropped.

Realistic attacker story: a future developer adds a new analytics call and
accidentally passes generated output or uploaded document text. The event builder
should remain the only analytics path, and any future provider integration must
subscribe only to the sanitized event shape.

### Donations and Stripe

The portal links to hosted Stripe destinations through public tiered
environment variables. This app does not process card data, create Checkout
Sessions server-side, receive Stripe webhooks, or store customer/payment data.

Realistic attacker story: a malicious deployment or misconfigured environment
variable points donation buttons to a fraudulent checkout. Because the links are
public configuration, the production smoke check must verify visible donation
destinations after deployment.

### Deployment and Secrets

The Cloud Run path uses `Dockerfile` and `cloudbuild.yaml`. Public variables
such as site URL and donation URLs are build/runtime configuration. Secrets such
as Gemini, Turnstile, and session signing keys must be configured outside git
and never exposed as `NEXT_PUBLIC_` values.

Realistic attacker story: production is launched with test-token verification,
mock mode, missing signing secret, or a local memory store used across multiple
instances. `src/lib/server/config.ts` already rejects production test-token
verification when protected upload features are enabled and requires key
configuration before live analysis, but the production shared store remains a
launch dependency.

## Severity Calibration (Critical, High, Medium, Low)

Critical:

- Server-side secret disclosure, such as exposing `GEMINI_API_KEY`,
  `TURNSTILE_SECRET_KEY`, or `SESSION_SIGNING_SECRET` to the browser, logs,
  public files, or analytics.
- Persistent or reflected XSS that can execute in visitors' browsers on public
  pages and read local browser data or alter donation destinations.
- Public exposure of uploaded PDFs or generated child/school analysis through a
  stored file, public route, object storage bucket, or analytics provider.
- Any app change that collects or handles card data directly instead of sending
  visitors to Stripe-hosted checkout.

High:

- Bypass of human verification/session purpose checks allowing arbitrary
  unauthenticated use of upload-backed Gemini routes at scale.
- Warning override replay across sessions, endpoints, or files that defeats
  document relevance controls.
- Missing or broken upload validation that allows malformed PDFs or oversized
  payloads to reliably exhaust production resources.
- Production deployment with upload features enabled and test verification
  tokens accepted.

Medium:

- Running public multi-instance Cloud Run upload routes with only process-local
  memory sessions/rate limits.
- Missing edge/proxy body limits, allowing large multipart bodies to consume
  resources before app-level checks run.
- Cost abuse of the unverified Declarative translator API.
- Analytics-provider integration that bypasses the sanitizer but does not expose
  full documents or secrets.
- Misconfigured donation tier URLs that send supporters to the wrong public
  Stripe destination.

Low:

- Missing or inaccurate static metadata, sitemap, or `llms.txt` entries.
- Cosmetic UI issues on donation or informational pages that do not affect
  privacy, payments, or AI-route access.
- Non-sensitive operational logs that reveal route names, status codes, or
  generic retryable error categories.

Out of scope or lower priority in this repository:

- Tenant isolation and account authorization, because the MVP has no user
  accounts, saved parent dashboards, or server-side child profiles.
- Stripe webhook authentication, subscription management, and payment-method
  storage, because the current portal only links to Stripe-hosted checkout.
- Database injection, because the current app does not use a relational database
  or persistent application database.

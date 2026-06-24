# Phase 7 Cloud Run Deployment Scaffolding

Date: 2026-06-24

## Decision

Deployment target: Google Cloud Run with Cloud Build and Artifact Registry.

This matches the existing operating preference for other projects while keeping
the portal as a standard containerized Next.js app.

## Files Added

- `Dockerfile`: builds a production Next.js standalone container.
- `.dockerignore`: keeps local dependencies, build output, test artifacts, and env files out of the Docker build context.
- `cloudbuild.yaml`: builds the container, pushes it to Artifact Registry, and deploys it to Cloud Run.
- `tests/cloud-run-scaffolding.test.ts`: verifies the expected deployment scaffolding shape.

## One-Time Google Cloud Setup

Choose values before running commands:

```bash
export PROJECT_ID="your-gcp-project-id"
export REGION="us-west1"
export SERVICE_NAME="pda-family-tools-portal"
export ARTIFACT_REPOSITORY="pda-family-tools"
export RUNTIME_SERVICE_ACCOUNT="pda-family-tools-run@$PROJECT_ID.iam.gserviceaccount.com"
```

Enable required APIs:

```bash
gcloud services enable \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  secretmanager.googleapis.com \
  --project "$PROJECT_ID"
```

Create Artifact Registry repository if it does not exist:

```bash
gcloud artifacts repositories create "$ARTIFACT_REPOSITORY" \
  --repository-format=docker \
  --location="$REGION" \
  --description="PDA Family Tools portal containers" \
  --project "$PROJECT_ID"
```

Create a runtime service account if it does not exist:

```bash
gcloud iam service-accounts create pda-family-tools-run \
  --display-name="PDA Family Tools Cloud Run runtime" \
  --project "$PROJECT_ID"
```

Grant Cloud Build the roles needed to build, push, and deploy. Adjust the Cloud
Build service account if the project uses a custom build service account:

```bash
export PROJECT_NUMBER="$(gcloud projects describe "$PROJECT_ID" --format='value(projectNumber)')"
export CLOUD_BUILD_SA="$PROJECT_NUMBER@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding "$PROJECT_ID" \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/run.admin"

gcloud iam service-accounts add-iam-policy-binding "$RUNTIME_SERVICE_ACCOUNT" \
  --member="serviceAccount:$CLOUD_BUILD_SA" \
  --role="roles/iam.serviceAccountUser" \
  --project "$PROJECT_ID"
```

## Secrets

Do not put secret values in `cloudbuild.yaml`, Docker build args, git, or local
docs.

Create secrets in Secret Manager:

```bash
printf '%s' "$GEMINI_API_KEY" | gcloud secrets create GEMINI_API_KEY \
  --data-file=- \
  --replication-policy=automatic \
  --project "$PROJECT_ID"

printf '%s' "$TURNSTILE_SECRET_KEY" | gcloud secrets create TURNSTILE_SECRET_KEY \
  --data-file=- \
  --replication-policy=automatic \
  --project "$PROJECT_ID"

printf '%s' "$SESSION_SIGNING_SECRET" | gcloud secrets create SESSION_SIGNING_SECRET \
  --data-file=- \
  --replication-policy=automatic \
  --project "$PROJECT_ID"
```

Grant the runtime service account permission to read those secrets:

```bash
for secret in GEMINI_API_KEY TURNSTILE_SECRET_KEY SESSION_SIGNING_SECRET; do
  gcloud secrets add-iam-policy-binding "$secret" \
    --member="serviceAccount:$RUNTIME_SERVICE_ACCOUNT" \
    --role="roles/secretmanager.secretAccessor" \
    --project "$PROJECT_ID"
done
```

After the first Cloud Run service exists, attach secrets to the service:

```bash
gcloud run services update "$SERVICE_NAME" \
  --region "$REGION" \
  --update-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest,TURNSTILE_SECRET_KEY=TURNSTILE_SECRET_KEY:latest,SESSION_SIGNING_SECRET=SESSION_SIGNING_SECRET:latest \
  --project "$PROJECT_ID"
```

## Build And Deploy

Set the final public URL before building. Public `NEXT_PUBLIC_*` values are safe
to expose, but they are still deployment configuration and should be deliberate.

```bash
gcloud builds submit \
  --config cloudbuild.yaml \
  --project "$PROJECT_ID" \
  --substitutions "_REGION=$REGION,_SERVICE_NAME=$SERVICE_NAME,_ARTIFACT_REPOSITORY=$ARTIFACT_REPOSITORY,_RUNTIME_SERVICE_ACCOUNT=$RUNTIME_SERVICE_ACCOUNT,_NEXT_PUBLIC_SITE_URL=https://your-domain.example,_NEXT_PUBLIC_DONATION_SMALL_URL=https://donate.stripe.com/small,_NEXT_PUBLIC_DONATION_LARGE_URL=https://donate.stripe.com/large,_NEXT_PUBLIC_DONATION_CUSTOM_URL=https://buy.stripe.com/custom,_NEXT_PUBLIC_DONATION_MONTHLY_URL=https://donate.stripe.com/monthly"
```

If using a Cloud Build GitHub trigger, configure the same substitutions in the
trigger settings instead of editing `cloudbuild.yaml` for each environment.

## Production Environment Notes

`cloudbuild.yaml` sets these non-secret runtime flags:

- `RAG_MOCK_MODE=false`
- `SECURITY_ALLOW_TEST_TOKENS=false`
- `SECURITY_USE_MEMORY_STORE=true`
- `FEATURE_PDA_IEP_ANALYZE_ENABLED=true`
- `FEATURE_BEHAVIOR_REPORT_ENABLED=true`
- `MAINTENANCE_MODE=false`

`SECURITY_USE_MEMORY_STORE=true` is acceptable for the initial single-service
launch because sessions and warning tokens are short-lived. Before scaling to
multiple instances or treating upload-backed analysis as highly available,
replace this with shared production session storage.

## Smoke Checks

After deployment:

```bash
export SERVICE_URL="$(gcloud run services describe "$SERVICE_NAME" \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --format='value(status.url)')"

curl -I "$SERVICE_URL/"
curl -I "$SERVICE_URL/sitemap.xml"
curl -I "$SERVICE_URL/robots.txt"
curl -I "$SERVICE_URL/llms.txt"
```

Then run browser checks for:

- Home page.
- Support Sheet Builder.
- Declarative Language Translator.
- PDA IEP Advice analyzer.
- PDA Behavior Report Help.
- Privacy, terms, and donation pages.

Run live upload checks only with non-sensitive fixture PDFs.

## Sources Checked

- Google Cloud Build Cloud Run deployment docs: https://docs.cloud.google.com/build/docs/deploying-builds/deploy-cloud-run
- Next.js deployment docs for Docker standalone output: https://nextjs.org/docs/app/getting-started/deploying
- Next.js self-hosting docs: https://nextjs.org/docs/app/guides/self-hosting

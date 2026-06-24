import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import nextConfig from "../next.config";

function readProjectFile(filePath: string) {
  return fs.readFileSync(path.join(process.cwd(), filePath), "utf-8");
}

describe("Cloud Run deployment scaffolding", () => {
  it("builds Next.js with standalone output for Docker runtime", () => {
    expect(nextConfig).toMatchObject({
      output: "standalone",
    });
  });

  it("defines a Cloud Run Docker runtime without copying local env files", () => {
    const dockerfile = readProjectFile("Dockerfile");
    const dockerignore = readProjectFile(".dockerignore");

    expect(dockerfile).toContain("FROM node:20-alpine");
    expect(dockerfile).toContain("npm run build");
    expect(dockerfile).toContain(".next/standalone");
    expect(dockerfile).toContain("USER nextjs");
    expect(dockerfile).toContain("HOSTNAME=0.0.0.0");
    expect(dockerignore).toContain(".env");
    expect(dockerignore).toContain(".env.*");
  });

  it("builds and deploys through Cloud Build to Cloud Run", () => {
    const cloudBuild = readProjectFile("cloudbuild.yaml");

    expect(cloudBuild).toContain("gcr.io/cloud-builders/docker");
    expect(cloudBuild).toContain("gcr.io/google.com/cloudsdktool/cloud-sdk");
    expect(cloudBuild).toContain("gcloud");
    expect(cloudBuild).toContain("run");
    expect(cloudBuild).toContain("deploy");
    expect(cloudBuild).toContain("--region=$_REGION");
    expect(cloudBuild).toContain("--service-account=$_RUNTIME_SERVICE_ACCOUNT");
    expect(cloudBuild).toContain("NEXT_PUBLIC_SITE_URL=$_NEXT_PUBLIC_SITE_URL");
    expect(cloudBuild).not.toContain("GEMINI_API_KEY=");
    expect(cloudBuild).not.toContain("TURNSTILE_SECRET_KEY=");
    expect(cloudBuild).not.toContain("SESSION_SIGNING_SECRET=");
  });
});

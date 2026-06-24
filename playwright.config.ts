import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    env: {
      ...process.env,
      DEV_USE_MOCK_TRANSLATIONS: "true",
      FEATURE_BEHAVIOR_REPORT_ENABLED: "true",
      FEATURE_PDA_IEP_ANALYZE_ENABLED: "true",
      MAINTENANCE_MODE: "false",
      RAG_MOCK_MODE: "true",
      SECURITY_ALLOW_TEST_TOKENS: "true",
      SECURITY_USE_MEMORY_STORE: "true",
    },
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
        permissions: ["clipboard-read", "clipboard-write"],
      },
    },
    {
      name: "mobile-chromium",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
        permissions: ["clipboard-read", "clipboard-write"],
      },
    },
  ],
});

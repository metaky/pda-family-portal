"use client";

const BROWSER_ID_KEY = "pda_portal_browser_id";
const DEFAULT_TEST_TOKEN = "codex-turnstile-test-token";

export function getOrCreateBrowserId() {
  const existing = window.localStorage.getItem(BROWSER_ID_KEY);
  if (existing) {
    return existing;
  }

  const created = crypto.randomUUID();
  window.localStorage.setItem(BROWSER_ID_KEY, created);
  return created;
}

export function getSecurityHeaders() {
  return {
    "x-browser-id": getOrCreateBrowserId(),
  };
}

export function getSecurityTestToken() {
  return process.env.NEXT_PUBLIC_SECURITY_TEST_TOKEN ?? DEFAULT_TEST_TOKEN;
}

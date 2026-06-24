import { describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { POST } from "../src/app/api/declarative/translate/route";

const geminiMocks = vi.hoisted(() => ({
  generateContent: vi.fn(),
  getGenerativeModel: vi.fn(),
  GoogleGenerativeAI: vi.fn(),
}));

vi.mock("@google/generative-ai", () => {
  geminiMocks.getGenerativeModel.mockReturnValue({
    generateContent: geminiMocks.generateContent,
  });
  geminiMocks.GoogleGenerativeAI.mockImplementation(function GoogleGenerativeAIMock() {
    return {
      getGenerativeModel: geminiMocks.getGenerativeModel,
    };
  });

  return {
    GoogleGenerativeAI: geminiMocks.GoogleGenerativeAI,
    SchemaType: {
      ARRAY: "ARRAY",
      OBJECT: "OBJECT",
      STRING: "STRING",
    },
  };
});

describe("declarative translate route", () => {
  it("rejects invalid Interest Based requests before any model call", async () => {
    const response = await POST(
      new Request("http://localhost/api/declarative/translate", {
        body: JSON.stringify({
          text: "Brush teeth",
          tone: "Interest Based",
        }),
        method: "POST",
      }),
    );

    await expect(response.json()).resolves.toEqual({
      error: "Interest Based ideas need an entered interest.",
    });
    expect(response.status).toBe(400);
  });

  it("returns deterministic mock translations in test mode without echoing the submitted phrase", async () => {
    vi.stubEnv("DEV_USE_MOCK_TRANSLATIONS", "true");
    const response = await POST(
      new Request("http://localhost/api/declarative/translate", {
        body: JSON.stringify({
          text: "Please come down and wash your hands. It's dinner time.",
          tone: "Straightforward",
        }),
        method: "POST",
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.translations[0].translation).toContain("Dinner");
    expect(JSON.stringify(body)).not.toContain("Please come down");
    vi.unstubAllEnvs();
  });

  it("returns mock variation results through the same safe response shape", async () => {
    vi.stubEnv("DEV_USE_MOCK_TRANSLATIONS", "true");
    const response = await POST(
      new Request("http://localhost/api/declarative/translate", {
        body: JSON.stringify({
          mode: "variation",
          sourceTranslation: {
            id: "source-1",
            translation: "The toys have an upstairs spot.",
          },
          text: "Put the toys upstairs in your room",
          tone: "Default",
          variationKind: "warmer",
        }),
        method: "POST",
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.translations).toHaveLength(2);
    expect(JSON.stringify(body)).not.toContain("Put the toys upstairs");
    vi.unstubAllEnvs();
  });

  it("calls Gemini through the server SDK when configured and normalizes the model response", async () => {
    vi.stubEnv("DEV_USE_MOCK_TRANSLATIONS", "false");
    vi.stubEnv("GEMINI_API_KEY", "test-gemini-key");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    geminiMocks.generateContent.mockResolvedValue({
      response: {
        text: () =>
          JSON.stringify([
            { translation: "  Dinner is ready. Hands first.  " },
            { translation: "" },
            { translation: "Downstairs, hands, then dinner." },
          ]),
      },
    });

    const response = await POST(
      new Request("http://localhost/api/declarative/translate", {
        body: JSON.stringify({
          text: "Please come down and wash your hands. It's dinner time.",
          tone: "Default",
        }),
        method: "POST",
      }),
    );

    const body = await response.json();
    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(geminiMocks.GoogleGenerativeAI).toHaveBeenCalledWith("test-gemini-key");
    expect(geminiMocks.getGenerativeModel).toHaveBeenCalledWith(
      expect.objectContaining({
        generationConfig: expect.objectContaining({
          responseMimeType: "application/json",
        }),
        model: "gemini-2.5-flash",
        systemInstruction: expect.objectContaining({
          parts: expect.arrayContaining([
            expect.objectContaining({ text: expect.any(String) }),
          ]),
        }),
      }),
    );
    expect(geminiMocks.generateContent).toHaveBeenCalledWith(
      expect.stringContaining("Rewrite into 3-4 declarative alternatives"),
    );
    expect(body.translations).toEqual([
      { translation: "Dinner is ready. Hands first." },
      { translation: "Downstairs, hands, then dinner." },
    ]);
    expect(JSON.stringify(body)).not.toContain("Please come down");

    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("does not introduce a Declarative analytics API route for sensitive phrases", () => {
    const projectRoot = join(__dirname, "..");

    expect(existsSync(join(projectRoot, "src/app/api/declarative/analytics"))).toBe(false);
    expect(existsSync(join(projectRoot, "src/app/api/analytics"))).toBe(false);
  });
});

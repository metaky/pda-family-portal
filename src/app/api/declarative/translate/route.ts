import { NextResponse } from "next/server";
import {
  buildDeclarativePrompt,
  buildMockDeclarativeTranslations,
  buildVariationPrompt,
  normalizeTranslations,
  translatorSystemInstruction,
  validateTranslatorRequest,
} from "@/lib/declarative-translator";

const GEMINI_MODEL = "gemini-2.5-flash";

function getGeminiEndpoint(apiKey: string) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

function extractGeminiText(payload: unknown) {
  if (typeof payload !== "object" || payload === null || !("candidates" in payload)) {
    return null;
  }

  const candidates = (payload as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates)) return null;
  const first = candidates[0] as { content?: { parts?: Array<{ text?: unknown }> } } | undefined;
  const text = first?.content?.parts?.find((part) => typeof part.text === "string")?.text;
  return typeof text === "string" ? text : null;
}

function parseTranslationJson(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  return normalizeTranslations(Array.isArray(parsed) ? parsed : []);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const validation = validateTranslatorRequest(body);

  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: validation.status });
  }

  const apiKey = process.env.GEMINI_API_KEY?.replace(/^"|"$/g, "")?.replace(/^'|'$/g, "");
  const useMockMode =
    process.env.DEV_USE_MOCK_TRANSLATIONS === "true" ||
    (process.env.NODE_ENV === "test" && !apiKey);

  if (useMockMode) {
    return NextResponse.json({
      translations: buildMockDeclarativeTranslations(validation.value),
    });
  }

  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured on server." }, { status: 500 });
  }

  const prompt =
    validation.value.mode === "variation"
      ? buildVariationPrompt(validation.value)
      : buildDeclarativePrompt(validation.value);

  const response = await fetch(getGeminiEndpoint(apiKey), {
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          items: {
            properties: {
              translation: { type: "STRING" },
            },
            required: ["translation"],
            type: "OBJECT",
          },
          type: "ARRAY",
        },
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
      systemInstruction: {
        parts: [{ text: translatorSystemInstruction }],
      },
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "The translation service is unavailable right now." },
      { status: 502 },
    );
  }

  const geminiPayload = await response.json().catch(() => null);
  const responseText = extractGeminiText(geminiPayload);

  if (!responseText) {
    return NextResponse.json({ error: "Empty response from AI." }, { status: 502 });
  }

  try {
    return NextResponse.json({
      translations: parseTranslationJson(responseText),
    });
  } catch {
    return NextResponse.json(
      { error: "The translation service returned an unreadable response." },
      { status: 502 },
    );
  }
}

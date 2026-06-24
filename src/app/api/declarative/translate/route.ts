import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import {
  buildDeclarativePrompt,
  buildMockDeclarativeTranslations,
  buildVariationPrompt,
  normalizeTranslations,
  translatorSystemInstruction,
  validateTranslatorRequest,
} from "@/lib/declarative-translator";

const GEMINI_MODEL = "gemini-2.5-flash";

function parseTranslationJson(text: string) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned);
  return normalizeTranslations(Array.isArray(parsed) ? parsed : []);
}

function getGeminiModel(apiKey: string) {
  const client = new GoogleGenerativeAI(apiKey);

  return client.getGenerativeModel({
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        items: {
          properties: {
            translation: { type: SchemaType.STRING },
          },
          required: ["translation"],
          type: SchemaType.OBJECT,
        },
        type: SchemaType.ARRAY,
      },
    },
    model: GEMINI_MODEL,
    systemInstruction: {
      parts: [{ text: translatorSystemInstruction }],
      role: "system",
    },
  });
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

  let responseText: string;
  try {
    const result = await getGeminiModel(apiKey).generateContent(prompt);
    responseText = (await result.response).text();
  } catch {
    return NextResponse.json(
      { error: "The translation service is unavailable right now." },
      { status: 502 },
    );
  }

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

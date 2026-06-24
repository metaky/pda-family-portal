import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("llms.txt", () => {
  it("describes the portal and privacy boundaries", () => {
    const content = fs.readFileSync(
      path.join(process.cwd(), "public/llms.txt"),
      "utf-8",
    );

    expect(content).toContain("# PDA Family Tools");
    expect(content).toContain("Support Sheet Builder");
    expect(content).toContain("Declarative Language Translator");
    expect(content).toContain(
      "Do not infer or expose child, school, document, typed phrase, or generated-output content.",
    );
  });
});

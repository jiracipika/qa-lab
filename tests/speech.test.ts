/** Read-aloud helpers: markdown stripping, speech chunking, block scripts. */

import { describe, expect, it } from "vitest";
import { blocksToSpeech, chunkForSpeech, plainText } from "../src/lib/speech";

describe("plainText", () => {
  it("strips markdown-lite markers and reads glossary links as their term", () => {
    expect(plainText("**bold** and *italic*")).toBe("bold and italic");
    expect(plainText("see [[traceability]] for links")).toBe("see traceability for links");
    expect(plainText("use `qa-lab:v1` here")).toBe("use qa-lab:v1 here");
    expect(plainText("a\n  b")).toBe("a b");
  });
});

describe("chunkForSpeech", () => {
  it("returns short text as a single chunk", () => {
    expect(chunkForSpeech("Short.")).toEqual(["Short."]);
    expect(chunkForSpeech("   ")).toEqual([]);
  });

  it("splits long text on sentence boundaries without exceeding the limit", () => {
    const text = Array.from({ length: 8 }, (_, i) => `Sentence number ${i} says something useful for testing purposes.`).join(" ");
    const chunks = chunkForSpeech(text, 220);
    expect(chunks.length).toBeGreaterThan(1);
    for (const c of chunks) {
      expect(c.length).toBeLessThanOrEqual(220);
    }
    // reassembling preserves every sentence
    expect(chunks.join(" ")).toBe(text);
    // no chunk ends mid-word: every chunk ends with sentence punctuation
    for (const c of chunks.slice(0, -1)) {
      expect(c.endsWith("purpose.") || c.endsWith(".")).toBe(true);
    }
  });
});

describe("blocksToSpeech", () => {
  it("serialises lesson blocks in reading order without markdown noise", () => {
    const script = blocksToSpeech([
      { kind: "prose", text: "First **idea**." },
      { kind: "list", items: ["one [[item]]", "two"], ordered: true },
      { kind: "definition", term: "Idempotency", text: "Same effect." },
      { kind: "code", code: { lang: "java", content: "given();", caption: "Fee finder query" } },
      { kind: "diagram", diagramId: "ci-pipeline", note: "Click each stage." },
    ]);
    expect(script).toContain("First idea.");
    expect(script).toContain("1. one item");
    expect(script).toContain("2. two");
    expect(script).toContain("Idempotency. Same effect.");
    expect(script).toContain("Code sample: Fee finder query.");
    // code bodies are not read aloud
    expect(script).not.toContain("given();");
  });
});

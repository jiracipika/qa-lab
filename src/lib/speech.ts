/**
 * Read-aloud support (Web Speech API). Pure helpers are unit-tested; the
 * synthesis itself is browser-only and degrades gracefully when unsupported.
 */

import type { LessonBlock } from "../types/content";

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Strip markdown-lite markers so the synthesiser reads words, not asterisks. */
export function plainText(text: string): string {
  return text
    .replace(/\[\[([^\]]+)\]\]/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** Lesson blocks -> one speakable script, in reading order. */
export function blocksToSpeech(blocks: LessonBlock[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    switch (b.kind) {
      case "prose":
        parts.push(plainText(b.text));
        break;
      case "list":
        for (const [i, item] of b.items.entries()) {
          parts.push(plainText(b.ordered ? `${i + 1}. ${item}` : item));
        }
        break;
      case "definition":
        parts.push(plainText(`${b.term}. ${b.text}`));
        break;
      case "example":
        parts.push(plainText(`Example: ${b.title}. ${b.text}`));
        break;
      case "code":
        if (b.code.caption) parts.push(`Code sample: ${plainText(b.code.caption)}.`);
        break;
      case "diagram":
        parts.push(plainText(b.note ?? "Interactive diagram."));
        break;
      case "callout":
        parts.push(plainText(`${b.title}. ${b.text}`));
        break;
    }
  }
  return parts.join(" ");
}

/**
 * Split into utterance-sized chunks on sentence boundaries. Long single
 * utterances are unreliable in some browsers; short queued ones are not.
 */
export function chunkForSpeech(text: string, max = 220): string[] {
  const clean = text.trim();
  if (clean.length <= max) return clean ? [clean] : [];
  const sentences = clean.match(/[^.!?]+[.!?]+["')\]]*|\S+$/g) ?? [clean];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    const s = sentence.trim();
    const candidate = current ? `${current} ${s}` : s;
    if (candidate.length > max && current) {
      chunks.push(current);
      current = s;
    } else {
      current = candidate;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

export function stopSpeaking(): void {
  if (isSpeechSupported()) window.speechSynthesis.cancel();
}

/** Speak the text (queued in chunks); resolves onDone when finished or stopped. */
export function speak(text: string, onDone?: () => void): void {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
  const chunks = chunkForSpeech(text);
  if (chunks.length === 0) {
    onDone?.();
    return;
  }
  let remaining = chunks.length;
  for (const chunk of chunks) {
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.onend = () => {
      remaining -= 1;
      if (remaining === 0) onDone?.();
    };
    utterance.onerror = () => {
      remaining -= 1;
      if (remaining === 0) onDone?.();
    };
    window.speechSynthesis.speak(utterance);
  }
}

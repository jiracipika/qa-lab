/**
 * Minimal inline markup for lesson text: **bold**, *emphasis*, `code`, and [[glossary-id]] links.
 * Input is authored content (not user input), but we still build React nodes instead of
 * dangerouslySetInnerHTML, so nothing is ever interpreted as HTML.
 */
import React from "react";

export interface GlossaryLookup {
  (id: string): { id: string; term: string } | undefined;
}

const TOKEN = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[\[[a-z0-9-]+\]\])/g;

export function RichText({ text, lookup }: { text: string; lookup?: GlossaryLookup }): React.ReactNode {
  const parts = text.split(TOKEN).filter((p) => p !== "");
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) {
          return <code key={i}>{part.slice(1, -1)}</code>;
        }
        if (part.startsWith("[[") && part.endsWith("]]")) {
          const id = part.slice(2, -2);
          const term = lookup?.(id);
          if (term) {
            return (
              <a key={i} className="glossary-link" href={`#/glossary?term=${term.id}`}>
                {term.term}
              </a>
            );
          }
          return <span key={i}>{id}</span>;
        }
        if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
          return <em key={i}>{part.slice(1, -1)}</em>;
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
}

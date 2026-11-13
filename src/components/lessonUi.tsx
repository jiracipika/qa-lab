/** Lesson rendering pieces (rich text, code blocks, diagrams). Split from ui.tsx so the
 *  eager app shell does not pull the glossary or every diagram component into the entry chunk. */

import type { CodeSample, LessonBlock } from "../types/content";
import { RichText } from "../lib/richText";
import { glossary } from "../content/glossary";

const glossaryLookup = (id: string) => glossary.find((g) => g.id === id);

export function CodeBlock({ code }: { code: CodeSample }) {
  return (
    <div className="codeblock">
      {(code.caption || code.lang) && (
        <div className="code-head">
          {code.caption && <span className="code-caption">{code.caption}</span>}
          <span className="code-lang" aria-hidden>{code.lang}</span>
        </div>
      )}
      <code>{code.content}</code>
    </div>
  );
}

export function T({ text }: { text: string }) {
  return <RichText text={text} lookup={glossaryLookup} />;
}

const calloutToneClass: Record<string, string> = { tip: "tip", mistake: "mistake", note: "note" };

export function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="lesson lesson-body">
      {blocks.map((b, i) => {
        switch (b.kind) {
          case "prose":
            return (
              <p key={i}>
                <T text={b.text} />
              </p>
            );
          case "list":
            return b.ordered ? (
              <ol key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>
                    <T text={it} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>
                    <T text={it} />
                  </li>
                ))}
              </ul>
            );
          case "definition":
            return (
              <dl key={i} className="defn">
                <dt>{b.term}</dt>
                <dd>
                  <T text={b.text} />
                </dd>
              </dl>
            );
          case "example":
            return (
              <div key={i} className="card tight pad-sm">
                <h4>Example - {b.title}</h4>
                <p style={{ marginBottom: b.code ? "0" : undefined }}>
                  <T text={b.text} />
                </p>
                {b.code && <CodeBlock code={b.code} />}
              </div>
            );
          case "code":
            return <CodeBlock key={i} code={b.code} />;
          case "diagram":
            return <DiagramHost key={i} diagramId={b.diagramId} note={b.note} />;
          case "callout":
            return (
              <div key={i} className={`callout ${calloutToneClass[b.tone]}`}>
                <h4>{b.title}</h4>
                <p style={{ marginBottom: 0 }}>
                  <T text={b.text} />
                </p>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

/** Diagram host: resolves a diagram id to its interactive component (lazily, registry avoids cycles). */
import { getDiagram } from "../diagrams/registry";

export function DiagramHost({ diagramId, note }: { diagramId: string; note?: string }) {
  const entry = getDiagram(diagramId);
  if (!entry) {
    return <p className="muted">Diagram not found: {diagramId}</p>;
  }
  const Diagram = entry.component;
  return (
    <figure style={{ margin: "16px 0" }}>
      <div className="diagram-frame">
        <Diagram />
      </div>
      {note && <figcaption className="muted small" style={{ marginTop: 6 }}>{note}</figcaption>}
      <figcaption className="muted small" style={{ marginTop: 4 }}>{entry.title}</figcaption>
    </figure>
  );
}

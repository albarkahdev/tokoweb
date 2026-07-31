import type { Child } from "hono/jsx";
import { type Guide, parseGuideBody } from "@/domain/guides";
import { Card, CardTitle } from "@/ui/display";

function sectionId(index: number): string {
  return `bagian-${index + 1}`;
}

function renderBody(body: string): Child[] {
  const blocks = parseGuideBody(body);
  const out: Child[] = [];
  let buffer: { kind: "step" | "li"; items: string[] } | null = null;
  const flush = () => {
    if (!buffer) return;
    const cls = buffer.kind === "step" ? "guide-steps" : "guide-list";
    const items = buffer.items;
    out.push(
      buffer.kind === "step" ? (
        <ol class={cls}>
          {items.map((text) => (
            <li>{text}</li>
          ))}
        </ol>
      ) : (
        <ul class={cls}>
          {items.map((text) => (
            <li>{text}</li>
          ))}
        </ul>
      ),
    );
    buffer = null;
  };
  for (const block of blocks) {
    if (block.type === "p") {
      flush();
      out.push(<p class="guide-p">{block.text}</p>);
      continue;
    }
    if (!buffer || buffer.kind !== block.type) {
      flush();
      buffer = { kind: block.type, items: [] };
    }
    buffer.items.push(block.text);
  }
  flush();
  return out;
}

export function GuideView(props: { guide: Guide }) {
  return (
    <>
      <Card>
        <CardTitle>{props.guide.title}</CardTitle>
        <p class="guide-intro">{props.guide.intro}</p>
        <nav class="guide-toc">
          {props.guide.sections.map((section, index) => (
            <a href={`#${sectionId(index)}`}>{section.title}</a>
          ))}
        </nav>
      </Card>
      {props.guide.sections.map((section, index) => (
        <Card>
          <span id={sectionId(index)} />
          <CardTitle>{section.title}</CardTitle>
          {renderBody(section.body)}
        </Card>
      ))}
    </>
  );
}

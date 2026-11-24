import { TriangleAlert } from "lucide-react";

export type LegalSection = {
  title: string;
  /** Parágrafos; um item que começa com "- " vira item de lista. */
  body: string[];
};

/**
 * Texto legal em seções numeradas (termos e privacidade). Enquanto o texto
 * não for revisado, mostra o aviso de rascunho no topo.
 */
export function LegalDocument({
  title,
  updatedAt,
  draft,
  sections,
}: {
  title: string;
  /** "17 de novembro de 2026" */
  updatedAt: string;
  draft: boolean;
  sections: LegalSection[];
}) {
  return (
    <article className="space-y-8 text-sm leading-relaxed">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">Atualizado em {updatedAt}.</p>
        {draft && (
          <p
            role="note"
            className="flex items-start gap-2 rounded-control border border-border bg-muted px-3 py-2"
          >
            <TriangleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            Rascunho em revisão: o texto final pode mudar antes do lançamento.
          </p>
        )}
      </header>
      {sections.map((section, index) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-base font-semibold">
            {index + 1}. {section.title}
          </h2>
          {groupLists(section.body).map((block, blockIndex) =>
            Array.isArray(block) ? (
              <ul key={blockIndex} className="list-disc space-y-1 pl-5">
                {block.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p key={blockIndex}>{block}</p>
            ),
          )}
        </section>
      ))}
    </article>
  );
}

// Junta os itens "- " seguidos numa lista.
function groupLists(body: string[]): (string | string[])[] {
  const blocks: (string | string[])[] = [];
  for (const line of body) {
    if (line.startsWith("- ")) {
      const last = blocks.at(-1);
      if (Array.isArray(last)) last.push(line.slice(2));
      else blocks.push([line.slice(2)]);
    } else {
      blocks.push(line);
    }
  }
  return blocks;
}

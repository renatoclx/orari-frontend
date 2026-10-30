"use client";

import { Download, Eye } from "lucide-react";
import { useState } from "react";
import type { Manual } from "@/components/help/manuals";
import { ManualViewerDialog } from "@/components/help/ManualViewerDialog";
import { ListCard } from "@/components/shared/ListCard";
import { Button } from "@/components/ui/button";

/** Tabela de manuais (cartões no celular), com visualizar e baixar. */
export function ManualList({ manuals }: { manuals: Manual[] }) {
  const [viewing, setViewing] = useState<Manual | null>(null);

  // Visualizar e Baixar: os mesmos botões na tabela e no cartão.
  const actions = (manual: Manual) => (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => setViewing(manual)}>
        <Eye aria-hidden="true" />
        Visualizar
      </Button>
      <Button asChild variant="ghost" size="sm">
        {/* download: o navegador salva o arquivo em vez de abri-lo. */}
        <a href={manual.file} download aria-label={`Baixar ${manual.title}`}>
          <Download aria-hidden="true" />
          Baixar
        </a>
      </Button>
    </div>
  );

  return (
    <ListCard
      columns={["Manual", "Conteúdo", "Ações"]}
      cards={manuals.map((manual) => (
        <li key={manual.file} className="space-y-2 p-4 text-sm">
          <p className="font-medium">{manual.title}</p>
          <p className="text-muted-foreground">{manual.description}</p>
          {actions(manual)}
        </li>
      ))}
      rows={manuals.map((manual) => (
        <tr key={manual.file} className="hover:bg-background">
          <td className="px-4 py-3 font-medium whitespace-nowrap">
            {manual.title}
          </td>
          <td className="px-4 py-3 text-muted-foreground">
            {manual.description}
          </td>
          <td className="px-4 py-2">{actions(manual)}</td>
        </tr>
      ))}
    >
      <ManualViewerDialog
        manual={viewing}
        onOpenChange={(open) => !open && setViewing(null)}
      />
    </ListCard>
  );
}

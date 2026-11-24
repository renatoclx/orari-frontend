import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Abre a versão de impressão do relatório numa aba nova (ela chama a
 * impressão do navegador sozinha). Só no computador, como as demais ações de
 * imprimir.
 */
export function PrintButton({ href }: { href: string }) {
  return (
    <Button variant="outline" className="w-auto max-sm:hidden" asChild>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Printer aria-hidden="true" />
        Imprimir
      </a>
    </Button>
  );
}

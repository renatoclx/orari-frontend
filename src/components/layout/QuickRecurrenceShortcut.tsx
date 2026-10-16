import Link from "next/link";
import { Repeat } from "lucide-react";
import { Hint } from "@/components/shared/Hint";

// Atalho de nova recorrência (screens/layout.md, "Barra de ações lateral"). O
// cadastro é uma página (dias da semana e resumo das sessões não cabem num
// diálogo), então o atalho é um link.
export function QuickRecurrenceShortcut() {
  return (
    <Hint label="Cadastrar uma nova recorrência" side="left">
      <Link
        href="/recorrencias/nova"
        aria-label="Cadastrar uma nova recorrência"
        className="rounded-control p-2 text-muted-foreground hover:bg-background hover:text-foreground"
      >
        <Repeat className="size-5" aria-hidden="true" />
      </Link>
    </Hint>
  );
}

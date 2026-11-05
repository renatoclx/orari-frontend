import Link from "next/link";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

// Página não encontrada dentro do app (ex.: estabelecimento que desligou o
// portal ou endereço errado), no visual escuro do app e em português.
export default function AppNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <SearchX className="size-10 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-xl font-semibold">Não encontramos esta página</h1>
      <p className="text-sm text-muted-foreground">
        O estabelecimento pode ter saído do app, ou o endereço está errado.
      </p>
      <Button asChild className="h-12 w-full max-w-xs text-base">
        <Link href="/app/buscar">Buscar estabelecimentos</Link>
      </Button>
    </main>
  );
}

import Link from "next/link";
import { House, Search, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAppSessionKind } from "@/services/app-session";

// Página não encontrada dentro do app (ex.: estabelecimento que desligou o
// portal, cliente que não é do profissional ou endereço errado), no visual
// escuro do app e em português. O profissional não abre a Busca: volta ao Início.
export default async function AppNotFound() {
  const professional = (await getAppSessionKind()) === "professional";
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <SearchX className="size-10 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-xl font-semibold">Não encontramos esta página</h1>
      <p className="text-sm text-muted-foreground">
        {professional
          ? "O endereço está errado, ou o cliente não está entre os seus."
          : "O estabelecimento pode ter saído do app, ou o endereço está errado."}
      </p>
      <Button asChild className="h-12 w-full max-w-xs text-base">
        {professional ? (
          <Link href="/app">
            <House aria-hidden="true" />
            Voltar ao Início
          </Link>
        ) : (
          <Link href="/app/buscar">
            <Search aria-hidden="true" />
            Buscar estabelecimentos
          </Link>
        )}
      </Button>
    </main>
  );
}

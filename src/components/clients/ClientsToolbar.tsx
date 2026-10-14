import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Busca só visual por enquanto; o filtro entra junto com a API.
export function ClientsToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-72">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          aria-label="Buscar cliente por nome"
          placeholder="Buscar por nome"
          className="bg-card pl-8"
        />
      </div>

      <Button asChild className="w-full sm:ml-auto sm:w-auto">
        <Link href="/clientes/novo">
          <Plus aria-hidden="true" />
          Cadastrar cliente
        </Link>
      </Button>
    </div>
  );
}

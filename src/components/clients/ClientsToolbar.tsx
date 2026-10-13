import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Busca só visual por enquanto; o filtro entra junto com a API.
export function ClientsToolbar() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-72">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          aria-label="Buscar cliente por nome"
          placeholder="Buscar por nome"
          className="w-full rounded-control border border-border bg-surface py-2 pr-3 pl-9 text-sm placeholder:text-muted focus-visible:outline-2 focus-visible:outline-brand"
        />
      </div>

      <Button variant="primary" className="w-full sm:ml-auto sm:w-auto">
        <Plus className="size-4" aria-hidden="true" />
        Cadastrar cliente
      </Button>
    </div>
  );
}

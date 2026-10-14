"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ClientsToolbarProps = {
  /** Termo da busca na URL (?q=). */
  search: string;
};

// A busca atualiza a listagem durante a digitação (screen-patterns.md): depois
// de uma pequena pausa, o termo vai para a URL e a página é renderizada de novo
// no servidor, a partir da primeira página.
export function ClientsToolbar({ search }: ClientsToolbarProps) {
  const router = useRouter();
  const [value, setValue] = useState(search);

  useEffect(() => {
    const term = value.trim();
    if (term === search) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (term) params.set("q", term);
      router.replace(term ? `/clientes?${params}` : "/clientes");
    }, 350);

    return () => clearTimeout(timer);
  }, [value, search, router]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full sm:w-72">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-label="Buscar cliente por nome"
          placeholder="Buscar por nome"
          className="bg-card pl-8"
        />
      </div>

      <Button asChild className="w-full sm:ml-auto sm:w-auto">
        <Link href="/clientes/novo">
          <Plus aria-hidden="true" />
          Novo cliente
        </Link>
      </Button>
    </div>
  );
}

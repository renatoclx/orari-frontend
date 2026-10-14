"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type ListSearchProps = {
  /** Caminho da listagem (a busca vai para `?q=` dele). */
  basePath: string;
  /** Termo da busca que está na URL. */
  search: string;
  /** Texto para leitores de tela (ex.: "Buscar cliente por nome"). */
  label: string;
};

// A busca atualiza a listagem durante a digitação (screen-patterns.md): depois
// de uma pequena pausa, o termo vai para a URL e a página é renderizada de novo
// no servidor, a partir da primeira página.
export function ListSearch({ basePath, search, label }: ListSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(search);

  useEffect(() => {
    const term = value.trim();
    if (term === search) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (term) params.set("q", term);
      router.replace(term ? `${basePath}?${params}` : basePath);
    }, 350);

    return () => clearTimeout(timer);
  }, [value, search, router, basePath]);

  return (
    <div className="relative w-full sm:w-72">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label={label}
        placeholder="Buscar por nome"
        className="bg-card pl-8"
      />
    </div>
  );
}

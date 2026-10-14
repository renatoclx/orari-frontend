"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const BASE_PATH = "/servicos";

type ServicesToolbarProps = {
  /** Termo da busca na URL (?q=). */
  search: string;
};

// Mesma busca das pessoas: depois de uma pausa na digitação, o termo vai para
// a URL e a listagem é renderizada de novo no servidor, na primeira página.
export function ServicesToolbar({ search }: ServicesToolbarProps) {
  const router = useRouter();
  const [value, setValue] = useState(search);

  useEffect(() => {
    const term = value.trim();
    if (term === search) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (term) params.set("q", term);
      router.replace(term ? `${BASE_PATH}?${params}` : BASE_PATH);
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
          aria-label="Buscar serviço por nome"
          placeholder="Buscar por nome"
          className="bg-card pl-8"
        />
      </div>
    </div>
  );
}

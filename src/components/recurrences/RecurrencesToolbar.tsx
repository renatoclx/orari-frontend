"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RecurrencesToolbarProps = {
  professionals: { id: string; name: string }[];
  /** Filtros atuais; "all" = sem filtro. */
  professionalId: string;
  status: string;
};

/** Filtros por profissional e status (na URL) e o botão de nova recorrência. */
export function RecurrencesToolbar({
  professionals,
  professionalId,
  status,
}: RecurrencesToolbarProps) {
  const router = useRouter();

  // Troca um filtro e volta para a primeira página.
  function change(key: "professional" | "status", value: string) {
    const params = new URLSearchParams();
    const next = { professional: professionalId, status, [key]: value };
    for (const [name, current] of Object.entries(next)) {
      if (current !== "all") params.set(name, current);
    }
    const query = params.toString();
    router.push(query ? `/recorrencias?${query}` : "/recorrencias");
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={professionalId}
        onValueChange={(value) => change("professional", value)}
      >
        <SelectTrigger
          className="w-full sm:w-56"
          aria-label="Filtrar por profissional"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os profissionais</SelectItem>
          {professionals.map((item) => (
            <SelectItem key={item.id} value={item.id}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={(value) => change("status", value)}>
        <SelectTrigger
          className="w-full sm:w-44"
          aria-label="Filtrar por status"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="active">Ativas</SelectItem>
          <SelectItem value="inactive">Canceladas</SelectItem>
        </SelectContent>
      </Select>

      <Button asChild className="w-full sm:ml-auto sm:w-auto">
        <Link href="/recorrencias/nova">
          <Plus aria-hidden="true" />
          Nova recorrência
        </Link>
      </Button>
    </div>
  );
}

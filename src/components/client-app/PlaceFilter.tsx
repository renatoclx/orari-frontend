"use client";

import { useRouter } from "next/navigation";
import type { AppPlace } from "@/types/client-app";

/**
 * "Filtrar por estabelecimento" da aba Agendamentos. Lista nativa do celular
 * (a da clínica abre fora da área escura); a escolha vai para a URL (?local=).
 */
export function PlaceFilter({
  places,
  value,
  tab,
}: {
  places: AppPlace[];
  value: string | undefined;
  tab: string;
}) {
  const router = useRouter();
  return (
    <select
      aria-label="Filtrar por estabelecimento"
      value={value ?? ""}
      onChange={(event) => {
        const params = new URLSearchParams({ aba: tab });
        if (event.target.value) params.set("local", event.target.value);
        router.replace(`/app/agendamentos?${params}`);
      }}
      className="h-12 w-full rounded-control border border-input bg-card px-3 text-base"
    >
      <option value="">Todos os estabelecimentos</option>
      {places.map((place) => (
        <option key={place.slug} value={place.slug}>
          {place.name}
        </option>
      ))}
    </select>
  );
}

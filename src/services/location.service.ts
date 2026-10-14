import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { City, State } from "@/types/location";

/** Os 27 estados, em ordem alfabética (cabem em uma página). */
export async function listStates(): Promise<State[]> {
  const { items } = await apiFetch<Paginated<State>>("/states?limit=100");
  return items;
}

/**
 * Cidades de um estado, em ordem alfabética. A API devolve no máximo 100 por
 * vez, então a tela busca pelo nome conforme o usuário digita.
 */
export async function listCities(params: {
  stateId: string;
  name?: string;
}): Promise<City[]> {
  const query = new URLSearchParams({ stateId: params.stateId, limit: "100" });
  const name = params.name?.trim();
  if (name) query.set("name", name);

  const { items } = await apiFetch<Paginated<City>>(`/cities?${query}`);
  return items;
}

/** Uma cidade pelo código (os endereços cadastrados guardam só o código). */
export function getCity(id: string): Promise<City> {
  return apiFetch<City>(`/cities/${id}`);
}

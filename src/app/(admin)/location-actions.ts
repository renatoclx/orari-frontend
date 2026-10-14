"use server";

import { ApiError } from "@/services/api";
import { lookupCep, type CepLookup } from "@/services/cep.service";
import { listCities } from "@/services/location.service";
import type { City } from "@/types/location";

// Server Actions chamadas pelos formulários (Client Components), que não
// falam com a API nem com serviços externos diretamente.

export type SearchCitiesResult =
  { ok: true; cities: City[] } | { ok: false; message: string };

/** Cidades de um estado, filtradas pelo nome; o formulário de endereço busca conforme o usuário digita. */
export async function searchCitiesAction(
  stateId: string,
  name: string,
): Promise<SearchCitiesResult> {
  try {
    return { ok: true, cities: await listCities({ stateId, name }) };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { ok: false, message: error.message };
  }
}

/** Consulta o CEP no servidor, para o navegador não falar com o serviço externo. */
export async function lookupCepAction(cep: string): Promise<CepLookup> {
  return lookupCep(cep);
}

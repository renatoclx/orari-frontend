import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { AddressRecord, NewAddressInput } from "@/types/people";

/** Todos os endereços de uma pessoa (a API limita a 100 por página). */
export async function listAddresses(
  peopleId: string,
): Promise<AddressRecord[]> {
  const { items } = await apiFetch<Paginated<AddressRecord>>(
    `/addresses?peopleId=${peopleId}&limit=100`,
  );
  return items;
}

export async function createAddress(
  peopleId: string,
  input: NewAddressInput,
): Promise<void> {
  await apiFetch("/addresses", {
    method: "POST",
    body: JSON.stringify({ peopleId, ...input }),
  });
}

export async function deleteAddress(id: string): Promise<void> {
  await apiFetch(`/addresses/${id}`, { method: "DELETE" });
}

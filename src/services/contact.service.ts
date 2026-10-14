import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type { ContactRecord, ContactType } from "@/types/people";

/** Todos os contatos de uma pessoa (a API limita a 100 por página). */
export async function listContacts(peopleId: string): Promise<ContactRecord[]> {
  const { items } = await apiFetch<Paginated<ContactRecord>>(
    `/contacts?peopleId=${peopleId}&limit=100`,
  );
  return items;
}

type ContactInput = {
  type: ContactType;
  phone?: string;
  email?: string | null;
  isPrincipal?: boolean;
};

export async function createContact(
  peopleId: string,
  input: ContactInput,
): Promise<void> {
  await apiFetch("/contacts", {
    method: "POST",
    body: JSON.stringify({ peopleId, ...input }),
  });
}

export async function updateContact(
  id: string,
  input: ContactInput,
): Promise<void> {
  await apiFetch(`/contacts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteContact(id: string): Promise<void> {
  await apiFetch(`/contacts/${id}`, { method: "DELETE" });
}

"use server";

import { revalidatePath } from "next/cache";
import { EVOLUTION_MAX } from "@/components/anamnesis/records/entry-validation";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { createEntry } from "@/services/anamnesis.service";
import { getCurrentUser } from "@/services/auth.service";
import type { EntryInput } from "@/types/anamnesis";
import { anamnesisAccess } from "@/utils/anamnesis-access";

export type EntryActionResult = { ok: true } | ActionFailure<"evolution">;

/**
 * Novo acompanhamento. Confere o acesso e o texto da evolução (a API valida o
 * resto: datas, agendamento do mesmo cliente, respostas) e devolve o texto de
 * erro da API tal como veio. Nada do conteúdo vai para log nem para a URL.
 */
export async function createEntryAction(
  clientId: string,
  anamnesisId: string,
  input: EntryInput,
): Promise<EntryActionResult> {
  const user = await getCurrentUser();
  if (!anamnesisAccess(user).canAccess) {
    return {
      ok: false,
      message: "Você não tem acesso às fichas de anamnese.",
    };
  }
  const evolution = input.evolution.trim();
  if (!evolution || evolution.length > EVOLUTION_MAX) {
    return {
      ok: false,
      field: "evolution",
      message: "Informe a evolução, com até 10.000 caracteres.",
    };
  }

  try {
    await createEntry(anamnesisId, { ...input, evolution });
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(`/clientes/${clientId}/anamnese/${anamnesisId}`);
  revalidatePath(`/clientes/${clientId}`);
  return { ok: true };
}

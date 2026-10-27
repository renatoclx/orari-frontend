"use server";

import { revalidatePath } from "next/cache";
import { EVOLUTION_MAX } from "@/components/anamnesis/records/entry-validation";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { isUuid } from "@/lib/uuid";
import {
  createAnamnesis,
  createEntry,
  listAnamneses,
} from "@/services/anamnesis.service";
import { getCurrentUser } from "@/services/auth.service";
import type {
  AnamnesisInput,
  AnamnesisListItem,
  EntryInput,
} from "@/types/anamnesis";
import { anamnesisAccess } from "@/utils/anamnesis-access";

const INVALID_REQUEST = { ok: false, message: "Pedido inválido." } as const;

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
  // Ids vêm do navegador: fora do formato, nem chegam à API nem ao revalidatePath.
  if (!isUuid(clientId) || !isUuid(anamnesisId)) return INVALID_REQUEST;
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

export type AnamnesisActionResult = { ok: true; id: string } | ActionFailure;

/**
 * Nova ficha: o registro inicial, com as respostas. Confere o acesso e deixa a
 * API validar o resto (modelo ativo, ficha repetida, obrigatórias, data). O erro
 * da API volta tal como veio; nada do conteúdo vai para log nem para a URL.
 */
export async function createAnamnesisAction(
  input: AnamnesisInput,
): Promise<AnamnesisActionResult> {
  const user = await getCurrentUser();
  if (!anamnesisAccess(user).canAccess) {
    return {
      ok: false,
      message: "Você não tem acesso às fichas de anamnese.",
    };
  }

  if (!isUuid(input.clientId) || !isUuid(input.templateId)) {
    return INVALID_REQUEST;
  }

  try {
    const created = await createAnamnesis(input);
    revalidatePath(`/clientes/${input.clientId}`);
    return { ok: true, id: created.id };
  } catch (error) {
    return failureFrom(error);
  }
}

export type ClientAnamnesesResult =
  { ok: true; items: AnamnesisListItem[] } | ActionFailure;

/**
 * Fichas de um cliente, buscadas só quando o dialog "Ver fichas" abre (a
 * listagem dos clientes traz apenas a contagem). Até 100 fichas: uma por modelo.
 */
export async function listClientAnamnesesAction(
  clientId: string,
): Promise<ClientAnamnesesResult> {
  const user = await getCurrentUser();
  if (!anamnesisAccess(user).canAccess) {
    return {
      ok: false,
      message: "Você não tem acesso às fichas de anamnese.",
    };
  }

  if (!isUuid(clientId)) return INVALID_REQUEST;

  try {
    const result = await listAnamneses({ clientId, page: 1, limit: 100 });
    return { ok: true, items: result.items };
  } catch (error) {
    return failureFrom(error);
  }
}

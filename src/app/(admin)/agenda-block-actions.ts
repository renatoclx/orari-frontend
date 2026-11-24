"use server";

import { revalidatePath } from "next/cache";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { isUuid } from "@/lib/uuid";
import {
  createAgendaBlock,
  deleteAgendaBlock,
  listAgendaBlocks,
} from "@/services/agenda-block.service";
import { ApiError } from "@/services/api";
import type { AgendaBlock, AgendaBlockInput } from "@/types/agenda-block";

// Bloqueio de horários (screens/agendamentos.md, "Bloquear horários").

/** Os bloqueios de hoje em diante, para a lista do dialog. */
export async function listAgendaBlocksAction(): Promise<
  { ok: true; blocks: AgendaBlock[] } | ActionFailure
> {
  try {
    return { ok: true, blocks: await listAgendaBlocks() };
  } catch (error) {
    return failureFrom(error);
  }
}

/**
 * Bloqueia. Com agendamentos no horário e sem `confirmed`, devolve
 * `needsConfirmation` com a mensagem da API ("Há N agendamentos…"), para a
 * tela pedir a confirmação e enviar de novo.
 */
export async function createAgendaBlockAction(
  input: AgendaBlockInput,
  confirmed = false,
): Promise<
  | { ok: true }
  | { ok: false; needsConfirmation: true; message: string }
  | ActionFailure<keyof AgendaBlockInput>
> {
  try {
    await createAgendaBlock({ ...input, confirmed });
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 409 &&
      (error.body as { code?: string } | undefined)?.code ===
        "AGENDA_BLOCK_HAS_APPOINTMENTS"
    ) {
      return { ok: false, needsConfirmation: true, message: error.message };
    }
    return failureFrom(error);
  }
  // A agenda (raiz) passa a mostrar o horário bloqueado.
  revalidatePath("/");
  return { ok: true };
}

/** Desbloqueia. */
export async function deleteAgendaBlockAction(
  id: string,
): Promise<{ ok: true } | ActionFailure> {
  if (!isUuid(id)) return { ok: false, message: "Bloqueio inválido." };
  try {
    await deleteAgendaBlock(id);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath("/");
  return { ok: true };
}

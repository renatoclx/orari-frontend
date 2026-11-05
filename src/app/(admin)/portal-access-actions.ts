"use server";

import { revalidatePath } from "next/cache";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { publicOrigin } from "@/lib/public-origin";
import { isUuid } from "@/lib/uuid";
import {
  confirmPortalClient,
  createPortalAccessLink,
} from "@/services/portal-settings.service";

export type PortalAccessResult =
  { ok: true; url: string; expiresAt: string } | ActionFailure;

/**
 * Gera o link de acesso ao portal para o cliente (uso único, 24 h). Um link
 * novo invalida o anterior. Portal desligado: a mensagem da API orienta.
 */
export async function createPortalAccessAction(
  personId: string,
): Promise<PortalAccessResult> {
  if (!isUuid(personId)) return { ok: false, message: "Cliente inválido." };
  try {
    const [link, origin] = await Promise.all([
      createPortalAccessLink(personId),
      publicOrigin(),
    ]);
    return {
      ok: true,
      url: `${origin}${link.path}`,
      expiresAt: link.expiresAt,
    };
  } catch (error) {
    return failureFrom(error);
  }
}

/**
 * Confirma o cliente que entrou sozinho pelo app: a clínica conferiu quem ele
 * é. Recarrega o histórico, que deixa de mostrar o aviso.
 */
export async function confirmPortalClientAction(
  personId: string,
): Promise<{ ok: true } | ActionFailure> {
  if (!isUuid(personId)) return { ok: false, message: "Cliente inválido." };
  try {
    await confirmPortalClient(personId);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(`/clientes/${personId}`);
  return { ok: true };
}

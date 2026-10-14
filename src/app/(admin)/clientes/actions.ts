"use server";

import { revalidatePath } from "next/cache";
import { ApiError } from "@/services/api";
import { deletePerson } from "@/services/people.service";

export type DeleteClientResult = { ok: true } | { ok: false; message: string };

export async function deleteClientAction(
  id: string,
): Promise<DeleteClientResult> {
  try {
    await deletePerson(id);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { ok: false, message: error.message };
  }

  // A listagem é renderizada no servidor: recarrega sem o item excluído.
  revalidatePath("/clientes");
  return { ok: true };
}

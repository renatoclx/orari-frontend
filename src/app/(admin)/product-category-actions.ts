"use server";

import { revalidatePath } from "next/cache";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import {
  createProductCategory,
  updateProductCategory,
} from "@/services/product-category.service";

export type ProductCategoryActionResult = { ok: true } | ActionFailure<"name">;

const PATH = "/produtos/categorias";

// Único campo: o nome da categoria, obrigatório.
function checkName(name: string): ProductCategoryActionResult | null {
  return name.trim()
    ? null
    : { ok: false, message: "Informe o nome da categoria.", field: "name" };
}

/** Cadastro: nome repetido (409) vai para o campo. */
export async function createProductCategoryAction(
  name: string,
): Promise<ProductCategoryActionResult> {
  const invalid = checkName(name);
  if (invalid) return invalid;
  try {
    await createProductCategory(name.trim());
  } catch (error) {
    return failureFrom(error, "name" as const);
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function renameProductCategoryAction(
  id: string,
  name: string,
): Promise<ProductCategoryActionResult> {
  const invalid = checkName(name);
  if (invalid) return invalid;
  try {
    await updateProductCategory(id, { name: name.trim() });
  } catch (error) {
    return failureFrom(error, "name" as const);
  }
  revalidatePath(PATH);
  return { ok: true };
}

/**
 * Inativar ou reativar (não há exclusão). Com produtos ativos, a API recusa
 * a inativação (409); a mensagem vai para o aviso, não para um campo.
 */
export async function setProductCategoryActiveAction(
  id: string,
  isActive: boolean,
): Promise<ProductCategoryActionResult> {
  try {
    await updateProductCategory(id, { isActive });
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}

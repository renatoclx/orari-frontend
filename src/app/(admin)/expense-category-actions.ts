"use server";

import { revalidatePath } from "next/cache";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import {
  createExpenseCategory,
  deleteExpenseCategory,
  restoreExpenseCategory,
  updateExpenseCategory,
} from "@/services/expense-category.service";

export type ExpenseCategoryActionResult = { ok: true } | ActionFailure<"name">;

const PATH = "/financeiro/categorias-de-despesa";

// Único campo: o nome da categoria, obrigatório.
function checkName(name: string): ExpenseCategoryActionResult | null {
  return name.trim()
    ? null
    : { ok: false, message: "Informe o nome da categoria.", field: "name" };
}

/** Cadastro: nome repetido (409) vai para o campo. */
export async function createExpenseCategoryAction(
  name: string,
): Promise<ExpenseCategoryActionResult> {
  const invalid = checkName(name);
  if (invalid) return invalid;
  try {
    await createExpenseCategory(name.trim());
  } catch (error) {
    return failureFrom(error, "name" as const);
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function updateExpenseCategoryAction(
  id: string,
  name: string,
): Promise<ExpenseCategoryActionResult> {
  const invalid = checkName(name);
  if (invalid) return invalid;
  try {
    await updateExpenseCategory(id, name.trim());
  } catch (error) {
    return failureFrom(error, "name" as const);
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function restoreExpenseCategoryAction(
  id: string,
): Promise<ExpenseCategoryActionResult> {
  try {
    await restoreExpenseCategory(id);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function deleteExpenseCategoryAction(
  id: string,
): Promise<ExpenseCategoryActionResult> {
  try {
    await deleteExpenseCategory(id);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}

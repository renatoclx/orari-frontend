"use server";

import { revalidatePath } from "next/cache";
import {
  hasErrors,
  productErrorField,
  toProductInput,
  validateProductForm,
  type ProductField,
  type ProductFormValues,
} from "@/components/products/product-validation";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { ApiError } from "@/services/api";
import {
  createProduct,
  createStockMovement,
  deleteProduct,
  listStockMovements,
  removeProductPhoto,
  updateProduct,
  uploadProductPhoto,
} from "@/services/product.service";
import type { Paginated } from "@/types/api";
import type {
  ProductInput,
  StockMovement,
  StockMovementInput,
} from "@/types/product";

export type ProductListActionResult = { ok: true } | ActionFailure;

const PATH = "/produtos";

/** Inativar ou reativar; reativar em categoria inativa responde 400. */
export async function setProductActiveAction(
  id: string,
  isActive: boolean,
): Promise<ProductListActionResult> {
  try {
    await updateProduct(id, { isActive });
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}

/** Exclusão lógica: o produto some das listagens e o SKU fica livre. */
export async function deleteProductAction(
  id: string,
): Promise<ProductListActionResult> {
  try {
    await deleteProduct(id);
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}

export type ProductFormActionResult =
  { ok: true; photoFailed: boolean } | ActionFailure<ProductField>;

// O formulário manda os valores em JSON (campo "values"), a foto no campo de
// arquivo e "removePhoto" quando a foto cadastrada foi retirada.
function readValues(data: FormData): ProductFormValues {
  return JSON.parse(String(data.get("values") ?? "{}")) as ProductFormValues;
}

// Valida de novo no servidor; o primeiro erro volta para o campo.
function invalid(
  values: ProductFormValues,
): ActionFailure<ProductField> | null {
  const errors = validateProductForm(values);
  if (!hasErrors(errors)) return null;
  const [field, message] = Object.entries(errors).find(([, text]) => text)!;
  return { ok: false, field: field as ProductField, message: message! };
}

// Erro da API com o campo a que ele se refere (SKU, categoria, preços...).
function failure(error: unknown): ActionFailure<ProductField> {
  const result = failureFrom<ProductField>(error);
  return { ...result, field: productErrorField(result.message) };
}

// A foto vai por rota própria, depois do produto salvo: se falhar, o produto
// fica salvo e a tela avisa.
async function savePhoto(id: string, data: FormData): Promise<boolean> {
  const photo = data.get("photo");
  try {
    if (photo instanceof File && photo.size > 0) {
      await uploadProductPhoto(id, photo);
    } else if (data.get("removePhoto") === "1") {
      await removeProductPhoto(id);
    }
    return false;
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return true;
  }
}

/** Cadastro: o produto e, em seguida, a foto. */
export async function createProductAction(
  data: FormData,
): Promise<ProductFormActionResult> {
  const values = readValues(data);
  const rejected = invalid(values);
  if (rejected) return rejected;

  // No cadastro, os opcionais vazios simplesmente não vão.
  const input = Object.fromEntries(
    Object.entries(toProductInput(values)).filter(
      ([, value]) => value !== null,
    ),
  ) as ProductInput;
  let id: string;
  try {
    id = (await createProduct(input)).id;
  } catch (error) {
    return failure(error);
  }
  const photoFailed = await savePhoto(id, data);
  revalidatePath(PATH);
  return { ok: true, photoFailed };
}

/**
 * Alteração. O fornecedor só vai quando muda: a API confere o fornecedor
 * enviado, e um que foi inativado depois impediria salvar o resto.
 */
export async function updateProductAction(
  id: string,
  currentSupplierId: string | null,
  data: FormData,
): Promise<ProductFormActionResult> {
  const values = readValues(data);
  const rejected = invalid(values);
  if (rejected) return rejected;

  // O estoque atual não vai: muda só pelas movimentações (a API recusa).
  const { supplierId, ...product } = toProductInput(values);
  const input: Partial<ProductInput> = { ...product };
  delete input.currentStock;
  try {
    await updateProduct(id, {
      ...input,
      ...(supplierId !== currentSupplierId && { supplierId }),
    });
  } catch (error) {
    return failure(error);
  }
  const photoFailed = await savePhoto(id, data);
  revalidatePath(PATH);
  return { ok: true, photoFailed };
}

export type StockMovementActionResult =
  { ok: true; movement: StockMovement } | ActionFailure<"quantity">;

/**
 * Movimentar o estoque. Estoque insuficiente (409) e ajuste igual ao saldo
 * vão para o campo da quantidade; os demais erros, para o aviso.
 */
export async function createStockMovementAction(
  productId: string,
  input: StockMovementInput,
): Promise<StockMovementActionResult> {
  let movement: StockMovement;
  try {
    movement = await createStockMovement(productId, input);
  } catch (error) {
    const result = failureFrom(error);
    return {
      ...result,
      field: /estoque|saldo/i.test(result.message) ? "quantity" : undefined,
    };
  }
  revalidatePath(PATH);
  return { ok: true, movement };
}

/** Histórico do produto (o dialog busca ao abrir e a cada "Carregar mais"). */
export async function listStockMovementsAction(
  productId: string,
  page: number,
): Promise<{ ok: true; page: Paginated<StockMovement> } | ActionFailure> {
  try {
    return { ok: true, page: await listStockMovements(productId, page, 20) };
  } catch (error) {
    return failureFrom(error);
  }
}

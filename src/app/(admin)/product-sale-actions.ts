"use server";

import { revalidatePath } from "next/cache";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import {
  cancelProductSale,
  createProductSale,
  searchSaleProducts,
} from "@/services/product-sale.service";
import type { ProductSaleInput, SaleProduct } from "@/types/product";

export type SaleActionResult = { ok: true } | ActionFailure;

// A venda muda a comanda, o estoque e o Contas a receber.
function revalidateSale() {
  revalidatePath("/financeiro/comandas");
  revalidatePath("/financeiro");
  revalidatePath("/produtos");
}

/** Busca da comanda (o dialog chama a cada pausa na digitação). */
export async function searchSaleProductsAction(
  search: string,
): Promise<{ ok: true; products: SaleProduct[] } | ActionFailure> {
  try {
    return { ok: true, products: await searchSaleProducts(search) };
  } catch (error) {
    return failureFrom(error);
  }
}

/** Lança a venda; estoque insuficiente (409) volta com o produto e o saldo. */
export async function createProductSaleAction(
  input: ProductSaleInput,
): Promise<SaleActionResult> {
  try {
    await createProductSale(input);
  } catch (error) {
    return failureFrom(error);
  }
  revalidateSale();
  return { ok: true };
}

/** Cancela a venda pendente (a recebida responde 409). */
export async function cancelProductSaleAction(
  id: string,
): Promise<SaleActionResult> {
  try {
    await cancelProductSale(id);
  } catch (error) {
    return failureFrom(error);
  }
  revalidateSale();
  return { ok: true };
}

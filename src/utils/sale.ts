import type { SaleItem } from "@/types/payment";

/** "Sérum, Faixa (2)": os produtos da venda, com a quantidade quando passa de 1. */
export function saleDescription(
  items: Pick<SaleItem, "quantity" | "product">[],
): string {
  return items
    .map(({ quantity, product }) =>
      quantity > 1 ? `${product.name} (${quantity})` : product.name,
    )
    .join(", ");
}

/** Valor sugerido por unidade: o promocional, se houver; senão, o de venda. */
export const suggestedPrice = (product: {
  salePrice: string;
  promotionalPrice: string | null;
}) => product.promotionalPrice ?? product.salePrice;

/** Linha do carrinho da venda, como a tela a edita. */
export type CartLine = {
  productId: string;
  name: string;
  /** Estoque quando o produto foi adicionado (a API confere de novo). */
  stock: number;
  /** Só dígitos; vazio = não informado. */
  quantity: string;
  /** Centavos, só dígitos (máscara BRL). */
  unitPrice: string;
};

/** Erro de cada linha do carrinho (pelo produto), ou nenhum. */
export function validateCart(lines: CartLine[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const line of lines) {
    const quantity = Number(line.quantity);
    if (!(quantity >= 1)) errors[line.productId] = "Informe a quantidade.";
    else if (quantity > line.stock) {
      errors[line.productId] = `Há ${line.stock} em estoque.`;
    } else if (!(Number(line.unitPrice) > 0)) {
      errors[line.productId] = "Informe o valor.";
    }
  }
  return errors;
}

/** Total do carrinho em reais (soma em centavos, sem erro de arredondamento). */
export const cartTotal = (lines: CartLine[]) =>
  lines.reduce(
    (sum, line) =>
      sum + (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0),
    0,
  ) / 100;

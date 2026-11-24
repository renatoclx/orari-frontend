import type {
  ManualMovementType,
  Product,
  StockMovementType,
} from "@/types/product";

// Regras do dialog Movimentar estoque (backend: business-rules/categorias-produtos.md).

/** Nome de cada tipo, como aparece no histórico. */
export const MOVEMENT_LABELS: Record<StockMovementType, string> = {
  INITIAL: "Saldo inicial",
  PURCHASE: "Entrada por compra",
  INTERNAL_USE: "Uso interno",
  LOSS: "Perda",
  ADJUSTMENT: "Ajuste de inventário",
};

/** Opções do dialog, na ordem de uso, com a explicação curta de cada uma. */
export const MANUAL_MOVEMENTS: {
  value: ManualMovementType;
  label: string;
  hint: string;
}[] = [
  {
    value: "PURCHASE",
    label: MOVEMENT_LABELS.PURCHASE,
    hint: "Soma ao estoque; o custo passa a ser o preço de custo.",
  },
  {
    value: "INTERNAL_USE",
    label: MOVEMENT_LABELS.INTERNAL_USE,
    hint: "Tira do estoque o que foi usado nos atendimentos.",
  },
  {
    value: "LOSS",
    label: MOVEMENT_LABELS.LOSS,
    hint: "Tira do estoque o que quebrou, venceu ou sumiu.",
  },
  {
    value: "ADJUSTMENT",
    label: MOVEMENT_LABELS.ADJUSTMENT,
    hint: "Informe quanto há contado: ele passa a ser o estoque.",
  },
];

/** Estoque atual abaixo do mínimo (sem mínimo, nunca está baixo). */
export const isLowStock = (
  product: Pick<Product, "currentStock" | "minimalStock">,
) =>
  product.minimalStock !== null && product.currentStock < product.minimalStock;

/**
 * Saldo depois da movimentação, para a prévia: a compra soma, as saídas
 * subtraem e o ajuste define. Sem quantidade, `null`.
 */
export function balanceAfter(
  type: ManualMovementType,
  current: number,
  quantity: number | null,
): number | null {
  if (quantity === null) return null;
  if (type === "ADJUSTMENT") return quantity;
  return type === "PURCHASE" ? current + quantity : current - quantity;
}

/** "+10", "-3" e "0" no histórico. */
export const signed = (quantity: number) =>
  quantity > 0 ? `+${quantity}` : String(quantity);

/** Valores do dialog, como a tela os edita (textos). */
export type MovementFormValues = {
  type: ManualMovementType;
  /** Só dígitos; vazio = não informado. */
  quantity: string;
  /** Centavos, só dígitos (máscara BRL). */
  unitCost: string;
  /** Lançar a conta a pagar junto (só na compra). */
  withPayable: boolean;
  categoryId: string;
  dueDate: string;
  /** A conta já nasce paga. */
  paid: boolean;
  methodId: string;
};

export type MovementField =
  "quantity" | "unitCost" | "categoryId" | "dueDate" | "methodId";
export type MovementErrors = Partial<Record<MovementField, string>>;

/** Mesmas regras da API; o saldo negativo e o ajuste igual também. */
export function validateMovement(
  values: MovementFormValues,
  current: number,
): MovementErrors {
  const errors: MovementErrors = {};
  const isAdjustment = values.type === "ADJUSTMENT";
  const quantity = values.quantity === "" ? null : Number(values.quantity);

  if (quantity === null) {
    errors.quantity = isAdjustment
      ? "Informe o saldo contado."
      : "Informe a quantidade.";
  } else if (!isAdjustment && quantity < 1) {
    errors.quantity = "Informe uma quantidade de 1 ou mais.";
  } else if (isAdjustment && quantity === current) {
    errors.quantity = "O saldo contado é igual ao estoque atual.";
  } else if ((balanceAfter(values.type, current, quantity) ?? 0) < 0) {
    errors.quantity = `Estoque insuficiente: há ${current} em estoque.`;
  }

  if (values.type === "PURCHASE") {
    if (!(Number(values.unitCost) > 0)) errors.unitCost = "Informe o custo.";
    if (values.withPayable) {
      if (!values.categoryId) errors.categoryId = "Escolha a categoria.";
      if (!values.dueDate) errors.dueDate = "Informe o vencimento.";
      if (values.paid && !values.methodId) {
        errors.methodId = "Escolha o método de pagamento.";
      }
    }
  }
  return errors;
}

import type { Product, ProductInput, ProductUnit } from "@/types/product";

/** Valores do formulário de produto, como a tela os edita (textos). */
export type ProductFormValues = {
  name: string;
  description: string;
  sku: string;
  categoryId: string;
  /** Vazio = sem fornecedor. */
  supplierId: string;
  /** Vazio = sem unidade. */
  measureUnit: ProductUnit | "";
  /** Centavos, só dígitos (máscara BRL); vazio = não informado. */
  salePrice: string;
  purchasePrice: string;
  promotionalPrice: string;
  /** Inteiros, só dígitos; vazio = não informado. */
  currentStock: string;
  minimalStock: string;
  maximumStock: string;
};

export type ProductField = keyof ProductFormValues;
export type ProductFormErrors = Partial<Record<ProductField, string>>;

// Decimal(10,2) do banco: até 99.999.999,99 (a máscara já limita a 10 dígitos).
const MAX_PRICE_CENTS = 9_999_999_999;
// Int do banco (Postgres): até 2.147.483.647.
const MAX_STOCK = 2_147_483_647;

/** Centavos da API ("37.5" → "3750"), para a máscara de moeda. */
export const centsText = (price: string | null) =>
  price === null ? "" : String(Math.round(Number(price) * 100));

const stockText = (stock: number | null) =>
  stock === null ? "" : String(stock);

/** Formulário vazio (cadastro) ou com os dados do produto (alteração). */
export function initialProductValues(product?: Product): ProductFormValues {
  return {
    name: product?.name ?? "",
    description: product?.description ?? "",
    sku: product?.sku ?? "",
    categoryId: product?.categoryId ?? "",
    supplierId: product?.supplierId ?? "",
    measureUnit: product?.measureUnit ?? "",
    salePrice: product ? centsText(product.salePrice) : "",
    purchasePrice: product ? centsText(product.purchasePrice) : "",
    promotionalPrice: product ? centsText(product.promotionalPrice) : "",
    currentStock: product ? stockText(product.currentStock) : "",
    minimalStock: product ? stockText(product.minimalStock) : "",
    maximumStock: product ? stockText(product.maximumStock) : "",
  };
}

/** Campo de estoque: só dígitos, sem zeros à esquerda (o "0" sozinho vale). */
export function maskStock(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  return digits.replace(/^0+(?=\d)/, "");
}

/**
 * Regras do backend (business-rules/categorias-produtos.md): nome, categoria,
 * preços de venda e de custo (maiores que zero) e estoque atual obrigatórios;
 * promocional menor que a venda; mínimo até o máximo.
 */
export function validateProductForm(
  values: ProductFormValues,
): ProductFormErrors {
  const errors: ProductFormErrors = {};
  const cents = (text: string) => Number(text || 0);

  if (!values.name.trim()) errors.name = "Informe o nome do produto.";
  if (!values.categoryId) errors.categoryId = "Escolha a categoria.";

  for (const [field, label] of [
    ["salePrice", "o preço de venda"],
    ["purchasePrice", "o preço de custo"],
  ] as const) {
    if (cents(values[field]) <= 0) errors[field] = `Informe ${label}.`;
    else if (cents(values[field]) > MAX_PRICE_CENTS) {
      errors[field] = "Informe um valor menor.";
    }
  }

  if (
    values.promotionalPrice &&
    !errors.salePrice &&
    cents(values.promotionalPrice) >= cents(values.salePrice)
  ) {
    errors.promotionalPrice =
      "O preço promocional precisa ser menor que o preço de venda.";
  }

  if (!values.currentStock) {
    errors.currentStock = "Informe o estoque atual.";
  }
  for (const field of [
    "currentStock",
    "minimalStock",
    "maximumStock",
  ] as const) {
    if (values[field] && Number(values[field]) > MAX_STOCK) {
      errors[field] = "Informe uma quantidade menor.";
    }
  }
  if (
    values.minimalStock &&
    values.maximumStock &&
    !errors.minimalStock &&
    Number(values.minimalStock) > Number(values.maximumStock)
  ) {
    errors.minimalStock = "O estoque mínimo não pode passar do estoque máximo.";
  }

  return errors;
}

export const hasErrors = (errors: ProductFormErrors) =>
  Object.values(errors).some(Boolean);

/** Corpo da API: centavos viram reais e opcionais vazios viram `null`. */
export function toProductInput(values: ProductFormValues): ProductInput {
  const optionalText = (text: string) => text.trim() || null;
  const optionalNumber = (text: string, divisor = 1) =>
    text ? Number(text) / divisor : null;
  return {
    name: values.name.trim(),
    description: optionalText(values.description),
    sku: optionalText(values.sku),
    categoryId: values.categoryId,
    supplierId: values.supplierId || null,
    measureUnit: values.measureUnit || null,
    salePrice: Number(values.salePrice) / 100,
    purchasePrice: Number(values.purchasePrice) / 100,
    promotionalPrice: optionalNumber(values.promotionalPrice, 100),
    currentStock: Number(values.currentStock),
    minimalStock: optionalNumber(values.minimalStock),
    maximumStock: optionalNumber(values.maximumStock),
  };
}

// Mensagens da API que pertencem a um campo (as demais vão para o aviso).
const API_FIELDS: [RegExp, ProductField][] = [
  [/SKU/i, "sku"],
  [/categoria/i, "categoryId"],
  [/fornecedor/i, "supplierId"],
  [/promocional/i, "promotionalPrice"],
  [/estoque mínimo/i, "minimalStock"],
];

/** Campo do formulário a que um erro da API se refere, quando houver. */
export function productErrorField(message: string): ProductField | undefined {
  return API_FIELDS.find(([pattern]) => pattern.test(message))?.[1];
}

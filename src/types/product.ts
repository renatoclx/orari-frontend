// Espelha as respostas de /product-categories e /products do backend
// (docs/business-rules/categorias-produtos.md).

export type ProductCategory = {
  id: string;
  /** Único na empresa, sem diferenciar acentos nem maiúsculas. */
  name: string;
  /** Não há exclusão: a categoria é inativada e reativada. */
  isActive: boolean;
};

/** Unidades de medida aceitas pela API (lista fixa). */
export type ProductUnit = "UN" | "CX" | "PCT" | "KG" | "G" | "L" | "ML" | "M";

export type Product = {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  categoryId: string;
  supplierId: string | null;
  measureUnit: ProductUnit | null;
  // Decimais chegam como texto (ex.: "100", "37.5"), como no resto da API.
  salePrice: string;
  purchasePrice: string;
  promotionalPrice: string | null;
  /** Calculada pela API sobre a venda; pode ser negativa. */
  profitMargin: string;
  currentStock: number;
  minimalStock: number | null;
  maximumStock: number | null;
  photoUrl: string | null;
  isActive: boolean;
  category: { id: string; name: string };
  supplier: { id: string; name: string } | null;
};

/**
 * Corpo do cadastro. Na alteração tudo é opcional, e `null` limpa os campos
 * opcionais. `profitMargin` nunca vai: a API recusa (400).
 */
export type ProductInput = {
  name: string;
  description: string | null;
  sku: string | null;
  categoryId: string;
  supplierId: string | null;
  measureUnit: ProductUnit | null;
  salePrice: number;
  purchasePrice: number;
  promotionalPrice: number | null;
  currentStock: number;
  minimalStock: number | null;
  maximumStock: number | null;
};

/** Motivo da movimentação de estoque (o saldo inicial vem do cadastro). */
export type StockMovementType =
  "INITIAL" | "PURCHASE" | "INTERNAL_USE" | "LOSS" | "ADJUSTMENT";

/** Tipos lançados à mão no dialog Movimentar estoque. */
export type ManualMovementType = Exclude<StockMovementType, "INITIAL">;

/** Uma linha do histórico de estoque (GET /products/:id/stock-movements). */
export type StockMovement = {
  id: string;
  type: StockMovementType;
  /** Variação: positiva na entrada, negativa na saída. */
  quantity: number;
  /** Saldo logo depois desta movimentação. */
  balanceAfter: number;
  unitCost: string | null;
  note: string | null;
  createdAt: string;
  /** Vazio no saldo de antes do controle de estoque. */
  createdBy: { id: string; name: string } | null;
  payable: { id: string; description: string; status: string } | null;
};

/**
 * Corpo de POST /products/:id/stock-movements. `quantity`: unidades (1 ou
 * mais) na entrada e nas saídas; o saldo contado no ajuste.
 */
export type StockMovementInput = {
  type: ManualMovementType;
  quantity: number;
  unitCost?: number;
  note?: string;
  payable?: {
    /** Sem ele, o fornecedor do produto; `null`, nenhum. */
    payeeId?: string | null;
    categoryId: string;
    dueDate: string;
    paid?: { paidAt: string; paymentMethodId: string };
  };
};

/** Produto na busca da comanda (GET /product-sales/products). */
export type SaleProduct = {
  id: string;
  name: string;
  sku: string | null;
  photoUrl: string | null;
  measureUnit: ProductUnit | null;
  salePrice: string;
  promotionalPrice: string | null;
  currentStock: number;
};

/** Corpo de POST /product-sales: o cliente e os itens (valor em reais). */
export type ProductSaleInput = {
  clientId: string;
  items: { productId: string; quantity: number; unitPrice: number }[];
};

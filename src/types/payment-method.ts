// Espelha a resposta de /payment-methods do backend (só o que a tela usa).

export type PaymentMethodItem = {
  id: string;
  /** Tipo de pagamento (ex.: "Pix", "Cartão de crédito"); único na empresa. */
  name: string;
  /** Nulo = ativo; preenchido = inativo. */
  deletedAt: string | null;
};

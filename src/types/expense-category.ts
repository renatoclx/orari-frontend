// Espelha a resposta de /expense-categories do backend (só o que a tela usa).

export type ExpenseCategoryItem = {
  id: string;
  /** Nome (ex.: "Aluguel", "Energia"); único na empresa. */
  name: string;
  /** Nulo = ativo; preenchido = inativo. */
  deletedAt: string | null;
};

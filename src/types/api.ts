// Formatos comuns às respostas do backend.

/** Formato de toda listagem paginada do backend. */
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

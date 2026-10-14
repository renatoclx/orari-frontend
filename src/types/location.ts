// Espelham as respostas de GET /states e GET /cities do backend.

export type State = {
  id: string;
  name: string;
  /** Sigla (UF), ex.: "SP". */
  acronym: string;
};

export type City = {
  id: string;
  name: string;
  stateId: string;
};

/** Formato de toda listagem paginada do backend. */
export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

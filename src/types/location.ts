// Espelham as respostas de GET /states e GET /cities do backend.

export type State = {
  id: string;
  name: string;
  /** Sigla (UF), ex.: "SP". */
  acronym: string;
};

/** Cidade (GET /cities); o endereço guarda só o código dela. */
export type City = {
  id: string;
  name: string;
  stateId: string;
};

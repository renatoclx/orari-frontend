// Espelha a resposta de GET /people?type=CLIENT do backend.
export type Client = {
  id: string;
  name: string;
  /** CPF sem máscara. */
  document: string;
  /** Data sem horário, em ISO (ex.: "1990-03-15T00:00:00.000Z"). */
  birthDate: string;
  profession: string | null;
  note: string | null;
  /**
   * Provisório: a listagem do backend ainda não devolve o telefone principal.
   * Somente dígitos, com DDD.
   */
  mainPhone: string | null;
  /** Provisório: o backend ainda não guarda foto de pessoa. */
  photoUrl: string | null;
};

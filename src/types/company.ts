// Espelha a resposta de /companies do backend (só o que a tela usa).

export type Company = {
  id: string;
  /** Razão social. */
  corporateReason: string;
  fantasyName: string | null;
  /**
   * CPF (11 dígitos) ou CNPJ (14 caracteres, numérico ou alfanumérico), sem
   * máscara. O tamanho diz qual é.
   */
  document: string;
  /** Data de fundação ("2020-05-10T00:00:00.000Z"); nula para quem usa CPF. */
  foundationDate: string | null;
  subdomain: string;
  /** Fuso IANA (ex.: "America/Sao_Paulo"). */
  timezone: string;
  logoUrl: string | null;
};

// Espelha a resposta de /companies do backend (só o que a tela usa).

export type Company = {
  id: string;
  /** Razão social. */
  corporateReason: string;
  fantasyName: string | null;
  /** Só dígitos (14). */
  cnpj: string;
  /** Data de fundação ("2020-05-10T00:00:00.000Z"). */
  foundationDate: string;
  subdomain: string;
  /** Fuso IANA (ex.: "America/Sao_Paulo"). */
  timezone: string;
  logoUrl: string | null;
};

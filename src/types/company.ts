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
  /** Empresa inativa: só o SUPER_ADMIN a vê (para reativá-la). */
  isActive: boolean;
};

/** Corpo do POST /companies (só o SUPER_ADMIN cadastra). */
export type CreateCompanyInput = {
  corporateReason: string;
  fantasyName?: string;
  /** CPF ou CNPJ, sem máscara e em maiúsculas. */
  document: string;
  /** "aaaa-mm-dd"; não se aplica a quem usa CPF. */
  foundationDate?: string;
  subdomain: string;
  timezone: string;
};

/** Corpo do PATCH /companies/:id: só o que mudar; `null` remove o campo opcional. */
export type UpdateCompanyInput = Partial<
  Omit<CreateCompanyInput, "fantasyName" | "foundationDate">
> & {
  fantasyName?: string | null;
  foundationDate?: string | null;
  isActive?: boolean;
};

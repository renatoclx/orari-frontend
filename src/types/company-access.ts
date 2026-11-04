// Acessos e limites da empresa (screens/empresas.md). Ainda sem API: o formato
// pode mudar quando o backend definir as rotas.

/** O que um administrador da empresa pode fazer em uma funcionalidade. */
export type AccessAction = "view" | "edit" | "create" | "remove";

export type FeatureAccess = Record<AccessAction, boolean>;

/** Permissões por funcionalidade (chave = `key` de `ACCESS_GROUPS`). */
export type AccessMatrix = Record<string, FeatureAccess>;

export type CompanyLimits = {
  /** Profissionais ativos, contando o administrador que atua. */
  professionals: number;
  /** Administradores (usuários com acesso). */
  admins: number;
};

export type CompanyAccess = {
  matrix: AccessMatrix;
  limits: CompanyLimits;
};

/** Quanto a empresa já usa de cada limite. */
export type CompanyUsage = CompanyLimits;

/** Uma funcionalidade na resposta da API (`GET /auth/me` e `/companies/:id/access`). */
export type FeatureAccessEntry = FeatureAccess & { feature: string };

/** Resposta de GET /companies/:id/access (só SUPER_ADMIN). */
export type CompanyAccessResponse = {
  features: FeatureAccessEntry[];
  limits: CompanyLimits;
  usage: CompanyUsage;
};

// Espelham as respostas do portal do cliente no backend (módulo portal).

/** Regras do portal da clínica (GET/PUT /portal-settings). */
export type PortalSettings = {
  enabled: boolean;
  /** Antecedência mínima para o cliente agendar, em minutos. */
  minAdvanceMinutes: number;
  /** Até quantos dias à frente o cliente agenda. */
  maxDaysAhead: number;
  /** Até quantas horas antes o cliente cancela. */
  cancelUntilHours: number;
};

/** Resposta de POST /people/:id/portal-access. */
export type PortalAccessLink = {
  token: string;
  expiresAt: string;
  /** Caminho do portal no frontend (`/p/<subdomínio>/acesso/<token>`). */
  path: string;
};

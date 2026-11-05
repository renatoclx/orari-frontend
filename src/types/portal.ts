// Espelham as respostas do portal do cliente no backend (módulo portal).

/** Ramo do estabelecimento na busca do app (rótulos em utils/business-segment). */
export type BusinessSegment =
  | "BARBERSHOP"
  | "BEAUTY_SALON"
  | "AESTHETICS"
  | "NAIL_SALON"
  | "EYEBROW_DESIGN"
  | "PHYSIOTHERAPY"
  | "PILATES"
  | "PSYCHOLOGY"
  | "NUTRITION"
  | "DENTISTRY"
  | "OTHER";

/** Regras do portal da clínica (GET/PUT /portal-settings). */
export type PortalSettings = {
  enabled: boolean;
  /** Antecedência mínima para o cliente agendar, em minutos. */
  minAdvanceMinutes: number;
  /** Até quantos dias à frente o cliente agenda. */
  maxDaysAhead: number;
  /** Até quantas horas antes o cliente cancela. */
  cancelUntilHours: number;
  /** Aparece na busca de estabelecimentos do app. */
  listed: boolean;
  /** Obrigatório para aparecer na busca. */
  segment: BusinessSegment | null;
};

/** Resposta de POST /people/:id/portal-access. */
export type PortalAccessLink = {
  token: string;
  expiresAt: string;
  /** Caminho no app do cliente (`/app/acesso/<token>`). */
  path: string;
};

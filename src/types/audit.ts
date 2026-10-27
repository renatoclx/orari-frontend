// Espelha as respostas de /audit-logs do backend (só o ADMIN consulta).

/** Ações registradas (enum AuditAction). Cresce junto com o backend. */
export type AuditAction =
  | "USER_LINK_CHANGED"
  | "USER_TYPE_CHANGED"
  | "USER_RESTORED"
  | "ANAMNESIS_TEMPLATE_CREATED"
  | "ANAMNESIS_TEMPLATE_UPDATED"
  | "ANAMNESIS_VIEWED"
  | "ANAMNESIS_LISTED"
  | "ANAMNESIS_ENTRY_CREATED"
  | "ANAMNESIS_PDF_GENERATED";

/** Registro de auditoria: só ids; os nomes são resolvidos na tela. */
export type AuditLogItem = {
  id: string;
  companyId: string;
  userId: string;
  action: AuditAction;
  /** Tipo do alvo (ex.: ANAMNESIS, CLIENT, COMPANY). */
  entityType: string;
  entityId: string;
  /** Cliente a que a ação se refere, quando houver. */
  clientId: string | null;
  ip: string | null;
  createdAt: string;
};

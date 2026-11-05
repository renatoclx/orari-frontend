// Espelham as respostas da conta do cliente no backend (/portal-account), o
// app do cliente em /app (screens/app-cliente.md).

/** Estabelecimento da conta, com o fuso para mostrar os horários. */
export type AppPlace = {
  slug: string;
  name: string;
  logoUrl: string | null;
  timezone: string;
};

/** GET /portal-account. */
export type AppAccount = {
  account: { id: string; name: string; phone: string };
  places: AppPlace[];
};

/** Sessão aberta no cadastro, no login ou pelo link (o token volta uma vez só). */
export type AppSession = { token: string; expiresAt: string };

/** POST /portal-account/link/check. */
export type AccessLinkCheck = {
  place: Omit<AppPlace, "timezone">;
  clientName: string;
  /** O cadastro na clínica não tem telefone: o cliente informa. */
  needsPhone: boolean;
  /** Já existe conta: a senha será a nova senha dela. */
  hasAccount: boolean;
};

/** POST /portal-account/link: sem conta entrada, vem também a sessão. */
export type AccessLinkResult = Partial<AppSession> & {
  place: Omit<AppPlace, "timezone">;
};

/** Item de GET /portal-account/appointments. */
export type AppAppointment = {
  id: string;
  startAt: string;
  endAt: string;
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  kind: "SINGLE" | "RECURRENCE" | "PLAN" | "CLASS";
  service: { name: string; duration: number };
  professional: { name: string };
  canCancel: boolean;
  place: AppPlace;
};

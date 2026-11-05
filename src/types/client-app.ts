import type { BusinessSegment } from "@/types/portal";

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
  /** Avisos ainda não vistos (o ponto na aba Menu). */
  unreadMessages: number;
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

/** Resultado de GET /portal-directory?q= (busca de estabelecimentos). */
export type DirectoryPlace = {
  slug: string;
  name: string;
  logoUrl: string | null;
  segment: BusinessSegment;
  /** "Cidade - UF"; nula sem endereço cadastrado. */
  city: string | null;
};

/** GET /portal/:slug: a vitrine do estabelecimento. */
export type PlaceShowcase = {
  name: string;
  logoUrl: string | null;
  segment: BusinessSegment | null;
  city: string | null;
  timezone: string;
  rules: {
    minAdvanceMinutes: number;
    maxDaysAhead: number;
    cancelUntilHours: number;
  };
};

/** Item de GET /portal/:slug/services. */
export type PlaceService = {
  id: string;
  name: string;
  description: string | null;
  /** Em minutos. */
  duration: number;
  price: number | null;
  professionals: { id: string; name: string; photoUrl: string | null }[];
};

/** GET /portal-account/profile: Meus dados. */
export type AppProfile = {
  name: string;
  phone: string;
  email: string | null;
  /** CPF sem máscara. */
  document: string | null;
  /** Data pura (ISO, meia-noite UTC). */
  birthDate: string | null;
  profession: string | null;
  photoUrl: string | null;
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string | null;
    city: { id: string; name: string; state: string };
  } | null;
};

/** Item de GET /portal-account/plans (só para ver; sem valores). */
export type AppPlan = {
  id: string;
  planName: string;
  startDate: string;
  endDate: string;
  status: "active" | "finished" | "cancelled";
  place: AppPlace;
};

/** Item de GET /portal-account/recurrences (só para ver). */
export type AppRecurrence = {
  id: string;
  kind: "RECURRENCE" | "PLAN" | "CLASS";
  service: { name: string };
  professional: { name: string };
  days: { weekDay: string; startTime: string; endTime: string }[];
  startDate: string;
  endDate: string | null;
  place: AppPlace;
};

/** GET /portal-account/push: `publicKey` nula = avisos desligados no servidor. */
export type PushInfo = {
  publicKey: string | null;
  notifyAppointments: boolean;
  notifyPromotions: boolean;
};

export type PushPreferences = Omit<PushInfo, "publicKey">;

/** Inscrição do aparelho, no formato do `PushSubscription.toJSON()`. */
export type PushSubscriptionJson = {
  endpoint: string;
  expirationTime?: number | null;
  keys: { p256dh: string; auth: string };
};

/** Item da caixa de Avisos (GET /portal-account/messages). */
export type AppMessage = {
  id: string;
  kind:
    "REMINDER" | "APPOINTMENT" | "BIRTHDAY" | "MISS_YOU" | "CAMPAIGN" | "TEST";
  title: string;
  body: string;
  url: string | null;
  readAt: string | null;
  createdAt: string;
  /** A clínica que enviou; nula no aviso de teste (é do Orari). */
  place: { name: string; logoUrl: string | null } | null;
};

export type AppMessagesPage = {
  items: AppMessage[];
  total: number;
  unread: number;
  page: number;
  limit: number;
};

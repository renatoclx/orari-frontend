// Notificações dos usuários do sistema (o sino). Backend: /notifications.

/** Cresce junto com as fontes de aviso. */
export type NotificationCategory =
  "APPOINTMENT" | "REMINDER" | "DAILY_SUMMARY" | "PENDING_SUMMARY" | "WELCOME";

export type AppNotification = {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  /** Caminho aberto ao tocar (do painel ou do app, conforme quem recebe). */
  url: string | null;
  /** Preenchido quando já foi lida. */
  readAt: string | null;
  createdAt: string;
};

export type NotificationsPage = {
  items: AppNotification[];
  total: number;
  page: number;
  limit: number;
  /** Quantas não lidas (o número do sino), sem depender da página. */
  unread: number;
};

export type NotificationPreference = {
  category: NotificationCategory;
  /** Se a categoria também vira push neste usuário. */
  push: boolean;
};

export type NotificationPreferences = {
  /** Nula com o push desligado no servidor. */
  publicKey: string | null;
  preferences: NotificationPreference[];
};

/** O número do sino e quando chegou a notificação mais nova (nulo sem nenhuma). */
export type UnreadInfo = {
  unread: number;
  latestAt: string | null;
};

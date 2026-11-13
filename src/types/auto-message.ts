// Espelham GET/PUT /auto-messages do backend (mensagens automáticas ao cliente
// do app; screens/mensagens.md).

export type AutoMessageKind =
  | "REMINDER"
  | "APPOINTMENT_CREATED"
  | "APPOINTMENT_RESCHEDULED"
  | "APPOINTMENT_CANCELLED"
  | "BIRTHDAY"
  | "MISS_YOU"
  | "PROFESSIONAL_REMINDER"
  | "PROFESSIONAL_SUMMARY"
  | "ADMIN_SUMMARY";

export type AutoMessage = {
  kind: AutoMessageKind;
  enabled: boolean;
  /** Texto com as variáveis ({nome}, {data}…), trocadas no envio. */
  body: string;
  /** Lembrete: minutos antes do horário (ex.: [1440, 30]). */
  reminderOffsets: number[];
  /** Sentimos sua falta: dias sem vir. */
  missYouDays: number | null;
  /** Resumo do administrador: a hora do envio (7 a 10) e os itens que entram. */
  summaryHour: number | null;
  summaryItems: SummaryItem[];
};

/** Os itens do resumo de pendências do administrador. */
export type SummaryItem =
  | "PAYABLE_TODAY"
  | "PAYABLE_OVERDUE"
  | "RECEIVABLE_OVERDUE"
  | "OPEN_TABS"
  | "BIRTHDAYS";

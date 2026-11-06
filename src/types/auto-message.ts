// Espelham GET/PUT /auto-messages do backend (mensagens automáticas ao cliente
// do app; screens/mensagens.md).

export type AutoMessageKind =
  | "REMINDER"
  | "APPOINTMENT_CREATED"
  | "APPOINTMENT_RESCHEDULED"
  | "APPOINTMENT_CANCELLED"
  | "BIRTHDAY"
  | "MISS_YOU";

export type AutoMessage = {
  kind: AutoMessageKind;
  enabled: boolean;
  /** Texto com as variáveis ({nome}, {data}…), trocadas no envio. */
  body: string;
  /** Lembrete: minutos antes do horário (ex.: [1440, 30]). */
  reminderOffsets: number[];
  /** Sentimos sua falta: dias sem vir. */
  missYouDays: number | null;
};

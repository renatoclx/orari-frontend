/** Horário bloqueado na agenda (backend: /agenda-blocks; screens/agendamentos.md). */
export type AgendaBlock = {
  id: string;
  /** Início e fim em ISO (UTC), no mesmo dia do relógio da empresa. */
  startAt: string;
  endAt: string;
  createdAt: string;
  createdBy: { name: string };
};

/** O que a tela envia para bloquear (horários no relógio da empresa). */
export type AgendaBlockInput = {
  date: string;
  startTime: string;
  endTime: string;
};

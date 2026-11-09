// Relatório de agendamentos (screens/relatorio-agendamentos.md).

/** Contagens de um profissional ou serviço; `total` não conta os cancelados. */
export type AppointmentBreakdown = {
  id: string;
  name: string;
  total: number;
  completed: number;
  noShow: number;
  cancelled: number;
};

export type AppointmentReportPoint = {
  /** Primeiro dia do intervalo, "aaaa-mm-dd". */
  date: string;
  completed: number;
  noShow: number;
  cancelled: number;
  open: number;
};

export type AppointmentReport = {
  /** Não cancelados. */
  total: number;
  /** Agendado, confirmado ou em andamento. */
  open: number;
  completed: number;
  noShow: number;
  cancelled: number;
  /** Dos não cancelados, os marcados pelo cliente no app. */
  fromPortal: number;
  /** Faltas ÷ (concluídos + faltas), de 0 a 1. */
  noShowRate: number | null;
  /** Cancelados ÷ todos, de 0 a 1. */
  cancelRate: number | null;
  series: { unit: "day" | "week"; points: AppointmentReportPoint[] };
  /** weekDay 0 = domingo; hora de início no fuso da empresa. */
  peak: { weekDay: number; hour: number; count: number }[];
  byProfessional: AppointmentBreakdown[];
  byService: (AppointmentBreakdown & { minutes: number })[];
};

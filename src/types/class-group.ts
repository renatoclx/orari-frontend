// Espelha a resposta de /class-groups do backend (turma fixa, docs/turmas.md).
import type { WeekDay } from "@/types/business-hour";

/** Dia e horário da turma; "HH:MM". O fim é o início mais a duração do serviço. */
export type ClassGroupDay = {
  weekDay: WeekDay;
  startTime: string;
  endTime: string;
};

export type ClassGroupItem = {
  id: string;
  /** Opcional: serve só para identificar a turma. */
  name: string | null;
  serviceId: string;
  professionalId: string;
  /** Quantidade máxima de alunos por sessão. */
  capacity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  service: { id: string; name: string; color: string | null; duration: number };
  professional: { id: string; name: string; photoUrl: string | null };
  days: ClassGroupDay[];
};

/** Corpo de POST /class-groups (só o início de cada horário). */
export type ClassGroupInput = {
  name?: string;
  serviceId: string;
  professionalId: string;
  capacity: number;
  days: { weekDay: WeekDay; startTime: string }[];
};

/** Corpo de PATCH /class-groups/:id: só nome, vagas e situação mudam. `null` remove o nome. */
export type ClassGroupUpdate = {
  name?: string | null;
  capacity?: number;
  isActive?: boolean;
};

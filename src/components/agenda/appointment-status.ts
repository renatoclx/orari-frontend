import {
  CheckCheck,
  CircleCheck,
  CirclePlay,
  CircleX,
  Clock,
  UserX,
  type LucideIcon,
} from "lucide-react";
import type {
  AppointmentCancelReason,
  AppointmentStatus,
} from "@/types/appointment";

/** Rótulo e ícone de cada status: o bloco da agenda mostra os dois, lado a lado. */
export const APPOINTMENT_STATUS: Record<
  AppointmentStatus,
  { label: string; icon: LucideIcon }
> = {
  SCHEDULED: { label: "Agendado", icon: Clock },
  CONFIRMED: { label: "Confirmado", icon: CircleCheck },
  IN_PROGRESS: { label: "Em andamento", icon: CirclePlay },
  COMPLETED: { label: "Concluído", icon: CheckCheck },
  CANCELLED: { label: "Cancelado", icon: CircleX },
  NO_SHOW: { label: "Não compareceu", icon: UserX },
};

/** Por que a clínica cancelou a aula de turma, por escrito ao lado do "Cancelado". */
export const CANCEL_REASON_LABEL: Record<AppointmentCancelReason, string> = {
  CLASS_SESSION_CANCELLED: "Sessão da turma cancelada",
  CLASS_LEFT: "Saiu da turma",
};

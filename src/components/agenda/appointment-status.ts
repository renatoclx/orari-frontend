import {
  CheckCheck,
  CircleCheck,
  CirclePlay,
  CircleX,
  Clock,
  UserX,
  type LucideIcon,
} from "lucide-react";
import type { AppointmentStatus } from "@/types/appointment";

/** Rótulo e ícone de cada status: o bloco da agenda e a legenda usam a mesma fonte. */
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

/** Ordem em que a legenda lista os status (o ciclo de vida do agendamento). */
export const APPOINTMENT_STATUS_ORDER: AppointmentStatus[] = [
  "SCHEDULED",
  "CONFIRMED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

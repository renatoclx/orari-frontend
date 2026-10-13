import type { AgendaAppointment, Professional } from "@/types/agenda";

// Dados provisórios para o protótipo; serão substituídos pela API.
export const mockDate = new Date("2026-10-12T12:00:00-03:00");

// Horário fixo do "agora" para o protótipo ficar previsível.
export const mockNow = "10:40";

export const mockProfessionals: Professional[] = [
  {
    id: "carla",
    name: "Carla",
    workingHours: { start: "08:00", end: "19:00" },
    breaks: [{ start: "12:00", end: "13:00" }],
  },
  {
    id: "juliana",
    name: "Juliana",
    workingHours: { start: "08:00", end: "18:00" },
    breaks: [{ start: "13:00", end: "14:00" }],
  },
  {
    id: "kelvin",
    name: "Kelvin",
    workingHours: { start: "09:00", end: "19:00" },
    breaks: [{ start: "12:00", end: "13:30" }],
  },
];

const services = {
  cutPigment: { serviceName: "Corte e pigmentação", serviceColor: "#8b5cf6" },
  haircut: { serviceName: "Corte de cabelo", serviceColor: "#f59e0b" },
  hairBrow: { serviceName: "Cabelo e sobrancelha", serviceColor: "#ec4899" },
  pilates: { serviceName: "Pilates", serviceColor: "#10b981" },
  drainage: { serviceName: "Drenagem linfática", serviceColor: "#6366f1" },
  beard: { serviceName: "Barba", serviceColor: "#f97316" },
};

export const mockAppointments: AgendaAppointment[] = [
  {
    id: "1",
    professionalId: "carla",
    start: "09:00",
    end: "10:00",
    clientName: "Lucas Andrade",
    ...services.cutPigment,
    status: "COMPLETED",
  },
  {
    id: "2",
    professionalId: "carla",
    start: "10:30",
    end: "11:00",
    clientName: "Beatriz Freire",
    ...services.haircut,
    status: "IN_PROGRESS",
  },
  {
    id: "3",
    professionalId: "carla",
    start: "11:00",
    end: "11:30",
    clientName: "Hugo Oliveira",
    ...services.haircut,
    status: "CONFIRMED",
  },
  {
    id: "4",
    professionalId: "carla",
    start: "14:00",
    end: "15:00",
    clientName: "Dhebora Lima",
    ...services.hairBrow,
    status: "SCHEDULED",
  },
  {
    id: "5",
    professionalId: "juliana",
    start: "08:00",
    end: "09:00",
    clientName: "Marcos Oliveira",
    ...services.pilates,
    status: "COMPLETED",
  },
  {
    id: "6",
    professionalId: "juliana",
    start: "10:00",
    end: "11:00",
    clientName: "Paula Mendes",
    ...services.pilates,
    status: "IN_PROGRESS",
  },
  {
    id: "7",
    professionalId: "juliana",
    start: "15:00",
    end: "16:00",
    clientName: "Renata Costa",
    ...services.drainage,
    status: "SCHEDULED",
  },
  {
    id: "8",
    professionalId: "kelvin",
    start: "09:30",
    end: "10:00",
    clientName: "Douglas Guedes",
    ...services.haircut,
    status: "CANCELLED",
  },
  {
    id: "9",
    professionalId: "kelvin",
    start: "10:00",
    end: "10:45",
    clientName: "Carlos Lima",
    ...services.beard,
    status: "IN_PROGRESS",
  },
  {
    id: "10",
    professionalId: "kelvin",
    start: "16:00",
    end: "17:00",
    clientName: "João Pedro",
    ...services.beard,
    status: "CONFIRMED",
  },
];

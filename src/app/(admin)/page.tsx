import { AgendaActionBar } from "@/components/agenda/AgendaActionBar";
import { AgendaToolbar } from "@/components/agenda/AgendaToolbar";
import { DayGrid } from "@/components/agenda/DayGrid";
import {
  mockAppointments,
  mockDate,
  mockNow,
  mockProfessionals,
} from "@/components/agenda/mock-data";
import { formatLongDate } from "@/utils/time";

export default function AgendaPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Agendamentos</h1>
      <AgendaToolbar dateLabel={formatLongDate(mockDate)} />
      <DayGrid
        professionals={mockProfessionals}
        appointments={mockAppointments}
        now={mockNow}
      />
      <AgendaActionBar />
    </div>
  );
}

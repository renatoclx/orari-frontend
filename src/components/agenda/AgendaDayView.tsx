"use client";

import { useState } from "react";
import { DayGrid } from "@/components/agenda/DayGrid";
import { Button } from "@/components/ui/button";
import type {
  AgendaAppointment,
  AgendaProfessional,
  TimeRange,
} from "@/types/agenda";
import type { GridRange } from "@/components/agenda/agenda-range";

type AgendaDayViewProps = {
  professionals: AgendaProfessional[];
  appointments: AgendaAppointment[];
  range: GridRange;
  unavailable: TimeRange[];
  now: string | null;
};

/**
 * Grade do dia com a escolha de profissional do celular. No computador todas
 * as colunas aparecem; no celular, um profissional por vez (screens.md), e a
 * seleção fica aqui porque é só uma preferência de visualização.
 */
export function AgendaDayView({ professionals, ...grid }: AgendaDayViewProps) {
  const [selectedId, setSelectedId] = useState<string>();

  // Se o escolhido não existe mais (outro dia, outra lista), volta ao primeiro.
  const activeId = professionals.some((item) => item.id === selectedId)
    ? selectedId
    : professionals[0]?.id;

  return (
    <>
      {/* Só no celular: um botão por profissional, rolando na horizontal. */}
      <div
        role="group"
        aria-label="Profissional"
        className="-mx-4 flex shrink-0 gap-2 overflow-x-auto px-4 md:hidden"
      >
        {professionals.map((professional) => (
          <Button
            key={professional.id}
            variant={professional.id === activeId ? "default" : "outline"}
            aria-pressed={professional.id === activeId}
            onClick={() => setSelectedId(professional.id)}
          >
            {professional.name}
          </Button>
        ))}
      </div>

      <DayGrid
        professionals={professionals}
        mobileProfessionalId={activeId}
        {...grid}
      />
    </>
  );
}

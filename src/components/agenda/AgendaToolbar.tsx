import Link from "next/link";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
} from "lucide-react";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AgendaProfessional } from "@/types/agenda";
import { formatLongDate, shiftDateString } from "@/utils/time";

type AgendaToolbarProps = {
  /** Dia exibido, "aaaa-mm-dd". */
  date: string;
  dateLabel: string;
  /** Clique em "Novo Agendamento". */
  onNewAppointment?: () => void;
  /** Clique em "Encaixar horário" (agendar fora do horário de funcionamento). */
  onOverbooking?: () => void;
  /** Profissionais do filtro (só no computador; o celular tem o seu menu). */
  professionals?: AgendaProfessional[];
  /** Profissional filtrado; nulo = exibição padrão. */
  filterId?: string | null;
  onFilterChange?: (professionalId: string) => void;
  onShowAll?: () => void;
};

// O dia fica na URL (?date=): os botões são links, então a navegação funciona
// sem estado no navegador e o dia pode ser compartilhado ou recarregado.
const dayHref = (date: string) => `/?date=${date}`;

// "terça-feira, 13 de outubro": diz para onde o botão leva.
const dayName = (date: string) =>
  formatLongDate(new Date(`${date}T12:00:00Z`)).toLowerCase();

/** Navegação entre dias, filtro de profissional e as ações de agendamento. */
export function AgendaToolbar({
  date,
  dateLabel,
  onNewAppointment,
  onOverbooking,
  professionals = [],
  filterId = null,
  onFilterChange,
  onShowAll,
}: AgendaToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div className="flex items-center gap-1">
        <Hint label={`Ir para ${dayName(shiftDateString(date, -1))}`}>
          <Button variant="outline" size="icon" asChild>
            <Link
              href={dayHref(shiftDateString(date, -1))}
              aria-label="Dia anterior"
            >
              <ChevronLeft aria-hidden="true" />
            </Link>
          </Button>
        </Hint>
        <Hint label={`Ir para ${dayName(shiftDateString(date, 1))}`}>
          <Button variant="outline" size="icon" asChild>
            <Link
              href={dayHref(shiftDateString(date, 1))}
              aria-label="Próximo dia"
            >
              <ChevronRight aria-hidden="true" />
            </Link>
          </Button>
        </Hint>
        <Hint label="Voltar para a agenda de hoje">
          <Button variant="outline" asChild>
            <Link href="/">Hoje</Link>
          </Button>
        </Hint>
      </div>

      {/* No celular, a data ocupa a primeira linha e os botões descem. */}
      <h2 className="text-lg font-semibold max-sm:order-first max-sm:w-full">
        {dateLabel}
      </h2>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {/* Filtro por profissional: só no computador (no celular, a troca é no
            cabeçalho da coluna). */}
        {onFilterChange && professionals.length > 0 && (
          <div className="hidden items-center gap-2 md:flex">
            <Select value={filterId ?? ""} onValueChange={onFilterChange}>
              <SelectTrigger
                aria-label="Filtrar por profissional"
                className="w-52 bg-card"
              >
                <SelectValue placeholder="Filtrar por profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((professional) => (
                  <SelectItem key={professional.id} value={professional.id}>
                    {professional.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filterId !== null && (
              <Hint label="Voltar à exibição padrão: todos os profissionais com agendamentos">
                <Button variant="ghost" onClick={onShowAll}>
                  <RotateCcw aria-hidden="true" />
                  Mostrar Todos
                </Button>
              </Hint>
            )}
          </div>
        )}

        <Hint label="Agendar fora do horário de funcionamento (encaixe)">
          <Button variant="outline" onClick={onOverbooking}>
            <CalendarClock aria-hidden="true" />
            Encaixar horário
          </Button>
        </Hint>

        <Button onClick={onNewAppointment}>
          <Plus aria-hidden="true" />
          Novo Agendamento
        </Button>
      </div>
    </div>
  );
}

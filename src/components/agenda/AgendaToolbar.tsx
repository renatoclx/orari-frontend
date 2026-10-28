import Link from "next/link";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Plus,
  RotateCcw,
  CalendarCheck,
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

// O dia (?date=) e o filtro de profissional (?professional=) ficam na URL: os
// botões são links, então a navegação funciona sem estado no navegador, o
// filtro acompanha a troca de dia e a tela pode ser compartilhada ou recarregada.
function agendaHref(date: string | null, professionalId: string | null) {
  const params = new URLSearchParams();
  if (date) params.set("date", date);
  if (professionalId) params.set("professional", professionalId);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

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
      {/* Só a partir de sm: no celular, o calendário do cabeçalho já troca o dia. */}
      <div className="hidden items-center gap-1 sm:flex">
        <Hint label={`Ir para ${dayName(shiftDateString(date, -1))}`}>
          <Button variant="outline" size="icon" asChild>
            <Link
              href={agendaHref(shiftDateString(date, -1), filterId)}
              aria-label="Dia anterior"
            >
              <ChevronLeft aria-hidden="true" />
            </Link>
          </Button>
        </Hint>
        <Hint label={`Ir para ${dayName(shiftDateString(date, 1))}`}>
          <Button variant="outline" size="icon" asChild>
            <Link
              href={agendaHref(shiftDateString(date, 1), filterId)}
              aria-label="Próximo dia"
            >
              <ChevronRight aria-hidden="true" />
            </Link>
          </Button>
        </Hint>
        <Hint label="Voltar para a agenda de hoje">
          <Button variant="outline" asChild>
            <Link href={agendaHref(null, filterId)}>
              <CalendarCheck aria-hidden="true" />
              Hoje
            </Link>
          </Button>
        </Hint>
      </div>

      {/* No celular, a data ocupa a primeira linha e os botões descem. */}
      <h2 className="text-lg font-semibold max-sm:order-first max-sm:w-full">
        {dateLabel}
      </h2>

      {/* No celular, as ações ficam empilhadas na largura toda, a principal em cima. */}
      <div className="ml-auto flex flex-wrap items-center gap-2 max-sm:w-full max-sm:flex-col-reverse">
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

            {/* Sempre visível; sem filtro, não há o que desfazer. */}
            <Hint
              label={
                filterId === null
                  ? "Já exibindo todos os profissionais"
                  : "Voltar a exibir todos os profissionais"
              }
            >
              <span
                className="inline-flex"
                tabIndex={filterId === null ? 0 : -1}
              >
                <Button
                  variant="ghost"
                  onClick={onShowAll}
                  disabled={filterId === null}
                >
                  <RotateCcw aria-hidden="true" />
                  Mostrar Todos
                </Button>
              </span>
            </Hint>
          </div>
        )}

        <Hint label="Agendar fora do horário de funcionamento (encaixe)">
          <Button
            variant="outline"
            onClick={onOverbooking}
            className="max-sm:w-full"
          >
            <CalendarClock aria-hidden="true" />
            Encaixar horário
          </Button>
        </Hint>

        <Button onClick={onNewAppointment} className="max-sm:w-full">
          <Plus aria-hidden="true" />
          Novo Agendamento
        </Button>
      </div>
    </div>
  );
}

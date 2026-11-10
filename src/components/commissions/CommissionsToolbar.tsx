"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import {
  ALL_PROFESSIONALS,
  COMMISSIONS_PATH,
  commissionsQuery,
  type CommissionFilters,
} from "@/components/commissions/commission-filters";
import { changeDate } from "@/components/client-portfolio/portfolio-filters";
import { DatePicker } from "@/components/shared/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type CommissionsToolbarProps = {
  filters: CommissionFilters;
  /** Mês atual no fuso da empresa (o período padrão). */
  month: { from: string; to: string };
  professionals: { id: string; name: string }[];
};

/**
 * Filtros das Comissões (na URL): profissional e período. No celular fica só o
 * profissional; o período é o mês atual.
 */
export function CommissionsToolbar({
  filters,
  month,
  professionals,
}: CommissionsToolbarProps) {
  const router = useRouter();

  function change(overrides: Partial<CommissionFilters>) {
    const query = commissionsQuery(filters, month, overrides).toString();
    router.push(query ? `${COMMISSIONS_PATH}?${query}` : COMMISSIONS_PATH);
  }

  const hasFilters =
    filters.professional !== ALL_PROFESSIONALS ||
    filters.from !== "" ||
    filters.to !== "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.professional}
        onValueChange={(professional) => change({ professional })}
      >
        <SelectTrigger className="w-full sm:w-60" aria-label="Profissional">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_PROFESSIONALS}>
            Todos os profissionais
          </SelectItem>
          {professionals.map((professional) => (
            <SelectItem key={professional.id} value={professional.id}>
              {professional.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-44 max-sm:hidden">
        <DatePicker
          key={`from-${filters.from}`}
          id="commissions-from"
          name="from"
          placeholder="Período de"
          initialValue={filters.from || month.from}
          onValueChange={(value) =>
            change(changeDate(filters, month, "from", value))
          }
        />
      </div>
      <div className="w-44 max-sm:hidden">
        <DatePicker
          key={`to-${filters.to}`}
          id="commissions-to"
          name="to"
          placeholder="Período até"
          // O fim pode cair adiante: agendamentos futuros entram como "a acontecer".
          maxDate={new Date(new Date().getFullYear() + 1, 11, 31)}
          initialValue={filters.to || month.to}
          onValueChange={(value) =>
            change(changeDate(filters, month, "to", value))
          }
        />
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          className="w-auto"
          onClick={() => router.push(COMMISSIONS_PATH)}
        >
          <X aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

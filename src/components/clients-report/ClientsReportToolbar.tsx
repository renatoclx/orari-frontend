"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { changeDate } from "@/components/client-portfolio/portfolio-filters";
import {
  CLIENTS_REPORT_PATH,
  clientsReportQuery,
  type ClientsReportFilters,
} from "@/components/clients-report/clients-report-filters";
import { DatePicker } from "@/components/shared/DatePicker";
import { Button } from "@/components/ui/button";

/**
 * Filtro do Perfil do cliente (na URL): só o período. No celular a barra
 * some e vale o mês atual, como nos outros relatórios.
 */
export function ClientsReportToolbar({
  filters,
  month,
}: {
  filters: ClientsReportFilters;
  month: { from: string; to: string };
}) {
  const router = useRouter();

  function change(overrides: Partial<ClientsReportFilters>) {
    const query = clientsReportQuery(filters, month, overrides).toString();
    router.push(
      query ? `${CLIENTS_REPORT_PATH}?${query}` : CLIENTS_REPORT_PATH,
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 max-sm:hidden">
      <div className="w-44">
        <DatePicker
          key={`from-${filters.from}`}
          id="clients-from"
          name="from"
          placeholder="Período de"
          initialValue={filters.from || month.from}
          onValueChange={(value) =>
            change(changeDate(filters, month, "from", value))
          }
        />
      </div>
      <div className="w-44">
        <DatePicker
          key={`to-${filters.to}`}
          id="clients-to"
          name="to"
          placeholder="Período até"
          // O mês atual termina no futuro: o fim do mês precisa ser escolhível.
          maxDate={new Date(new Date().getFullYear() + 1, 11, 31)}
          initialValue={filters.to || month.to}
          onValueChange={(value) =>
            change(changeDate(filters, month, "to", value))
          }
        />
      </div>

      {(filters.from !== "" || filters.to !== "") && (
        <Button
          variant="ghost"
          className="w-auto"
          onClick={() => router.push(CLIENTS_REPORT_PATH)}
        >
          <X aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

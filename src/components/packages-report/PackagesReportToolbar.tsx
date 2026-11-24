"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { changeDate } from "@/components/client-portfolio/portfolio-filters";
import {
  PACKAGES_REPORT_PATH,
  packagesReportQuery,
  type PackagesReportFilters,
} from "@/components/packages-report/packages-report-filters";
import { DatePicker } from "@/components/shared/DatePicker";
import { Button } from "@/components/ui/button";

/**
 * Filtro do relatório de pacotes (na URL): só o período. No celular a barra
 * some e vale o mês atual, como nos outros relatórios.
 */
export function PackagesReportToolbar({
  filters,
  month,
}: {
  filters: PackagesReportFilters;
  month: { from: string; to: string };
}) {
  const router = useRouter();

  function change(overrides: Partial<PackagesReportFilters>) {
    const query = packagesReportQuery(filters, month, overrides).toString();
    router.push(
      query ? `${PACKAGES_REPORT_PATH}?${query}` : PACKAGES_REPORT_PATH,
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 max-sm:hidden">
      <div className="w-44">
        <DatePicker
          key={`from-${filters.from}`}
          id="packages-from"
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
          id="packages-to"
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
          onClick={() => router.push(PACKAGES_REPORT_PATH)}
        >
          <X aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

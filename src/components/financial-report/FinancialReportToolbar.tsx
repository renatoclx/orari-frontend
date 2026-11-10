"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { changeDate } from "@/components/client-portfolio/portfolio-filters";
import {
  ALL_METHODS,
  FINANCIAL_REPORT_PATH,
  financialReportQuery,
  type FinancialReportFilters,
} from "@/components/financial-report/financial-report-filters";
import { DatePicker } from "@/components/shared/DatePicker";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FinancialReportToolbarProps = {
  filters: FinancialReportFilters;
  /** Mês atual no fuso da empresa (o período padrão). */
  month: { from: string; to: string };
  methods: { id: string; name: string }[];
};

/**
 * Filtros do relatório (na URL): método de pagamento e período. No celular
 * fica só o método; o período é o mês atual.
 */
export function FinancialReportToolbar({
  filters,
  month,
  methods,
}: FinancialReportToolbarProps) {
  const router = useRouter();

  function change(overrides: Partial<FinancialReportFilters>) {
    const query = financialReportQuery(filters, month, overrides).toString();
    router.push(
      query ? `${FINANCIAL_REPORT_PATH}?${query}` : FINANCIAL_REPORT_PATH,
    );
  }

  const hasFilters =
    filters.method !== ALL_METHODS || filters.from !== "" || filters.to !== "";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.method}
        onValueChange={(method) => change({ method })}
      >
        <SelectTrigger
          className="w-full sm:w-60"
          aria-label="Método de pagamento"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_METHODS}>Todos os métodos</SelectItem>
          {methods.map((method) => (
            <SelectItem key={method.id} value={method.id}>
              {method.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-44 max-sm:hidden">
        <DatePicker
          key={`from-${filters.from}`}
          id="financial-from"
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
          id="financial-to"
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

      {hasFilters && (
        <Button
          variant="ghost"
          className="w-auto"
          onClick={() => router.push(FINANCIAL_REPORT_PATH)}
        >
          <X aria-hidden="true" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
}

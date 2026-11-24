import Link from "next/link";
import { ArrowLeft, ChevronRight, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listProfessionalClosings } from "@/services/app-pro.service";
import { formatDateOnly, formatPrice } from "@/utils/format";
import { AppPagination } from "./AppPagination";
import { requireCommissions } from "./commissions-gate";
import { pageCount } from "./professional-clients";
import { receiptNumber } from "./professional-commissions";

/**
 * Fechamentos de comissão dele (screens/app-profissional.md): do número maior
 * para o menor, com os desfeitos marcados (o número do recibo não volta).
 */
export async function ProfessionalClosings({ page }: { page: number }) {
  await requireCommissions();
  const {
    items: closings,
    total,
    limit,
  } = await listProfessionalClosings(page);

  return (
    <>
      <Link
        href="/app/comissoes"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Comissões
      </Link>
      <h1 className="text-2xl font-semibold">Fechamentos</h1>

      {closings.length > 0 ? (
        <>
          <ul className="space-y-2">
            {closings.map((closing) => (
              <li key={closing.id}>
                <Link
                  href={`/app/comissoes/fechamentos/${closing.id}`}
                  className={`flex items-center gap-3 rounded-card border border-border bg-card p-4 ${
                    closing.cancelledAt ? "opacity-60" : ""
                  }`}
                >
                  <span className="min-w-0 flex-1 space-y-1 text-sm">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">
                        Recibo nº {receiptNumber(closing.number)}
                      </span>
                      {closing.cancelledAt && (
                        <Badge variant="destructive">Desfeito</Badge>
                      )}
                    </span>
                    <span className="block text-muted-foreground">
                      Pago em {formatDateOnly(closing.paidAt)} ·{" "}
                      {closing.paymentMethod.name}
                    </span>
                    <span className="block font-semibold">
                      {formatPrice(closing.paidAmount)}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-5 shrink-0 text-muted-foreground"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
          <AppPagination
            page={page}
            pages={pageCount(total, limit)}
            href={(target) =>
              target > 1
                ? `/app/comissoes/fechamentos?pagina=${target}`
                : "/app/comissoes/fechamentos"
            }
          />
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <FileText
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-semibold">Nenhum fechamento ainda</p>
          <p className="text-sm text-muted-foreground">
            Quando a clínica fechar a sua comissão, o recibo aparece aqui.
          </p>
        </div>
      )}
    </>
  );
}

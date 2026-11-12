import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProfessionalClosingReceipt } from "@/types/professional-app";
import { formatDateOnly, formatDocument, formatPrice } from "@/utils/format";
import { ReceiptAppointments } from "./ReceiptAppointments";
import { requireCommissions } from "./commissions-gate";
import { dateOf } from "./professional-clients";
import { receiptNumber } from "./professional-commissions";

const ROW = "flex items-start justify-between gap-3";

/**
 * Recibo de um fechamento (screens/app-profissional.md): o mesmo documento que a
 * clínica imprime, com o detalhamento completo (atendimentos e adiantamentos).
 * Só consulta.
 */
export async function ProfessionalClosingReceiptView({
  receipt,
}: {
  receipt: ProfessionalClosingReceipt;
}) {
  const { company: me } = await requireCommissions();
  const { company, professional, details } = receipt;

  return (
    <>
      <Link
        href="/app/comissoes/fechamentos"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Fechamentos
      </Link>

      <header className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-semibold">
            Recibo nº {receiptNumber(receipt.number)}
          </h1>
          {receipt.cancelledAt && <Badge variant="destructive">Desfeito</Badge>}
        </div>
        {receipt.cancelledAt && (
          <p className="text-sm text-destructive">
            Este fechamento foi desfeito em{" "}
            {dateOf(receipt.cancelledAt, me.timezone)}. Os valores voltaram ao
            em aberto.
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          {company.name} · {formatDocument(company.document)}
        </p>
        <p className="text-sm text-muted-foreground">
          {professional.name}
          {professional.document &&
            ` · ${formatDocument(professional.document)}`}
        </p>
      </header>

      <section className="space-y-2 rounded-card border border-border bg-card p-4 text-sm">
        <p className={ROW}>
          <span className="text-muted-foreground">Atendimentos até</span>
          <span>{formatDateOnly(receipt.cutoffDate)}</span>
        </p>
        <p className={ROW}>
          <span className="text-muted-foreground">Pago em</span>
          <span>
            {formatDateOnly(receipt.paidAt)} · {receipt.paymentMethod.name}
          </span>
        </p>
        <p className={ROW}>
          <span className="text-muted-foreground">Comissões</span>
          <span>{formatPrice(receipt.commissionTotal)}</span>
        </p>
        <p className={ROW}>
          <span className="text-muted-foreground">Adiantamentos</span>
          <span>− {formatPrice(receipt.advanceTotal)}</span>
        </p>
        <p className={`${ROW} border-t border-border pt-2 font-semibold`}>
          <span>Valor pago</span>
          <span>{formatPrice(receipt.paidAmount)}</span>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">
          Atendimentos ({receipt.appointmentsCount})
        </h2>
        <ReceiptAppointments
          items={details.commissions}
          timeZone={me.timezone}
        />
      </section>

      {details.advances.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Adiantamentos</h2>
          <ul className="space-y-2">
            {details.advances.map((item, index) => (
              <li
                key={`${item.date}-${index}`}
                className="space-y-1 rounded-card border border-border bg-card p-4 text-sm"
              >
                <p className={ROW}>
                  <span>{formatDateOnly(item.date)}</span>
                  <span className="font-semibold">
                    {formatPrice(item.amount)}
                  </span>
                </p>
                {item.note && (
                  <p className="text-muted-foreground">{item.note}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

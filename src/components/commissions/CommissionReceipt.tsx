import { receiptNumber } from "@/components/commissions/commission-filters";
import { AutoPrint } from "@/components/shared/AutoPrint";
import { PrintTable } from "@/components/shared/PrintTable";
import type { ClosingReceipt } from "@/types/commission";
import { formatDateOnly, formatDocument, formatPrice } from "@/utils/format";
import { moneyInWords } from "@/utils/money-in-words";
import { toDateString } from "@/utils/time";

const day = (date: string) => formatDateOnly(`${date}T00:00:00Z`);

/**
 * Recibo de pagamento de comissão (screens/comissoes.md), em A4, para o
 * profissional assinar. Sai da cópia gravada no fechamento; o desfeito sai
 * marcado como cancelado.
 */
export function CommissionReceipt({
  receipt,
  timeZone,
}: {
  receipt: ClosingReceipt;
  /** Fuso da empresa: a data de cada atendimento é o dia dela. */
  timeZone: string;
}) {
  const number = receiptNumber(receipt.number);
  const cancelled = receipt.cancelledAt !== null;
  const { commissions, advances } = receipt.details;

  return (
    <article className="space-y-5 text-sm">
      {/* Recibo cancelado não abre a impressão sozinho. */}
      {!cancelled && <AutoPrint />}

      <header className="border-b border-border pb-3">
        <p className="text-base font-semibold">{receipt.company.name}</p>
        {receipt.company.corporateReason !== receipt.company.name && (
          <p className="text-muted-foreground">
            {receipt.company.corporateReason}
          </p>
        )}
        <p className="text-muted-foreground">
          {receipt.company.document.length === 11 ? "CPF" : "CNPJ"}{" "}
          {formatDocument(receipt.company.document)}
        </p>
      </header>

      <div className="space-y-1 text-center">
        <h1 className="text-lg font-bold tracking-wide uppercase">
          Recibo de pagamento de comissão
        </h1>
        <p className="text-muted-foreground">Nº {number}</p>
        {cancelled && (
          <p
            role="status"
            className="mx-auto w-fit rounded-control border-2 border-destructive px-3 py-1 font-bold text-destructive uppercase dark:text-red-400"
          >
            Cancelado
            {receipt.cancelledBy && ` por ${receipt.cancelledBy.name}`}
          </p>
        )}
      </div>

      <p className="leading-relaxed">
        Recebi de <strong>{receipt.company.corporateReason}</strong> a quantia
        de <strong>{formatPrice(receipt.paidAmount)}</strong> (
        {moneyInWords(receipt.paidAmount)}), referente às comissões dos
        atendimentos realizados até {day(receipt.cutoffDate)}, já descontados os
        adiantamentos, paga em {day(receipt.paidAt)} por{" "}
        {receipt.paymentMethod.name}.
      </p>

      <dl className="space-y-1 tabular-nums">
        <div className="flex justify-between gap-4">
          <dt>
            Comissões ({receipt.appointmentsCount}{" "}
            {receipt.appointmentsCount === 1 ? "atendimento" : "atendimentos"})
          </dt>
          <dd>{formatPrice(receipt.commissionTotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Adiantamentos</dt>
          <dd>− {formatPrice(receipt.advanceTotal)}</dd>
        </div>
        {advances.map((advance, index) => (
          <div
            key={index}
            className="flex justify-between gap-4 pl-4 text-muted-foreground"
          >
            <dt>
              {day(advance.date)}
              {advance.note ? ` · ${advance.note}` : ""}
            </dt>
            <dd>{formatPrice(advance.amount)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-4 border-t border-border pt-1 font-semibold">
          <dt>Valor pago</dt>
          <dd>{formatPrice(receipt.paidAmount)}</dd>
        </div>
      </dl>

      {commissions.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">Detalhamento dos atendimentos</h2>
          <PrintTable
            columns={["Data", "Cliente", "Serviço", "Base", "Comissão"]}
            emptyMessage=""
            rows={commissions.map((item) => [
              day(toDateString(new Date(item.startAt), timeZone)),
              item.client,
              item.service,
              formatPrice(item.base),
              formatPrice(item.amount),
            ])}
          />
        </section>
      )}

      {/* Assinatura: não quebra entre folhas. */}
      <section className="space-y-10 pt-6 print:break-inside-avoid">
        <p>
          ________________________________, ____ de ______________ de ______
          <span className="block text-xs text-muted-foreground">
            (local e data)
          </span>
        </p>
        <div className="mx-auto w-80 text-center">
          <div className="border-t border-foreground pt-1">
            {receipt.professional.name}
          </div>
          {receipt.professional.document && (
            <div className="text-muted-foreground">
              CPF {formatDocument(receipt.professional.document)}
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-border pt-2 text-xs text-muted-foreground">
        Recibo nº {number} · emitido em{" "}
        {formatDateOnly(
          `${toDateString(new Date(receipt.createdAt), timeZone)}T00:00:00Z`,
        )}{" "}
        por {receipt.createdBy.name}
      </footer>
    </article>
  );
}

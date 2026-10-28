"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Eye, HandCoins, Package, X } from "lucide-react";
import { toast } from "sonner";
import { getAppointmentDetailsAction } from "@/app/(admin)/appointment-actions";
import { AppointmentDetailsDialog } from "@/components/agenda/AppointmentDetailsDialog";
import { useAgendaClock } from "@/components/agenda/useAgendaClock";
import { ClientPlanDialog } from "@/components/client-plans/ClientPlanDialog";
import { PaymentBadge } from "@/components/client-plans/ClientPlanParts";
import { PaymentDescription } from "@/components/payments/PaymentDescription";
import { SettlePaymentsDialog } from "@/components/payments/SettlePaymentsDialog";
import { RecurrenceSessionsDialog } from "@/components/recurrences/RecurrenceSessionsDialog";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import type { AgendaAppointment } from "@/types/agenda";
import type { PaymentItem } from "@/types/payment";
import type { PaymentMethodItem } from "@/types/payment-method";
import { formatDateOnly, formatPrice } from "@/utils/format";
import { toDateString } from "@/utils/time";

type PaymentListProps = {
  payments: PaymentItem[];
  /** Métodos ativos, para a baixa. */
  methods: PaymentMethodItem[];
  /** Há filtro além do padrão: muda a mensagem de lista vazia. */
  filtered: boolean;
  timeZone: string;
  serverNow: number;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

// Só o pendente (inclusive o atrasado) recebe baixa.
const canSettle = (payment: PaymentItem) => payment.status === "PENDING";

/** Listagem de pagamentos com baixa única e em lote (screens/financeiro.md). */
export function PaymentList({
  payments,
  methods,
  filtered,
  timeZone,
  serverNow,
  footer,
}: PaymentListProps) {
  const { today, nowTime } = useAgendaClock(timeZone, serverNow);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  // Pagamentos da baixa: ficam guardados ao fechar, para o dialog não mudar
  // de conteúdo durante a animação de saída.
  const [settling, setSettling] = useState<PaymentItem[]>([]);
  const [settleOpen, setSettleOpen] = useState(false);
  const [viewing, setViewing] = useState<{
    appointment: AgendaAppointment;
    date: string;
  } | null>(null);
  const [sessionsOf, setSessionsOf] = useState<string | null>(null);
  const [clientPlanOf, setClientPlanOf] = useState<string | null>(null);
  const [loadingDetails, startDetails] = useTransition();

  // A seleção só vale para o que está na página: ids de outra página ou já
  // baixados somem sozinhos.
  const chosen = payments.filter(
    (payment) => selected.has(payment.id) && canSettle(payment),
  );
  const chosenClient = chosen[0]?.client.id;
  const chosenTotal =
    chosen.reduce(
      (total, payment) => total + Math.round(Number(payment.amount) * 100),
      0,
    ) / 100;

  function toggle(payment: PaymentItem, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(payment.id);
      else next.delete(payment.id);
      return next;
    });
  }

  function settle(items: PaymentItem[]) {
    setSettling(items);
    setSettleOpen(true);
  }

  function viewAppointment(appointmentId: string) {
    startDetails(async () => {
      const result = await getAppointmentDetailsAction(appointmentId);
      if (result.ok) {
        setViewing({ appointment: result.appointment, date: result.date });
      } else {
        toast.error("Não foi possível abrir o atendimento.", {
          description: result.message,
        });
      }
    });
  }

  // Marcar só é possível dentro de um cliente (a API exige o mesmo cliente).
  function checkbox(payment: PaymentItem) {
    if (!canSettle(payment)) return null;
    const otherClient =
      chosenClient !== undefined && chosenClient !== payment.client.id;
    const input = (
      <input
        type="checkbox"
        className="size-4 accent-primary disabled:opacity-40"
        aria-label={`Selecionar o pagamento de ${payment.client.name}`}
        checked={selected.has(payment.id)}
        disabled={otherClient}
        onChange={(event) => toggle(payment, event.target.checked)}
      />
    );
    return otherClient ? (
      <Hint label="A baixa em lote é de um cliente por vez">
        <span className="inline-flex">{input}</span>
      </Hint>
    ) : (
      input
    );
  }

  function actions(payment: PaymentItem) {
    return (
      <div className="flex shrink-0 items-center gap-1">
        {canSettle(payment) && (
          <Button size="sm" onClick={() => settle([payment])}>
            <HandCoins aria-hidden="true" />
            Dar baixa
          </Button>
        )}
        {payment.appointment && (
          <Hint label="Visualizar atendimento">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Visualizar atendimento"
              disabled={loadingDetails}
              onClick={() => viewAppointment(payment.appointment!.id)}
            >
              <Eye aria-hidden="true" />
            </Button>
          </Hint>
        )}
        {payment.clientPlan && (
          <Hint label="Ver contratação">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Ver contratação"
              onClick={() => setClientPlanOf(payment.clientPlan!.id)}
            >
              <Package aria-hidden="true" />
            </Button>
          </Hint>
        )}
      </div>
    );
  }

  // "12/10/2026 · Pix" (a data no fuso da empresa).
  function paidLabel(payment: PaymentItem) {
    if (!payment.paidAt) return null;
    const date = toDateString(new Date(payment.paidAt), timeZone);
    return `${formatDateOnly(`${date}T00:00:00Z`)} · ${payment.paymentMethod?.name ?? "--"}`;
  }

  const dueLabel = (payment: PaymentItem) =>
    payment.dueDate && formatDateOnly(`${payment.dueDate}T00:00:00Z`);

  const headerClass =
    "sticky top-0 z-10 border-b border-border bg-card px-4 py-3 font-medium whitespace-nowrap text-muted-foreground";

  return (
    <div className="flex min-h-[24rem] flex-1 flex-col rounded-card border border-border bg-card md:min-h-0">
      {chosen.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted px-4 py-2 text-sm">
          <span className="tabular-nums">
            {chosen.length}{" "}
            {chosen.length === 1 ? "selecionado" : "selecionados"} ·{" "}
            <strong>{formatPrice(chosenTotal)}</strong>
          </span>
          <Button size="sm" onClick={() => settle(chosen)}>
            <HandCoins aria-hidden="true" />
            Dar baixa em lote
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setSelected(new Set())}
          >
            <X aria-hidden="true" />
            Limpar seleção
          </Button>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-auto">
        {payments.length === 0 ? (
          <p className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
            {filtered
              ? "Nenhum pagamento encontrado para os filtros escolhidos."
              : "Nenhum pagamento pendente."}
          </p>
        ) : (
          <>
            {/* Celular: lista empilhada. A partir do md, tabela. */}
            <ul className="divide-y divide-border md:hidden">
              {payments.map((payment) => (
                <li key={payment.id} className="flex gap-3 p-4">
                  <div className="pt-0.5">{checkbox(payment)}</div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <Link
                      href={`/clientes/${payment.client.id}`}
                      className="font-medium hover:underline"
                    >
                      {payment.client.name}
                    </Link>
                    <p className="text-sm">
                      <PaymentDescription
                        payment={payment}
                        timeZone={timeZone}
                      />
                    </p>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {formatPrice(payment.amount)} · Vence em{" "}
                      <EmptyValue>{dueLabel(payment)}</EmptyValue>
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <PaymentBadge payment={payment} feminine={false} />
                      {paidLabel(payment) && (
                        <span className="text-sm text-muted-foreground">
                          {paidLabel(payment)}
                        </span>
                      )}
                    </div>
                    {actions(payment)}
                  </div>
                </li>
              ))}
            </ul>

            <table className="hidden w-full text-left text-sm md:table">
              <thead>
                <tr>
                  <th scope="col" className={`${headerClass} w-10`}>
                    <span className="sr-only">Selecionar</span>
                  </th>
                  {[
                    "Vencimento",
                    "Cliente",
                    "Descrição",
                    "Valor",
                    "Status",
                    "Pago em",
                    "Ações",
                  ].map((title) => (
                    <th key={title} scope="col" className={headerClass}>
                      {title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="tabular-nums hover:bg-background"
                  >
                    <td className="px-4 py-3">{checkbox(payment)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <EmptyValue>{dueLabel(payment)}</EmptyValue>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/clientes/${payment.client.id}`}
                        className="font-medium hover:underline"
                      >
                        {payment.client.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <PaymentDescription
                        payment={payment}
                        timeZone={timeZone}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatPrice(payment.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge payment={payment} feminine={false} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <EmptyValue>{paidLabel(payment)}</EmptyValue>
                    </td>
                    <td className="px-4 py-2">{actions(payment)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {footer}

      <SettlePaymentsDialog
        open={settleOpen}
        onOpenChange={setSettleOpen}
        payments={settling}
        methods={methods}
        timeZone={timeZone}
        today={today}
        onSettled={() => setSelected(new Set())}
      />

      {/* Só consulta: cancelar, alterar e remanejar são da agenda. */}
      <AppointmentDetailsDialog
        appointment={viewing?.appointment ?? null}
        canCancel={() => false}
        canMarkNoShow={() => false}
        onEdit={() => {}}
        onReschedule={() => {}}
        onViewSessions={(recurrenceId) => {
          setViewing(null);
          setSessionsOf(recurrenceId);
        }}
        onViewClientPlan={(clientPlanId) => {
          setViewing(null);
          setClientPlanOf(clientPlanId);
        }}
        onOpenChange={(open) => !open && setViewing(null)}
      />

      <RecurrenceSessionsDialog
        recurrenceId={sessionsOf}
        timeZone={timeZone}
        today={today}
        nowTime={nowTime}
        onOpenChange={(open) => !open && setSessionsOf(null)}
      />

      <ClientPlanDialog
        clientPlanId={clientPlanOf}
        today={today}
        onViewSessions={(recurrenceId) => {
          setClientPlanOf(null);
          setSessionsOf(recurrenceId);
        }}
        onOpenChange={(open) => !open && setClientPlanOf(null)}
      />
    </div>
  );
}

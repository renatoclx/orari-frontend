"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Ban,
  Check,
  Package,
  Plus,
  Repeat,
  ShoppingBag,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { settlePaymentsAction } from "@/app/(admin)/payment-actions";
import { cancelProductSaleAction } from "@/app/(admin)/product-sale-actions";
import { PaymentBadge } from "@/components/client-plans/ClientPlanParts";
import { PaymentDescription } from "@/components/payments/PaymentDescription";
import { SettleFields } from "@/components/payments/SettleFields";
import { ProductSaleDialog } from "@/components/product-sales/ProductSaleDialog";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Hint } from "@/components/shared/Hint";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  CheckoutAppointment,
  CheckoutItem,
  CheckoutProductSale,
} from "@/types/payment";
import type { PaymentMethodItem } from "@/types/payment-method";
import { checkoutState, receivableAhead } from "@/utils/checkout";
import { formatDateOnly, formatPrice } from "@/utils/format";
import { saleDescription } from "@/utils/sale";
import { toDateString, toTimeString } from "@/utils/time";

type CheckoutDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Comanda aberta; some da lista quando a página recarrega, então o conteúdo some junto. */
  checkout?: CheckoutItem;
  /** Métodos ativos. */
  methods: PaymentMethodItem[];
  timeZone: string;
  /** Hoje no fuso da empresa, "aaaa-mm-dd". */
  today: string;
  /** Pode lançar venda de produtos (ADMIN com "Venda de produtos" › Cria). */
  canSell: boolean;
  /** Pode cancelar a venda pendente (ADMIN com "Venda de produtos" › Exclui). */
  canCancelSale: boolean;
};

// Soma em centavos: somar decimais direto acumula erro de ponto flutuante.
const cents = (amount: string) => Math.round(Number(amount) * 100);

/** Comanda do cliente: receber (aberta) ou consultar (paga). screens/financeiro.md, Etapa 2. */
export function CheckoutDialog({
  open,
  onOpenChange,
  checkout,
  ...rest
}: CheckoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        {/* O conteúdo só existe com a comanda: marcações e método começam do zero. */}
        {/* key com as vendas: uma venda nova remonta a comanda já marcada. */}
        {checkout && (
          <CheckoutForm
            key={`${checkout.client.id}:${checkout.productSales.map((sale) => sale.id).join()}`}
            checkout={checkout}
            onDone={() => onOpenChange(false)}
            {...rest}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-1">
      <h3 className="text-sm font-medium">{title}</h3>
      <ul className="divide-y divide-border rounded-control border border-border">
        {children}
      </ul>
    </section>
  );
}

// Estado do atendimento de hoje na comanda: o que dá para receber ou por que não.
function VisitState({ appointment }: { appointment: CheckoutAppointment }) {
  const { payment } = appointment;
  if (payment?.status === "PAID") {
    return (
      <span className="inline-flex items-center gap-2">
        <PaymentBadge payment={payment} feminine={false} />
        <span className="text-xs text-muted-foreground">
          {payment.paymentMethod?.name}
        </span>
      </span>
    );
  }
  if (!payment) {
    return (
      <Badge variant="secondary">
        {appointment.clientPlanId
          ? "Incluído no pacote"
          : "Aguardando conclusão"}
      </Badge>
    );
  }
  return null;
}

// Situação da venda na comanda: a paga mostra o selo e o método.
function SaleState({ sale }: { sale: CheckoutProductSale }) {
  if (sale.payment?.status !== "PAID") return null;
  return (
    <span className="inline-flex items-center gap-2">
      <PaymentBadge payment={sale.payment} feminine />
      <span className="text-xs text-muted-foreground">
        {sale.payment.paymentMethod?.name}
      </span>
    </span>
  );
}

function CheckoutForm({
  checkout,
  methods,
  timeZone,
  today,
  canSell,
  canCancelSale,
  onDone,
}: Omit<CheckoutDialogProps, "open" | "onOpenChange" | "checkout"> & {
  checkout: CheckoutItem;
  onDone: () => void;
}) {
  const previousPending = checkout.previousPayments.filter(
    (payment) => payment.status === "PENDING",
  );
  const previousPaid = checkout.previousPayments.filter(
    (payment) => payment.status === "PAID",
  );
  const visitPending = checkout.appointments.flatMap((appointment) =>
    appointment.payment?.status === "PENDING" ? [appointment.payment] : [],
  );
  const salePending = checkout.productSales.flatMap((sale) =>
    sale.payment?.status === "PENDING" ? [sale.payment] : [],
  );
  // Avulsos ainda não concluídos que já podem ser recebidos (preço do serviço).
  const ahead = checkout.appointments.filter(receivableAhead);
  // Comanda paga: nada a receber, o dialog é só consulta.
  const readOnly =
    visitPending.length +
      salePending.length +
      previousPending.length +
      ahead.length ===
    0;

  // Os de hoje (visita e vendas) começam marcados; as pendências anteriores e
  // o receber antes da conclusão, não (o atendente decide).
  const [selected, setSelected] = useState<Set<string>>(
    () =>
      new Set([...visitPending, ...salePending].map((payment) => payment.id)),
  );
  const [saleOpen, setSaleOpen] = useState(false);
  const [cancelling, setCancelling] = useState<CheckoutProductSale | null>(
    null,
  );
  const [cancelPending, startCancel] = useTransition();
  const [methodId, setMethodId] = useState("");
  const [paidDate, setPaidDate] = useState(today);
  const [errors, setErrors] = useState<{ method?: string; paidAt?: string }>(
    {},
  );
  const [pending, startTransition] = useTransition();

  const chosen = [...visitPending, ...salePending, ...previousPending].filter(
    (payment) => selected.has(payment.id),
  );
  const chosenAhead = ahead.filter((appointment) =>
    selected.has(appointment.id),
  );
  const total =
    (chosen.reduce((sum, payment) => sum + cents(payment.amount), 0) +
      chosenAhead.reduce(
        (sum, appointment) => sum + cents(appointment.service.price!),
        0,
      )) /
    100;

  function confirmCancel() {
    if (!cancelling) return;
    const target = cancelling;
    startCancel(async () => {
      const result = await cancelProductSaleAction(target.id);
      if (result.ok) {
        toast.success("Venda cancelada.", {
          description: "Os produtos voltaram ao estoque.",
        });
        setCancelling(null);
      } else {
        toast.error("Não foi possível cancelar a venda.", {
          description: result.message,
        });
      }
    });
  }

  function toggle(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!methodId) {
      setErrors({ method: "Escolha o método de pagamento." });
      return;
    }

    startTransition(async () => {
      const result = await settlePaymentsAction({
        paymentIds: chosen.map((payment) => payment.id),
        appointmentIds: chosenAhead.map((appointment) => appointment.id),
        paymentMethodId: methodId,
        paidDate: paidDate || undefined,
      });
      if (result.ok) {
        toast.success("Comanda recebida.", {
          description: `${checkout.client.name} · ${formatPrice(total)}`,
        });
        onDone();
        return;
      }
      if (result.field === "paidAt") setErrors({ paidAt: result.message });
      toast.error("Não foi possível receber a comanda.", {
        description: result.message,
      });
    });
  }

  const checkbox = (id: string, label: string) => (
    <input
      type="checkbox"
      className="size-4 shrink-0 accent-primary"
      aria-label={label}
      checked={selected.has(id)}
      onChange={(event) => toggle(id, event.target.checked)}
    />
  );

  // Sem espaço (celular), o selo e o valor descem para a linha de baixo.
  const row = "flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm";

  return (
    <>
      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <DialogHeader>
          <DialogTitle>Comanda de {checkout.client.name}</DialogTitle>
          <DialogDescription>
            {formatDateOnly(`${today}T00:00:00Z`)} ·{" "}
            <Link
              href={`/clientes/${checkout.client.id}`}
              className="underline-offset-2 hover:underline"
            >
              ver histórico do cliente
            </Link>
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[50vh] space-y-4 overflow-auto">
          {checkout.appointments.length > 0 && (
            <Section title="Atendimentos de hoje">
              {checkout.appointments.map((appointment) => {
                const { payment } = appointment;
                const Icon = appointment.clientPlanId
                  ? Package
                  : appointment.recurringAppointmentId
                    ? Repeat
                    : null;
                const when = `${appointment.service.name} às ${toTimeString(appointment.startAt, timeZone)}`;
                const canAhead = receivableAhead(appointment);
                // Avulso sem preço: o valor só nasce na conclusão (lançado depois).
                const noPrice =
                  !payment &&
                  !appointment.clientPlanId &&
                  appointment.service.price === null;
                return (
                  <li key={appointment.id} className={row}>
                    {payment?.status === "PENDING" && !readOnly ? (
                      checkbox(payment.id, `Receber ${when}`)
                    ) : canAhead && !readOnly ? (
                      checkbox(
                        appointment.id,
                        `Receber antes da conclusão ${when}`,
                      )
                    ) : (
                      <span
                        className="size-4 shrink-0 max-sm:hidden"
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-40 flex-1">
                      <span className="inline-flex items-center gap-1.5">
                        {Icon && (
                          <Icon
                            className="size-4 text-muted-foreground"
                            aria-hidden="true"
                          />
                        )}
                        {appointment.service.name} ·{" "}
                        {toTimeString(appointment.startAt, timeZone)}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        com {appointment.professional.name}
                        {noPrice && " · sem preço: receba após a conclusão"}
                      </span>
                    </span>
                    <VisitState appointment={appointment} />
                    {payment ? (
                      <span className="tabular-nums">
                        {formatPrice(payment.amount)}
                      </span>
                    ) : (
                      canAhead && (
                        <span className="tabular-nums">
                          {formatPrice(appointment.service.price!)}
                        </span>
                      )
                    )}
                  </li>
                );
              })}
            </Section>
          )}

          {checkout.productSales.length > 0 && (
            <Section title="Produtos">
              {checkout.productSales.map((sale) => {
                const { payment } = sale;
                const description = saleDescription(sale.items);
                return (
                  <li key={sale.id} className={row}>
                    {payment?.status === "PENDING" && !readOnly ? (
                      checkbox(payment.id, `Receber a venda ${description}`)
                    ) : (
                      <span
                        className="size-4 shrink-0 max-sm:hidden"
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-40 flex-1">
                      <span className="inline-flex items-center gap-1.5">
                        <ShoppingBag
                          className="size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                        {description}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        Venda às {toTimeString(sale.createdAt, timeZone)}
                      </span>
                    </span>
                    <SaleState sale={sale} />
                    {payment && (
                      <span className="tabular-nums">
                        {formatPrice(payment.amount)}
                      </span>
                    )}
                    {canCancelSale && payment?.status === "PENDING" && (
                      <Hint label={`Cancelar a venda ${description}`}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Cancelar a venda ${description}`}
                          onClick={() => setCancelling(sale)}
                        >
                          <Ban aria-hidden="true" />
                        </Button>
                      </Hint>
                    )}
                  </li>
                );
              })}
            </Section>
          )}

          {/* Comanda paga está fechada: o que vier depois é uma Nova venda. */}
          {canSell && checkoutState(checkout) !== "paid" && (
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setSaleOpen(true)}
            >
              <Plus aria-hidden="true" />
              Adicionar produto
            </Button>
          )}

          {previousPending.length > 0 && (
            <Section title="Pendências anteriores">
              {previousPending.map((payment) => (
                <li key={payment.id} className={row}>
                  {readOnly
                    ? null
                    : checkbox(payment.id, "Receber a pendência anterior")}
                  <span className="min-w-40 flex-1">
                    <PaymentDescription payment={payment} timeZone={timeZone} />
                    <span className="block text-xs text-muted-foreground">
                      Vence em{" "}
                      {payment.dueDate
                        ? formatDateOnly(`${payment.dueDate}T00:00:00Z`)
                        : "--"}
                    </span>
                  </span>
                  {payment.isOverdue && (
                    <PaymentBadge payment={payment} feminine={false} />
                  )}
                  <span className="tabular-nums">
                    {formatPrice(payment.amount)}
                  </span>
                </li>
              ))}
            </Section>
          )}

          {previousPaid.length > 0 && (
            <Section title="Pagos hoje">
              {previousPaid.map((payment) => (
                <li key={payment.id} className={row}>
                  <span className="size-4 shrink-0" aria-hidden="true" />
                  <span className="min-w-40 flex-1">
                    <PaymentDescription payment={payment} timeZone={timeZone} />
                    <span className="block text-xs text-muted-foreground">
                      {payment.paidAt &&
                        formatDateOnly(
                          `${toDateString(new Date(payment.paidAt), timeZone)}T00:00:00Z`,
                        )}
                      {payment.paymentMethod &&
                        ` · ${payment.paymentMethod.name}`}
                    </span>
                  </span>
                  <PaymentBadge payment={payment} feminine={false} />
                  <span className="tabular-nums">
                    {formatPrice(payment.amount)}
                  </span>
                </li>
              ))}
            </Section>
          )}
        </div>

        {readOnly ? (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onDone}>
              <X aria-hidden="true" />
              Fechar
            </Button>
          </DialogFooter>
        ) : (
          <>
            <div className="flex items-center justify-between text-base font-semibold tabular-nums">
              <span>Total a receber</span>
              <span>{formatPrice(total)}</span>
            </div>

            <SettleFields
              idPrefix="checkout"
              methods={methods}
              methodId={methodId}
              onMethodChange={(value) => {
                setMethodId(value);
                setErrors({});
              }}
              methodError={errors.method}
              today={today}
              onDateChange={(value) => {
                setPaidDate(value);
                setErrors({});
              }}
              dateError={errors.paidAt}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={onDone}
              >
                <X aria-hidden="true" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  pending ||
                  chosen.length + chosenAhead.length === 0 ||
                  methods.length === 0
                }
              >
                <Check aria-hidden="true" />
                {pending ? "Finalizando…" : "Finalizar comanda"}
              </Button>
            </DialogFooter>
          </>
        )}
      </form>

      {/* Fora do <form>: o envio de um dialog filho subiria (pela árvore do
          React) até a comanda e dispararia a baixa. */}
      {canSell && (
        <ProductSaleDialog
          open={saleOpen}
          onOpenChange={setSaleOpen}
          client={checkout.client}
        />
      )}
      <ConfirmDialog
        open={cancelling !== null}
        onOpenChange={(open) => !open && setCancelling(null)}
        title="Cancelar a venda?"
        description={`${cancelling ? saleDescription(cancelling.items) : ""}: o pagamento fica cancelado e os produtos voltam ao estoque.`}
        confirmLabel="Cancelar venda"
        pendingLabel="Cancelando…"
        icon={Ban}
        destructive
        pending={cancelPending}
        onConfirm={confirmCancel}
      />
    </>
  );
}

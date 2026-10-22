"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Check, Package, Repeat, X } from "lucide-react";
import { toast } from "sonner";
import { settlePaymentsAction } from "@/app/(admin)/payment-actions";
import { PaymentBadge } from "@/components/client-plans/ClientPlanParts";
import { PaymentDescription } from "@/components/payments/PaymentDescription";
import { SettleFields } from "@/components/payments/SettleFields";
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
import type { CheckoutAppointment, CheckoutItem } from "@/types/payment";
import type { PaymentMethodItem } from "@/types/payment-method";
import { formatDateOnly, formatPrice } from "@/utils/format";
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
        {checkout && (
          <CheckoutForm
            key={checkout.client.id}
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

function CheckoutForm({
  checkout,
  methods,
  timeZone,
  today,
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
  // Comanda paga: nada a receber, o dialog é só consulta.
  const readOnly = visitPending.length + previousPending.length === 0;

  // Os da visita começam marcados; as pendências anteriores, não (o atendente decide).
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(visitPending.map((payment) => payment.id)),
  );
  const [methodId, setMethodId] = useState("");
  const [paidDate, setPaidDate] = useState(today);
  const [errors, setErrors] = useState<{ method?: string; paidAt?: string }>(
    {},
  );
  const [pending, startTransition] = useTransition();

  const chosen = [...visitPending, ...previousPending].filter((payment) =>
    selected.has(payment.id),
  );
  const total =
    chosen.reduce((sum, payment) => sum + cents(payment.amount), 0) / 100;

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
        <Section title="Atendimentos de hoje">
          {checkout.appointments.map((appointment) => {
            const { payment } = appointment;
            const Icon = appointment.clientPlanId
              ? Package
              : appointment.recurringAppointmentId
                ? Repeat
                : null;
            return (
              <li key={appointment.id} className={row}>
                {payment?.status === "PENDING" && !readOnly ? (
                  checkbox(
                    payment.id,
                    `Receber ${appointment.service.name} às ${toTimeString(appointment.startAt, timeZone)}`,
                  )
                ) : (
                  <span className="size-4 shrink-0" aria-hidden="true" />
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
                  </span>
                </span>
                <VisitState appointment={appointment} />
                {payment && (
                  <span className="tabular-nums">
                    {formatPrice(payment.amount)}
                  </span>
                )}
              </li>
            );
          })}
        </Section>

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
              disabled={pending || chosen.length === 0 || methods.length === 0}
            >
              <Check aria-hidden="true" />
              {pending ? "Finalizando…" : "Finalizar comanda"}
            </Button>
          </DialogFooter>
        </>
      )}
    </form>
  );
}

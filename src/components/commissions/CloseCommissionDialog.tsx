"use client";

import { CheckCircle2, Printer, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  closingPreviewAction,
  createClosingAction,
  type ClosingField,
} from "@/app/(admin)/commission-actions";
import {
  receiptHref,
  receiptNumber,
} from "@/components/commissions/commission-filters";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClosingPreview } from "@/types/commission";
import { formatPrice } from "@/utils/format";

type CloseCommissionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional: { id: string; name: string };
  /** Métodos de pagamento ativos da empresa. */
  methods: { id: string; name: string }[];
  /** Hoje no fuso da empresa ("aaaa-mm-dd"): padrão e limite das datas. */
  today: string;
};

const FIELD_IDS: Record<ClosingField, string> = {
  until: "closing-until",
  paymentMethodId: "closing-method",
  paidAt: "closing-paid-at",
};

/** Fechar a comissão do profissional (screens/comissoes.md). */
export function CloseCommissionDialog({
  open,
  onOpenChange,
  ...props
}: CloseCommissionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Só existe aberto: começa limpo a cada abertura. */}
        <CloseCommissionForm {...props} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function CloseCommissionForm({
  professional,
  methods,
  today,
  onClose,
}: Omit<CloseCommissionDialogProps, "open" | "onOpenChange"> & {
  onClose: () => void;
}) {
  const [until, setUntil] = useState(today);
  const [methodId, setMethodId] = useState("");
  // Última prévia e de qual data ela é (enquanto não for da escolhida, busca).
  const [fetched, setFetched] = useState<{
    until: string;
    preview: ClosingPreview | null;
  } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<ClosingField, string>>>(
    {},
  );
  const [done, setDone] = useState<{ id: string; number: number } | null>(null);
  const [pending, startTransition] = useTransition();
  const loading = fetched?.until !== until;
  const preview = loading ? null : (fetched?.preview ?? null);
  const nothing =
    preview !== null &&
    preview.commissions.count === 0 &&
    preview.advances.count === 0;

  // Ao trocar a data de corte, refaz a prévia.
  useEffect(() => {
    let current = true;
    closingPreviewAction(professional.id, until).then((result) => {
      if (current) {
        setFetched({ until, preview: result.ok ? result.preview : null });
      }
    });
    return () => {
      current = false;
    };
  }, [professional.id, until]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (!methodId) {
      setErrors({ paymentMethodId: "Escolha o método de pagamento." });
      document.getElementById(FIELD_IDS.paymentMethodId)?.focus();
      return;
    }
    startTransition(async () => {
      const result = await createClosingAction(data);
      if (result.ok) {
        toast.success(`Fechamento nº ${receiptNumber(result.number)} feito.`);
        setDone({ id: result.id, number: result.number });
        return;
      }
      if (result.field) {
        setErrors({ [result.field]: result.message });
        document.getElementById(FIELD_IDS[result.field])?.focus();
      }
      toast.error("Não foi possível fechar a comissão.", {
        description: result.message,
      });
    });
  }

  // Depois de fechar: o recibo abre por um clique (aba nova não é bloqueada).
  if (done) {
    return (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle>Comissão fechada</DialogTitle>
          <DialogDescription>
            Fechamento nº {receiptNumber(done.number)} de {professional.name}.
            Imprima o recibo para o profissional assinar.
          </DialogDescription>
        </DialogHeader>
        <p className="flex items-center gap-2 text-sm">
          <CheckCircle2 aria-hidden="true" className="size-5 text-success" />
          As comissões e os adiantamentos até a data de corte estão quitados.
        </p>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            <X aria-hidden="true" />
            Fechar
          </Button>
          <Button asChild>
            <a
              href={receiptHref(done.id)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Printer aria-hidden="true" />
              Imprimir recibo
            </a>
          </Button>
        </DialogFooter>
      </div>
    );
  }

  const line = (label: string, value: string, strong = false) => (
    <div
      className={`flex items-center justify-between gap-4 ${strong ? "border-t border-border pt-2 font-semibold" : ""}`}
    >
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="professionalId" value={professional.id} />
      <DialogHeader>
        <DialogTitle>Fechar comissão — {professional.name}</DialogTitle>
        <DialogDescription>
          Quita as comissões e os adiantamentos em aberto até a data de corte.
        </DialogDescription>
      </DialogHeader>

      <FormField
        id={FIELD_IDS.until}
        label="Fechar até"
        required
        error={errors.until}
      >
        <DatePicker
          id={FIELD_IDS.until}
          name="until"
          initialValue={today}
          maxDate={new Date(`${today}T12:00:00`)}
          onValueChange={(value) => value && setUntil(value)}
        />
      </FormField>

      {/* Resumo do que será quitado; refeito a cada data. */}
      <dl
        aria-live="polite"
        aria-busy={loading}
        className="space-y-2 rounded-card border border-border p-3 text-sm"
      >
        {loading ? (
          <p className="text-muted-foreground">Calculando…</p>
        ) : preview ? (
          <>
            {line(
              `Comissões (${preview.commissions.count} ${preview.commissions.count === 1 ? "atendimento" : "atendimentos"})`,
              formatPrice(preview.commissions.amount),
            )}
            {line(
              `Adiantamentos (${preview.advances.count})`,
              `− ${formatPrice(preview.advances.amount)}`,
            )}
            {line("A pagar", formatPrice(preview.toPay), true)}
          </>
        ) : (
          <p className="text-muted-foreground">
            Não foi possível calcular o fechamento.
          </p>
        )}
      </dl>
      {nothing && (
        <p className="-mt-2 text-sm text-muted-foreground">
          Nada em aberto até esta data.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          id={FIELD_IDS.paymentMethodId}
          label="Método de pagamento"
          required
          error={errors.paymentMethodId}
        >
          <Select
            name="paymentMethodId"
            value={methodId}
            onValueChange={(value) => {
              setMethodId(value);
              setErrors((current) => ({
                ...current,
                paymentMethodId: undefined,
              }));
            }}
          >
            <SelectTrigger
              id={FIELD_IDS.paymentMethodId}
              className="w-full"
              aria-invalid={errors.paymentMethodId ? true : undefined}
              aria-describedby={
                errors.paymentMethodId
                  ? `${FIELD_IDS.paymentMethodId}-error`
                  : undefined
              }
            >
              <SelectValue placeholder="Escolha" />
            </SelectTrigger>
            <SelectContent>
              {methods.map((method) => (
                <SelectItem key={method.id} value={method.id}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField
          id={FIELD_IDS.paidAt}
          label="Data do pagamento"
          required
          error={errors.paidAt}
        >
          <DatePicker
            id={FIELD_IDS.paidAt}
            name="paidAt"
            initialValue={today}
            maxDate={new Date(`${today}T12:00:00`)}
          />
        </FormField>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onClose}
        >
          <X aria-hidden="true" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={pending || loading || nothing || !preview}
        >
          <CheckCircle2 aria-hidden="true" />
          {pending ? "Fechando…" : "Fechar e gerar recibo"}
        </Button>
      </DialogFooter>
    </form>
  );
}

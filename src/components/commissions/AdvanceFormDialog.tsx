"use client";

import { Plus, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  advanceAvailableAction,
  createAdvanceAction,
} from "@/app/(admin)/commission-actions";
import {
  advanceFieldOrder,
  validateAdvance,
  type AdvanceErrors,
} from "@/components/commissions/advance-validation";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { MaskedInput } from "@/components/shared/MaskedInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from "@/utils/format";
import { maskCurrency } from "@/utils/masks";

type AdvanceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professionals: { id: string; name: string }[];
  /** Profissional do filtro da tela: o diálogo já abre com ele. */
  defaultProfessionalId?: string;
  /** Hoje no fuso da empresa ("aaaa-mm-dd"): padrão e limite da data. */
  today: string;
};

// Ids dos campos: ligam o erro de cada um ao elemento que recebe o foco.
const FIELD_IDS = {
  professionalId: "advance-professional",
  date: "advance-date",
  cents: "advance-amount",
} as const;

/** Lançar adiantamento de comissão (screens/comissoes.md). */
export function AdvanceFormDialog({
  open,
  onOpenChange,
  ...props
}: AdvanceFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* Só existe aberto: os campos começam limpos a cada abertura. */}
        <AdvanceForm {...props} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function AdvanceForm({
  professionals,
  defaultProfessionalId,
  today,
  onClose,
}: Omit<AdvanceFormDialogProps, "open" | "onOpenChange"> & {
  onClose: () => void;
}) {
  const [professionalId, setProfessionalId] = useState(
    defaultProfessionalId ?? "",
  );
  // Última resposta do disponível e de qual profissional ela é: enquanto não
  // for do escolhido, está "buscando" (sem setState direto no efeito).
  const [fetched, setFetched] = useState<{
    professionalId: string;
    /** Centavos; null se a busca falhou. */
    cents: number | null;
  } | null>(null);
  const [errors, setErrors] = useState<AdvanceErrors>({});
  const [pending, startTransition] = useTransition();
  const loadingAvailable =
    professionalId !== "" && fetched?.professionalId !== professionalId;
  const available = loadingAvailable ? null : (fetched?.cents ?? null);

  // Ao trocar o profissional, busca quanto ainda pode ser adiantado.
  useEffect(() => {
    if (!professionalId) return;
    let current = true;
    advanceAvailableAction(professionalId).then((result) => {
      if (!current) return;
      setFetched({
        professionalId,
        cents: result.ok ? Math.round(Number(result.available) * 100) : null,
      });
    });
    return () => {
      current = false;
    };
  }, [professionalId]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const found = validateAdvance(
      {
        professionalId,
        cents: String(data.get("cents") ?? ""),
        date: String(data.get("date") ?? ""),
      },
      today,
      available,
    );
    setErrors(found);
    const firstInvalid = advanceFieldOrder.find((field) => found[field]);
    if (firstInvalid) {
      document.getElementById(FIELD_IDS[firstInvalid])?.focus();
      return;
    }

    startTransition(async () => {
      const result = await createAdvanceAction(data);
      if (result.ok) {
        toast.success("Adiantamento lançado.");
        onClose();
        return;
      }
      if (result.field) {
        setErrors({ [result.field]: result.message });
        document.getElementById(FIELD_IDS[result.field])?.focus();
      }
      toast.error("Não foi possível lançar o adiantamento.", {
        description: result.message,
      });
    });
  }

  const describedBy = (field: keyof typeof FIELD_IDS) =>
    errors[field] ? `${FIELD_IDS[field]}-error` : undefined;

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Lançar adiantamento</DialogTitle>
        <DialogDescription>
          O valor é abatido da comissão no fechamento.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField
          id={FIELD_IDS.professionalId}
          label="Profissional"
          required
          error={errors.professionalId}
        >
          <Select
            name="professionalId"
            value={professionalId}
            onValueChange={(value) => {
              setProfessionalId(value);
              setErrors((current) => ({
                ...current,
                professionalId: undefined,
              }));
            }}
          >
            <SelectTrigger
              id={FIELD_IDS.professionalId}
              className="w-full"
              aria-invalid={errors.professionalId ? true : undefined}
              aria-describedby={describedBy("professionalId")}
            >
              <SelectValue placeholder="Escolha" />
            </SelectTrigger>
            <SelectContent>
              {professionals.map((professional) => (
                <SelectItem key={professional.id} value={professional.id}>
                  {professional.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        <FormField
          id={FIELD_IDS.date}
          label="Data"
          required
          error={errors.date}
        >
          <DatePicker
            id={FIELD_IDS.date}
            name="date"
            initialValue={today}
            // Pode ser passada (um vale já dado), nunca futura.
            maxDate={new Date(`${today}T12:00:00`)}
          />
        </FormField>
      </div>

      <FormField
        id={FIELD_IDS.cents}
        label="Valor"
        required
        error={errors.cents}
      >
        <MaskedInput
          id={FIELD_IDS.cents}
          name="cents"
          mask={maskCurrency}
          inputMode="numeric"
          placeholder="R$ 0,00"
          aria-invalid={errors.cents ? true : undefined}
          aria-describedby={
            [describedBy("cents"), "advance-available"]
              .filter(Boolean)
              .join(" ") || undefined
          }
        />
      </FormField>
      <p
        id="advance-available"
        aria-live="polite"
        className="-mt-2 text-sm text-muted-foreground"
      >
        {!professionalId
          ? "Escolha o profissional para ver o disponível."
          : loadingAvailable
            ? "Buscando o disponível…"
            : available !== null
              ? `Disponível para adiantar: ${formatPrice(available / 100)}`
              : "Não foi possível buscar o disponível."}
      </p>

      <FormField id="advance-note" label="Observação">
        <Input
          id="advance-note"
          name="note"
          maxLength={200}
          autoComplete="off"
          placeholder="Ex.: vale de transporte"
        />
      </FormField>

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
        <Button type="submit" disabled={pending}>
          <Plus aria-hidden="true" />
          {pending ? "Lançando…" : "Lançar"}
        </Button>
      </DialogFooter>
    </form>
  );
}

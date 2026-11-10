"use client";

import { Plus, Save, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  createPayableAction,
  updatePayableAction,
} from "@/app/(admin)/payable-actions";
import { payableTitle } from "@/components/payables/payable-filters";
import { SettleFields } from "@/components/payments/SettleFields";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { PayableInput, PayableItem } from "@/types/payable";
import type { PaymentMethodItem } from "@/types/payment-method";
import { maskCurrency } from "@/utils/masks";

/** Favorecido: fornecedor (com a categoria principal) ou profissional. */
export type PayeeOption = {
  id: string;
  name: string;
  type: "SUPPLIER" | "PROFESSIONAL";
  categoryId: string | null;
};

type PayableFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Na alteração, a conta; sem ela, é o cadastro. */
  payable?: PayableItem;
  payees: PayeeOption[];
  /** Categorias ativas. */
  categories: { id: string; name: string }[];
  /** Métodos ativos (para "Já está paga"). */
  methods: PaymentMethodItem[];
  /** Hoje no fuso da empresa ("aaaa-mm-dd"). */
  today: string;
};

// O Radix não aceita valor vazio num item: "NONE" é o "Sem favorecido".
const NONE = "NONE";
type Repeat = "none" | "installments" | "monthly";

const FIELD_IDS = {
  description: "payable-description",
  category: "payable-category",
  amount: "payable-amount",
  dueDate: "payable-due",
  count: "payable-count",
  method: "payable-paid-method",
} as const;
type Field = keyof typeof FIELD_IDS;

/** Nova conta a pagar e alteração de uma conta (screens/contas-a-pagar.md). */
export function PayableFormDialog({
  open,
  onOpenChange,
  ...props
}: PayableFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {/* Só existe aberto: os campos começam limpos a cada abertura. */}
        <PayableForm {...props} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function PayableForm({
  payable,
  payees,
  categories,
  methods,
  today,
  onClose,
}: Omit<PayableFormDialogProps, "open" | "onOpenChange"> & {
  onClose: () => void;
}) {
  const editing = payable !== undefined;
  const [payeeId, setPayeeId] = useState(payable?.payee?.id ?? NONE);
  const [categoryId, setCategoryId] = useState(payable?.category.id ?? "");
  const [repeat, setRepeat] = useState<Repeat>("none");
  const [paid, setPaid] = useState(false);
  const [methodId, setMethodId] = useState("");
  const [paidAt, setPaidAt] = useState(today);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [pending, startTransition] = useTransition();

  // Escolher um fornecedor traz a categoria principal dele, se ainda não há uma.
  function choosePayee(id: string) {
    setPayeeId(id);
    const category = payees.find((payee) => payee.id === id)?.categoryId;
    if (category && !categoryId) setCategoryId(category);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const description = String(data.get("description") ?? "").trim();
    const cents = Number(String(data.get("amount") ?? "").replace(/\D/g, ""));
    const dueDate = String(data.get("dueDate") ?? "");
    const count = Number(data.get("count") ?? 0);

    const found: Partial<Record<Field, string>> = {};
    if (!description) found.description = "Informe a descrição.";
    if (!categoryId) found.category = "Escolha a categoria.";
    if (!(cents > 0)) found.amount = "Informe o valor.";
    if (!dueDate) found.dueDate = "Informe o vencimento.";
    if (!editing && repeat !== "none" && !(count >= 2 && count <= 60)) {
      found.count = "De 2 a 60 vezes.";
    }
    if (!editing && paid && !methodId) {
      found.method = "Escolha o método de pagamento.";
    }
    setErrors(found);
    const first = (Object.keys(FIELD_IDS) as Field[]).find((key) => found[key]);
    if (first) {
      document.getElementById(FIELD_IDS[first])?.focus();
      return;
    }

    const base = {
      description,
      payeeId: payeeId === NONE ? null : payeeId,
      categoryId,
      amount: cents / 100,
      dueDate,
      note: String(data.get("note") ?? "").trim() || null,
    };
    const input: PayableInput = {
      ...base,
      ...(repeat !== "none" && { repeat: { mode: repeat, count } }),
      ...(paid && { paid: { paidAt, paymentMethodId: methodId } }),
    };

    startTransition(async () => {
      const result = editing
        ? await updatePayableAction(payable.id, base)
        : await createPayableAction(input);
      if (result.ok) {
        toast.success(
          editing
            ? "Conta atualizada."
            : repeat === "none"
              ? "Conta cadastrada."
              : `${count} contas cadastradas.`,
          // Na alteração, com a parcela: "Aluguel (2/3)".
          {
            description: payable
              ? payableTitle({ ...payable, description })
              : description,
          },
        );
        onClose();
        return;
      }
      toast.error(
        editing
          ? "Não foi possível atualizar a conta."
          : "Não foi possível cadastrar a conta.",
        { description: result.message },
      );
    });
  }

  const describedBy = (field: Field) =>
    errors[field] ? `${FIELD_IDS[field]}-error` : undefined;

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {editing ? "Alterar conta a pagar" : "Nova conta a pagar"}
        </DialogTitle>
        <DialogDescription>
          {editing
            ? "As alterações valem só para esta conta."
            : "Lance a despesa; repetida ou parcelada, gera uma conta por mês."}
        </DialogDescription>
      </DialogHeader>

      <FormField
        id={FIELD_IDS.description}
        label="Descrição"
        required
        error={errors.description}
      >
        <Input
          id={FIELD_IDS.description}
          name="description"
          defaultValue={payable?.description}
          maxLength={120}
          autoComplete="off"
          placeholder="Ex.: Aluguel"
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={describedBy("description")}
          autoFocus
        />
      </FormField>

      <div className="grid gap-3 sm:grid-cols-2">
        <FormField id="payable-payee" label="Favorecido">
          <Select value={payeeId} onValueChange={choosePayee}>
            <SelectTrigger id="payable-payee" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Sem favorecido</SelectItem>
              {payees.map((payee) => (
                <SelectItem key={payee.id} value={payee.id}>
                  {payee.name} (
                  {payee.type === "SUPPLIER" ? "fornecedor" : "profissional"})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField
          id={FIELD_IDS.category}
          label="Categoria"
          required
          error={errors.category}
        >
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger
              id={FIELD_IDS.category}
              className="w-full"
              aria-invalid={errors.category ? true : undefined}
              aria-describedby={describedBy("category")}
            >
              <SelectValue placeholder="Escolha" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          id={FIELD_IDS.amount}
          label={repeat === "installments" ? "Valor total" : "Valor"}
          required
          error={errors.amount}
        >
          <MaskedInput
            id={FIELD_IDS.amount}
            name="amount"
            mask={maskCurrency}
            initialValue={
              payable ? String(Math.round(Number(payable.amount) * 100)) : ""
            }
            inputMode="numeric"
            placeholder="R$ 0,00"
            aria-invalid={errors.amount ? true : undefined}
            aria-describedby={describedBy("amount")}
          />
        </FormField>
        <FormField
          id={FIELD_IDS.dueDate}
          label={repeat === "none" ? "Vencimento" : "Primeiro vencimento"}
          required
          error={errors.dueDate}
        >
          <DatePicker
            id={FIELD_IDS.dueDate}
            name="dueDate"
            initialValue={payable?.dueDate ?? today}
            maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
          />
        </FormField>
      </div>

      {/* Repetição e "já paga" só no cadastro: a alteração é só desta conta. */}
      {!editing && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Repetição</legend>
          <RadioGroup
            value={repeat}
            onValueChange={(value) => {
              setRepeat(value as Repeat);
              // Repetida ou parcelada não nasce paga.
              if (value !== "none") setPaid(false);
            }}
            className="gap-2"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="none" id="repeat-none" />
              <Label htmlFor="repeat-none">Não repete</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="installments" id="repeat-installments" />
              <Label htmlFor="repeat-installments">
                Parcelar (o valor é dividido)
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="monthly" id="repeat-monthly" />
              <Label htmlFor="repeat-monthly">
                Repetir (o mesmo valor todo mês)
              </Label>
            </div>
          </RadioGroup>
          {repeat !== "none" && (
            <FormField
              id={FIELD_IDS.count}
              label={
                repeat === "installments"
                  ? "Em quantas vezes"
                  : "Por quantos meses"
              }
              required
              error={errors.count}
            >
              <Input
                id={FIELD_IDS.count}
                name="count"
                type="number"
                min={2}
                max={60}
                defaultValue={repeat === "installments" ? 3 : 12}
                className="w-28"
                aria-invalid={errors.count ? true : undefined}
                aria-describedby={describedBy("count")}
              />
            </FormField>
          )}
        </fieldset>
      )}

      <FormField id="payable-note" label="Observação">
        <Textarea
          id="payable-note"
          name="note"
          defaultValue={payable?.note ?? ""}
          maxLength={500}
          rows={2}
        />
      </FormField>

      {!editing && repeat === "none" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Switch
              id="payable-paid"
              checked={paid}
              onCheckedChange={setPaid}
            />
            <Label htmlFor="payable-paid">Já está paga</Label>
          </div>
          {paid && (
            <SettleFields
              idPrefix="payable-paid"
              methods={methods}
              methodId={methodId}
              onMethodChange={(value) => {
                setMethodId(value);
                setErrors((current) => ({ ...current, method: undefined }));
              }}
              methodError={errors.method}
              today={today}
              onDateChange={setPaidAt}
            />
          )}
        </div>
      )}

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
          {editing ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {editing
            ? pending
              ? "Salvando…"
              : "Salvar alterações"
            : pending
              ? "Cadastrando…"
              : "Cadastrar"}
        </Button>
      </DialogFooter>
    </form>
  );
}

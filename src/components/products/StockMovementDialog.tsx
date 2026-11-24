"use client";

import { ArrowDownUp, X } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createStockMovementAction } from "@/app/(admin)/product-actions";
import {
  balanceAfter,
  MANUAL_MOVEMENTS,
  validateMovement,
  type MovementErrors,
  type MovementField,
  type MovementFormValues,
} from "@/components/products/stock-movements";
import { centsText, maskStock } from "@/components/products/product-validation";
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
import type {
  ManualMovementType,
  Product,
  StockMovementInput,
} from "@/types/product";
import type { PaymentMethodItem } from "@/types/payment-method";
import { formatPrice } from "@/utils/format";
import { maskCurrency } from "@/utils/masks";

/**
 * O que a compra precisa para lançar a conta a pagar. Vazio (`null`) quando a
 * empresa não tem o Contas a pagar: a opção nem aparece.
 */
export type PurchasePayableContext = {
  /** Categorias de despesa ativas. */
  categories: { id: string; name: string }[];
  /** Fornecedores ativos, com a categoria principal de cada um. */
  suppliers: { id: string; name: string; categoryId: string | null }[];
  /** Métodos ativos ("Já está paga"); vazio sem a funcionalidade. */
  methods: PaymentMethodItem[];
  /** Hoje no fuso da empresa ("aaaa-mm-dd"). */
  today: string;
};

type StockMovementDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  payable: PurchasePayableContext | null;
};

// O Radix não aceita valor vazio num item: "NONE" é o "Sem favorecido".
const NONE = "NONE";
const FIELD_IDS: Record<MovementField, string> = {
  quantity: "movement-quantity",
  unitCost: "movement-cost",
  categoryId: "movement-category",
  dueDate: "movement-due",
  methodId: "movement-paid-method",
};

/** Entrada, saída ou ajuste do estoque de um produto (screens/produtos.md). */
export function StockMovementDialog({
  open,
  onOpenChange,
  ...props
}: StockMovementDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        {/* Só existe aberto: os campos começam limpos a cada abertura. */}
        <MovementForm {...props} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function MovementForm({
  product,
  payable,
  onClose,
}: Omit<StockMovementDialogProps, "open" | "onOpenChange"> & {
  onClose: () => void;
}) {
  const supplierCategory =
    payable?.suppliers.find((supplier) => supplier.id === product.supplierId)
      ?.categoryId ?? "";
  const [values, setValues] = useState<MovementFormValues>({
    type: "PURCHASE",
    quantity: "",
    // Começa com o custo atual: na maioria das compras, ele se repete.
    unitCost: centsText(product.purchasePrice),
    withPayable: false,
    categoryId: supplierCategory,
    dueDate: payable?.today ?? "",
    paid: false,
    methodId: "",
  });
  // Favorecido da conta: o fornecedor do produto, se houver.
  const [payeeId, setPayeeId] = useState(product.supplierId ?? NONE);
  const [paidAt, setPaidAt] = useState(payable?.today ?? "");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<MovementErrors>({});
  const [pending, startTransition] = useTransition();

  const isPurchase = values.type === "PURCHASE";
  const isAdjustment = values.type === "ADJUSTMENT";
  const quantity = values.quantity === "" ? null : Number(values.quantity);
  const next = balanceAfter(values.type, product.currentStock, quantity);
  const total =
    isPurchase && quantity && Number(values.unitCost) > 0
      ? (quantity * Number(values.unitCost)) / 100
      : null;
  const hint = MANUAL_MOVEMENTS.find(
    (item) => item.value === values.type,
  )?.hint;

  function set<K extends keyof MovementFormValues>(
    key: K,
    value: MovementFormValues[K],
  ) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  // Escolher outro fornecedor traz a categoria principal dele, se não há uma.
  function choosePayee(id: string) {
    setPayeeId(id);
    const category = payable?.suppliers.find(
      (item) => item.id === id,
    )?.categoryId;
    if (category && !values.categoryId) set("categoryId", category);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateMovement(values, product.currentStock);
    setErrors(found);
    const first = (Object.keys(FIELD_IDS) as MovementField[]).find(
      (field) => found[field],
    );
    if (first) {
      document.getElementById(FIELD_IDS[first])?.focus();
      return;
    }

    const input: StockMovementInput = {
      type: values.type,
      quantity: quantity!,
      ...(note.trim() && { note: note.trim() }),
      ...(isPurchase && { unitCost: Number(values.unitCost) / 100 }),
      ...(isPurchase &&
        values.withPayable && {
          payable: {
            payeeId: payeeId === NONE ? null : payeeId,
            categoryId: values.categoryId,
            dueDate: values.dueDate,
            ...(values.paid && {
              paid: { paidAt, paymentMethodId: values.methodId },
            }),
          },
        }),
    };

    startTransition(async () => {
      const result = await createStockMovementAction(product.id, input);
      if (result.ok) {
        toast.success("Estoque atualizado.", {
          description: `${product.name}: ${result.movement.balanceAfter} em estoque.${
            result.movement.payable ? " Conta a pagar lançada." : ""
          }`,
        });
        onClose();
        return;
      }
      if (result.field) {
        setErrors({ quantity: result.message });
        document.getElementById(FIELD_IDS.quantity)?.focus();
      }
      toast.error("Não foi possível movimentar o estoque.", {
        description: result.message,
      });
    });
  }

  const invalid = (field: MovementField) => (errors[field] ? true : undefined);

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Movimentar estoque</DialogTitle>
        <DialogDescription>
          {product.name}: {product.currentStock} em estoque.
        </DialogDescription>
      </DialogHeader>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Movimentação</legend>
        <RadioGroup
          value={values.type}
          onValueChange={(value) => {
            set("type", value as ManualMovementType);
            set("quantity", "");
          }}
          className="grid gap-2 sm:grid-cols-2"
        >
          {MANUAL_MOVEMENTS.map((item) => (
            <div key={item.value} className="flex items-center gap-2">
              <RadioGroupItem
                value={item.value}
                id={`movement-${item.value}`}
              />
              <Label htmlFor={`movement-${item.value}`}>{item.label}</Label>
            </div>
          ))}
        </RadioGroup>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <FormField
          id={FIELD_IDS.quantity}
          label={isAdjustment ? "Saldo contado" : "Quantidade"}
          required
          error={errors.quantity}
        >
          <MaskedInput
            id={FIELD_IDS.quantity}
            mask={maskStock}
            value={values.quantity}
            onValueChange={(digits) => set("quantity", digits)}
            inputMode="numeric"
            placeholder="0"
            aria-invalid={invalid("quantity")}
            autoFocus
          />
        </FormField>
        {isPurchase && (
          <FormField
            id={FIELD_IDS.unitCost}
            label="Custo unitário"
            required
            error={errors.unitCost}
          >
            <MaskedInput
              id={FIELD_IDS.unitCost}
              mask={maskCurrency}
              value={values.unitCost}
              onValueChange={(digits) => set("unitCost", digits)}
              inputMode="numeric"
              placeholder="R$ 0,00"
              aria-invalid={invalid("unitCost")}
            />
          </FormField>
        )}
      </div>

      {/* Prévia do saldo (e do total da compra); quem confere é a API. */}
      <p role="status" className="rounded-control bg-muted px-3 py-2 text-sm">
        Estoque:{" "}
        <strong className="tabular-nums">
          {product.currentStock} → {next ?? "--"}
        </strong>
        {total !== null && (
          <span className="block text-xs text-muted-foreground">
            Total da compra: {formatPrice(total)}
          </span>
        )}
      </p>

      <FormField id="movement-note" label="Observação">
        <Textarea
          id="movement-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
          rows={2}
          placeholder={isAdjustment ? "Ex.: Inventário de novembro" : undefined}
        />
      </FormField>

      {isPurchase && payable && (
        <div className="space-y-3 rounded-control border border-border p-3">
          <div className="flex items-center gap-2">
            <Switch
              id="movement-payable"
              checked={values.withPayable}
              onCheckedChange={(checked) => set("withPayable", checked)}
            />
            <Label htmlFor="movement-payable">Lançar conta a pagar</Label>
          </div>
          {values.withPayable && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField id="movement-payee" label="Favorecido">
                  <Select value={payeeId} onValueChange={choosePayee}>
                    <SelectTrigger id="movement-payee" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Sem favorecido</SelectItem>
                      {payable.suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField
                  id={FIELD_IDS.categoryId}
                  label="Categoria"
                  required
                  error={errors.categoryId}
                >
                  <Select
                    value={values.categoryId}
                    onValueChange={(id) => set("categoryId", id)}
                  >
                    <SelectTrigger
                      id={FIELD_IDS.categoryId}
                      className="w-full"
                      aria-invalid={invalid("categoryId")}
                    >
                      <SelectValue placeholder="Escolha" />
                    </SelectTrigger>
                    <SelectContent>
                      {payable.categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <FormField
                id={FIELD_IDS.dueDate}
                label="Vencimento"
                required
                error={errors.dueDate}
              >
                <DatePicker
                  id={FIELD_IDS.dueDate}
                  name="dueDate"
                  initialValue={values.dueDate}
                  maxDate={new Date(new Date().getFullYear() + 5, 11, 31)}
                  onValueChange={(value) => set("dueDate", value)}
                />
              </FormField>
              {payable.methods.length > 0 && (
                <>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="movement-paid"
                      checked={values.paid}
                      onCheckedChange={(checked) => set("paid", checked)}
                    />
                    <Label htmlFor="movement-paid">Já está paga</Label>
                  </div>
                  {values.paid && (
                    <SettleFields
                      idPrefix="movement-paid"
                      methods={payable.methods}
                      methodId={values.methodId}
                      onMethodChange={(id) => set("methodId", id)}
                      methodError={errors.methodId}
                      today={payable.today}
                      onDateChange={setPaidAt}
                    />
                  )}
                </>
              )}
            </>
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
          <ArrowDownUp aria-hidden="true" />
          {pending ? "Lançando…" : "Lançar"}
        </Button>
      </DialogFooter>
    </form>
  );
}

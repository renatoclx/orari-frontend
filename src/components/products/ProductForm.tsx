"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  createProductAction,
  updateProductAction,
} from "@/app/(admin)/product-actions";
import { MarginValue } from "@/components/products/ProductDetails";
import { profitMargin } from "@/components/products/product-pricing";
import { PRODUCT_UNITS } from "@/components/products/product-units";
import {
  hasErrors,
  initialProductValues,
  maskStock,
  validateProductForm,
  type ProductField,
  type ProductFormErrors,
  type ProductFormValues,
} from "@/components/products/product-validation";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { MaskedInput } from "@/components/shared/MaskedInput";
import { PhotoUpload } from "@/components/shared/PhotoUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Product, ProductUnit } from "@/types/product";
import { maskCurrency } from "@/utils/masks";

const BASE_PATH = "/produtos";
// O Select do Radix não aceita valor vazio: "sem fornecedor" e "sem unidade".
const NONE = "NONE";
// Ordem dos campos na tela: o foco vai para o primeiro com erro.
const FIELD_ORDER: ProductField[] = [
  "name",
  "categoryId",
  "sku",
  "measureUnit",
  "supplierId",
  "description",
  "salePrice",
  "purchasePrice",
  "promotionalPrice",
  "currentStock",
  "minimalStock",
  "maximumStock",
];
const fieldId = (field: ProductField) => `product-${field}`;

export type Option = { id: string; name: string };

type ProductFormProps = {
  /** Presente na alteração; sem isso, é o cadastro. */
  product?: Product;
  /** Categorias ativas (e a atual, se foi inativada). */
  categories: Option[];
  /** Fornecedores ativos (e o atual, se foi inativado). */
  suppliers: Option[];
};

/**
 * Cadastro e alteração de produto (página): foto, dados, preços com a prévia
 * da margem e estoque.
 */
export function ProductForm({
  product,
  categories,
  suppliers,
}: ProductFormProps) {
  const router = useRouter();
  const editing = product !== undefined;
  const [values, setValues] = useState(() => initialProductValues(product));
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [pending, startTransition] = useTransition();

  // Prévia enquanto digita; o valor que vale é o que a API calcula.
  const margin = profitMargin(
    Number(values.salePrice) / 100,
    Number(values.purchasePrice) / 100,
  );

  function set<K extends ProductField>(key: K, value: ProductFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function focusFirst(found: ProductFormErrors) {
    const first = FIELD_ORDER.find((field) => found[field]);
    if (first) document.getElementById(fieldId(first))?.focus();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateProductForm(values);
    setErrors(found);
    if (hasErrors(found)) {
      focusFirst(found);
      return;
    }

    // A foto (e o "removePhoto") vêm do próprio formulário; os valores, em JSON.
    const data = new FormData(event.currentTarget);
    data.set("values", JSON.stringify(values));

    startTransition(async () => {
      const result = product
        ? await updateProductAction(product.id, product.supplierId, data)
        : await createProductAction(data);

      if (result.ok) {
        toast.success(editing ? "Produto atualizado." : "Produto cadastrado.", {
          description: values.name.trim(),
        });
        if (result.photoFailed) {
          toast.warning("A foto não foi salva.", {
            description: "Você poderá enviá-la de novo na alteração.",
          });
        }
        router.push(BASE_PATH);
        return;
      }
      if (result.field) {
        const found = { [result.field]: result.message };
        setErrors(found);
        focusFirst(found);
      }
      toast.error(
        editing
          ? "Não foi possível atualizar o produto."
          : "Não foi possível cadastrar o produto.",
        { description: result.message },
      );
    });
  }

  // aria-invalid do campo com erro.
  const invalid = (field: ProductField) => (errors[field] ? true : undefined);

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      // Padrão de página: o card ocupa a largura toda e a altura que sobra.
      className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card"
    >
      {/* relative: os inputs escondidos do Radix (Select num form) são
          absolutos; presos aqui, não aumentam a altura da página. */}
      <div className="relative min-h-0 flex-1 overflow-auto p-4 md:p-6">
        {/* Foto centralizada, acima das colunas, como nas pessoas. */}
        <div className="mb-6 flex justify-center">
          <PhotoUpload currentUrl={product?.photoUrl} alt="Foto do produto" />
        </div>

        <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
          <section aria-labelledby="product-main" className="space-y-4">
            <h2 id="product-main" className="font-semibold">
              Dados do produto
            </h2>

            <FormField
              id={fieldId("name")}
              label="Nome"
              required
              error={errors.name}
            >
              <Input
                id={fieldId("name")}
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
                autoComplete="off"
                placeholder="Ex.: Óleo de massagem"
                aria-invalid={invalid("name")}
              />
            </FormField>

            <FormField
              id={fieldId("categoryId")}
              label="Categoria"
              required
              error={errors.categoryId}
            >
              <Select
                value={values.categoryId}
                onValueChange={(next) => set("categoryId", next)}
              >
                <SelectTrigger
                  id={fieldId("categoryId")}
                  className="w-full"
                  aria-invalid={invalid("categoryId")}
                >
                  <SelectValue placeholder="Escolha a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma categoria ativa.{" "}
                  <Link
                    href="/produtos/categorias"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Cadastre uma em Categorias
                  </Link>
                  .
                </p>
              )}
            </FormField>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id={fieldId("sku")} label="SKU" error={errors.sku}>
                <Input
                  id={fieldId("sku")}
                  value={values.sku}
                  onChange={(event) => set("sku", event.target.value)}
                  autoComplete="off"
                  placeholder="Código interno"
                  aria-invalid={invalid("sku")}
                />
              </FormField>

              <FormField
                id={fieldId("measureUnit")}
                label="Unidade de medida"
                error={errors.measureUnit}
              >
                <Select
                  value={values.measureUnit || NONE}
                  onValueChange={(next) =>
                    set(
                      "measureUnit",
                      next === NONE ? "" : (next as ProductUnit),
                    )
                  }
                >
                  <SelectTrigger id={fieldId("measureUnit")} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>Sem unidade</SelectItem>
                    {PRODUCT_UNITS.map((unit) => (
                      <SelectItem key={unit.value} value={unit.value}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <FormField
              id={fieldId("supplierId")}
              label="Fornecedor"
              error={errors.supplierId}
            >
              <Select
                value={values.supplierId || NONE}
                onValueChange={(next) =>
                  set("supplierId", next === NONE ? "" : next)
                }
              >
                <SelectTrigger
                  id={fieldId("supplierId")}
                  className="w-full"
                  aria-invalid={invalid("supplierId")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Sem fornecedor</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>

            <FormField id={fieldId("description")} label="Descrição">
              <Textarea
                id={fieldId("description")}
                className="min-h-28"
                value={values.description}
                onChange={(event) => set("description", event.target.value)}
                placeholder="Informe a descrição do produto..."
              />
            </FormField>
          </section>

          <div className="space-y-6">
            <section aria-labelledby="product-prices" className="space-y-4">
              <h2 id="product-prices" className="font-semibold">
                Preços
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  id={fieldId("salePrice")}
                  label="Preço de venda"
                  required
                  error={errors.salePrice}
                >
                  <MaskedInput
                    id={fieldId("salePrice")}
                    mask={maskCurrency}
                    value={values.salePrice}
                    onValueChange={(digits) => set("salePrice", digits)}
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    aria-invalid={invalid("salePrice")}
                  />
                </FormField>
                <FormField
                  id={fieldId("purchasePrice")}
                  label="Preço de custo"
                  required
                  error={errors.purchasePrice}
                >
                  <MaskedInput
                    id={fieldId("purchasePrice")}
                    mask={maskCurrency}
                    value={values.purchasePrice}
                    onValueChange={(digits) => set("purchasePrice", digits)}
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    aria-invalid={invalid("purchasePrice")}
                  />
                </FormField>
                <FormField
                  id={fieldId("promotionalPrice")}
                  label="Preço promocional"
                  error={errors.promotionalPrice}
                >
                  <MaskedInput
                    id={fieldId("promotionalPrice")}
                    mask={maskCurrency}
                    value={values.promotionalPrice}
                    onValueChange={(digits) => set("promotionalPrice", digits)}
                    inputMode="numeric"
                    placeholder="R$ 0,00"
                    aria-invalid={invalid("promotionalPrice")}
                  />
                </FormField>
              </div>
              {/* Prévia da margem: calculada pela API ao salvar. */}
              <p
                role="status"
                className="rounded-control bg-muted px-3 py-2 text-sm"
              >
                Margem de lucro:{" "}
                <strong className="tabular-nums">
                  {margin === null ? "--" : <MarginValue margin={margin} />}
                </strong>
                <span className="block text-xs text-muted-foreground">
                  {margin !== null && margin < 0
                    ? "O preço de custo está acima do preço de venda."
                    : "Sobre o preço de venda; o promocional não muda a margem."}
                </span>
              </p>
            </section>

            <section aria-labelledby="product-stock" className="space-y-4">
              <h2 id="product-stock" className="font-semibold">
                Estoque
              </h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {(
                  [
                    ["currentStock", "Atual", true],
                    ["minimalStock", "Mínimo", false],
                    ["maximumStock", "Máximo", false],
                  ] as const
                ).map(([field, label, required]) => {
                  // Na alteração, o atual só muda pelas movimentações.
                  const locked = editing && field === "currentStock";
                  return (
                    <FormField
                      key={field}
                      id={fieldId(field)}
                      label={label}
                      required={required && !locked}
                      error={errors[field]}
                    >
                      <MaskedInput
                        id={fieldId(field)}
                        mask={maskStock}
                        value={values[field]}
                        onValueChange={(digits) => set(field, digits)}
                        inputMode="numeric"
                        placeholder="0"
                        readOnly={locked}
                        className={locked ? "bg-muted" : undefined}
                        aria-describedby={
                          locked ? "product-stock-hint" : undefined
                        }
                        aria-invalid={invalid(field)}
                      />
                    </FormField>
                  );
                })}
              </div>
              <p
                id="product-stock-hint"
                className="text-sm text-muted-foreground"
              >
                {editing
                  ? "O estoque atual muda pelo Movimentar estoque, na lista de produtos."
                  : "O estoque atual é o saldo inicial: depois, ele muda pelo Movimentar estoque."}
              </p>
            </section>
          </div>
        </div>
      </div>

      <FormFooter
        note={
          <>
            <span className="text-destructive">*</span> Campos obrigatórios
          </>
        }
      >
        <Button asChild variant="outline">
          <Link href={BASE_PATH}>
            <X aria-hidden="true" />
            Cancelar
          </Link>
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
      </FormFooter>
    </form>
  );
}

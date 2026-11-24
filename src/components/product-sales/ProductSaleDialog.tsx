"use client";

import { Plus, Search, ShoppingBag, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import type { ClientOption } from "@/app/(admin)/appointment-actions";
import {
  createProductSaleAction,
  searchSaleProductsAction,
} from "@/app/(admin)/product-sale-actions";
import { maskStock } from "@/components/products/product-validation";
import { useClientSearch } from "@/components/recurrences/useClientSearch";
import { Combobox } from "@/components/shared/Combobox";
import { FormField } from "@/components/shared/FormField";
import { Hint } from "@/components/shared/Hint";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { SaleProduct } from "@/types/product";
import { formatPrice } from "@/utils/format";
import { maskCurrency } from "@/utils/masks";
import {
  cartTotal,
  suggestedPrice,
  validateCart,
  type CartLine,
} from "@/utils/sale";

type ProductSaleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Cliente da comanda; sem ele ("Nova venda"), a pessoa escolhe. */
  client?: { id: string; name: string };
  /** Primeiros clientes, para escolher na "Nova venda". */
  initialClients?: ClientOption[];
};

/**
 * Venda de produtos (screens/financeiro.md, Comandas): busca os produtos,
 * monta a lista com quantidade e valor e lança a venda, que entra na comanda
 * de hoje como pendente. Só aparece para quem pode vender.
 */
export function ProductSaleDialog({
  open,
  onOpenChange,
  ...props
}: ProductSaleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        {/* Só existe aberto: a lista começa vazia a cada abertura. */}
        <SaleForm {...props} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function SaleForm({
  client,
  initialClients = [],
  onClose,
}: Omit<ProductSaleDialogProps, "open" | "onOpenChange"> & {
  onClose: () => void;
}) {
  const [clientId, setClientId] = useState(client?.id ?? "");
  const clientSearch = useClientSearch(initialClients, clientId);
  const [clientError, setClientError] = useState<string>();
  const [term, setTerm] = useState("");
  const [results, setResults] = useState<SaleProduct[] | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const request = useRef(0);
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Busca no servidor depois de uma pausa; a resposta antiga não sobrescreve a nova.
  function search(next: string) {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      const current = ++request.current;
      const result = await searchSaleProductsAction(next);
      if (current !== request.current) return;
      if (result.ok) setResults(result.products);
      else toast.error("Não foi possível buscar os produtos.");
    }, 300);
  }
  // Ao abrir, os primeiros produtos (em ordem de nome).
  useEffect(() => {
    search("");
    return () => clearTimeout(debounce.current);
  }, []);

  function add(product: SaleProduct) {
    setLines((current) => [
      ...current,
      {
        productId: product.id,
        name: product.name,
        stock: product.currentStock,
        quantity: "1",
        unitPrice: String(Math.round(Number(suggestedPrice(product)) * 100)),
      },
    ]);
  }

  function update(productId: string, change: Partial<CartLine>) {
    setLines((current) =>
      current.map((line) =>
        line.productId === productId ? { ...line, ...change } : line,
      ),
    );
    setErrors((current) => ({ ...current, [productId]: "" }));
  }

  const total = cartTotal(lines);
  const clientName =
    client?.name ??
    clientSearch.options.find((option) => option.id === clientId)?.name ??
    "";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateCart(lines);
    setErrors(found);
    if (!clientId) setClientError("Escolha o cliente.");
    if (!clientId || Object.keys(found).length > 0) return;

    startTransition(async () => {
      const result = await createProductSaleAction({
        clientId,
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: Number(line.quantity),
          unitPrice: Number(line.unitPrice) / 100,
        })),
      });
      if (result.ok) {
        toast.success("Venda lançada.", {
          description: `${clientName}: ${formatPrice(total)}. Receba na comanda de hoje.`,
        });
        onClose();
        return;
      }
      toast.error("Não foi possível lançar a venda.", {
        description: result.message,
      });
    });
  }

  const inCart = new Set(lines.map((line) => line.productId));

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{client ? "Adicionar produto" : "Nova venda"}</DialogTitle>
        <DialogDescription>
          {client
            ? `Venda para ${client.name}. O valor entra na comanda de hoje.`
            : "Escolha o cliente e os produtos. O valor entra na comanda de hoje."}
        </DialogDescription>
      </DialogHeader>

      {!client && (
        <FormField
          id="sale-client"
          label="Cliente"
          required
          error={clientError}
        >
          <Combobox
            id="sale-client"
            options={clientSearch.options.map((option) => ({
              value: option.id,
              label: option.name,
            }))}
            value={clientId}
            onValueChange={(next) => {
              clientSearch.pick(next);
              setClientId(next);
              setClientError(undefined);
            }}
            placeholder="Escolha o cliente"
            searchPlaceholder="Buscar cliente…"
            emptyMessage="Nenhum cliente encontrado."
            loading={clientSearch.loading}
            onSearchChange={clientSearch.search}
          />
        </FormField>
      )}

      <section className="space-y-2" aria-labelledby="sale-products">
        <h3 id="sale-products" className="text-sm font-medium">
          Produtos
        </h3>
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={term}
            onChange={(event) => {
              setTerm(event.target.value);
              search(event.target.value);
            }}
            aria-label="Buscar produto por nome ou SKU"
            placeholder="Buscar por nome ou SKU..."
            className="pl-9"
            autoComplete="off"
          />
        </div>
        <ul className="max-h-48 divide-y divide-border overflow-y-auto rounded-control border border-border">
          {results === null ? (
            <li className="space-y-2 p-3" aria-label="Buscando…">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </li>
          ) : results.length === 0 ? (
            <li className="p-3 text-sm text-muted-foreground">
              Nenhum produto ativo encontrado.
            </li>
          ) : (
            results.map((product) => {
              const added = inCart.has(product.id);
              const empty = product.currentStock === 0;
              return (
                <li
                  key={product.id}
                  className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-sm"
                >
                  <span className="min-w-40 flex-1">
                    <span className="font-medium">{product.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      {product.sku ? `SKU ${product.sku}, ` : ""}
                      {product.currentStock} em estoque
                    </span>
                  </span>
                  <span className="text-right tabular-nums">
                    {formatPrice(suggestedPrice(product))}
                    {product.promotionalPrice && (
                      <span className="block text-xs text-muted-foreground">
                        Promoção
                      </span>
                    )}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={added || empty}
                    onClick={() => add(product)}
                  >
                    <Plus aria-hidden="true" />
                    {added ? "Adicionado" : empty ? "Sem estoque" : "Adicionar"}
                  </Button>
                </li>
              );
            })
          )}
        </ul>
      </section>

      {lines.length > 0 && (
        <section className="space-y-2" aria-labelledby="sale-cart">
          <h3 id="sale-cart" className="text-sm font-medium">
            Nesta venda
          </h3>
          <ul className="divide-y divide-border rounded-control border border-border">
            {lines.map((line) => (
              <li key={line.productId} className="space-y-1 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span className="min-w-36 flex-1 font-medium">
                    {line.name}
                  </span>
                  <MaskedInput
                    mask={maskStock}
                    value={line.quantity}
                    onValueChange={(digits) =>
                      update(line.productId, { quantity: digits })
                    }
                    inputMode="numeric"
                    aria-label={`Quantidade de ${line.name}`}
                    aria-invalid={errors[line.productId] ? true : undefined}
                    className="w-20"
                  />
                  <MaskedInput
                    mask={maskCurrency}
                    value={line.unitPrice}
                    onValueChange={(digits) =>
                      update(line.productId, { unitPrice: digits })
                    }
                    inputMode="numeric"
                    aria-label={`Valor por unidade de ${line.name}`}
                    className="w-32"
                  />
                  <span className="w-24 text-right tabular-nums">
                    {formatPrice(
                      ((Number(line.quantity) || 0) *
                        (Number(line.unitPrice) || 0)) /
                        100,
                    )}
                  </span>
                  <Hint label={`Remover ${line.name}`}>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remover ${line.name}`}
                      onClick={() =>
                        setLines((current) =>
                          current.filter(
                            (item) => item.productId !== line.productId,
                          ),
                        )
                      }
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </Hint>
                </div>
                {errors[line.productId] && (
                  <p role="alert" className="text-xs text-destructive">
                    {errors[line.productId]}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between text-base font-semibold tabular-nums">
            <span>Total da venda</span>
            <span>{formatPrice(total)}</span>
          </div>
        </section>
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
        <Button type="submit" disabled={pending || lines.length === 0}>
          <ShoppingBag aria-hidden="true" />
          {pending ? "Lançando…" : "Lançar venda"}
        </Button>
      </DialogFooter>
    </form>
  );
}

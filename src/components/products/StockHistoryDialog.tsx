"use client";

import { ChevronsDown, RotateCcw, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { listStockMovementsAction } from "@/app/(admin)/product-actions";
import { MOVEMENT_LABELS, signed } from "@/components/products/stock-movements";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product, StockMovement } from "@/types/product";
import { formatPrice } from "@/utils/format";

type StockHistoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  /** Fuso da empresa: a data e a hora do lançamento ficam no horário dela. */
  timeZone: string;
};

/** Histórico de estoque do produto, do lançamento mais recente para o mais antigo. */
export function StockHistoryDialog({
  open,
  onOpenChange,
  product,
  timeZone,
}: StockHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90dvh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Histórico de estoque</DialogTitle>
          <DialogDescription>
            {product.name}: {product.currentStock} em estoque.
          </DialogDescription>
        </DialogHeader>
        {/* key: outro produto refaz a busca do zero. */}
        <History key={product.id} productId={product.id} timeZone={timeZone} />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X aria-hidden="true" />
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function History({
  productId,
  timeZone,
}: {
  productId: string;
  timeZone: string;
}) {
  const [items, setItems] = useState<StockMovement[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function load(nextPage: number) {
    startTransition(async () => {
      const result = await listStockMovementsAction(productId, nextPage);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setError(undefined);
      setPage(nextPage);
      setTotal(result.page.total);
      setItems((current) =>
        nextPage === 1
          ? result.page.items
          : [...(current ?? []), ...result.page.items],
      );
    });
  }

  // Busca ao abrir (o dialog só monta este conteúdo aberto).
  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dateTime = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone,
  });

  if (error && items === null) {
    return (
      <div role="alert" className="space-y-3 text-sm">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => load(1)} disabled={pending}>
          <RotateCcw aria-hidden="true" />
          Tentar de novo
        </Button>
      </div>
    );
  }
  if (items === null) {
    return (
      <div className="space-y-3" aria-label="Buscando…">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      <ul className="divide-y divide-border rounded-control border border-border">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 p-3 text-sm"
          >
            <div className="min-w-0 space-y-0.5">
              <p className="font-medium">{MOVEMENT_LABELS[item.type]}</p>
              <p className="text-xs text-muted-foreground">
                {dateTime.format(new Date(item.createdAt))}
                {item.createdBy
                  ? `, por ${item.createdBy.name}`
                  : ", antes do controle de estoque"}
              </p>
              {item.unitCost && (
                <p className="text-xs text-muted-foreground">
                  Custo {formatPrice(item.unitCost)} por unidade
                </p>
              )}
              {item.payable && (
                <p className="text-xs text-muted-foreground">
                  Conta a pagar: {item.payable.description}
                </p>
              )}
              {item.note && <p className="text-xs">{item.note}</p>}
            </div>
            <div className="shrink-0 text-right tabular-nums">
              <p
                className={
                  item.quantity < 0
                    ? "font-medium text-destructive dark:text-red-400"
                    : "font-medium"
                }
              >
                {signed(item.quantity)}
              </p>
              <p className="text-xs text-muted-foreground">
                Saldo {item.balanceAfter}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {items.length < total && (
        <Button
          variant="ghost"
          className="mt-2 w-full"
          disabled={pending}
          onClick={() => load(page + 1)}
        >
          <ChevronsDown aria-hidden="true" />
          {pending ? "Buscando…" : "Carregar mais"}
        </Button>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

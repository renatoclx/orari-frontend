"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import {
  Ban,
  EllipsisVertical,
  Eye,
  Pencil,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteProductAction,
  setProductActiveAction,
} from "@/app/(admin)/product-actions";
import { useCan } from "@/components/layout/Access";
import {
  MarginValue,
  ProductDetails,
} from "@/components/products/ProductDetails";
import { ProductPhoto } from "@/components/products/ProductPhoto";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Product } from "@/types/product";
import { formatPrice } from "@/utils/format";

type ProductListProps = {
  products: Product[];
  /** Há busca ou filtro: a lista vazia diz que nada foi encontrado. */
  filtered: boolean;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
};

type RowHandlers = {
  onView: (product: Product) => void;
  onDeactivate: (product: Product) => void;
  onRestore: (product: Product) => void;
  onDelete: (product: Product) => void;
  /** Há uma reativação em andamento. */
  busy: boolean;
};

// Coluna Ações (screen-patterns.md): Alterar à vista; Visualizar, Inativar ou
// Reativar e Excluir no menu de três pontos.
function ProductActions({
  product,
  onView,
  onDeactivate,
  onRestore,
  onDelete,
  busy,
}: { product: Product } & RowHandlers) {
  const canEdit = useCan("products", "edit");
  const canRemove = useCan("products", "remove");
  return (
    <div className="flex shrink-0 items-center gap-1">
      {canEdit && (
        <Hint label={`Alterar ${product.name}`}>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={`Alterar ${product.name}`}
          >
            <Link href={`/produtos/${product.id}/editar`}>
              <Pencil aria-hidden="true" />
            </Link>
          </Button>
        </Hint>
      )}

      {/* modal={false}: o menu fecha antes do diálogo abrir, sem travar a página. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Hint label={`Mais ações para ${product.name}`}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Mais ações para ${product.name}`}
            >
              <EllipsisVertical aria-hidden="true" />
            </Button>
          </Hint>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onView(product)}>
            <Eye aria-hidden="true" />
            Visualizar
          </DropdownMenuItem>
          {canRemove && (
            <>
              {product.isActive ? (
                <DropdownMenuItem onSelect={() => onDeactivate(product)}>
                  <Ban aria-hidden="true" />
                  Inativar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  disabled={busy}
                  onSelect={() => onRestore(product)}
                >
                  <RotateCcw aria-hidden="true" />
                  Reativar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={() => onDelete(product)}>
                <Trash2 aria-hidden="true" />
                Excluir
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Preço de venda e, abaixo, o promocional quando houver.
function Prices({ product }: { product: Product }) {
  return (
    <div className="tabular-nums">
      <p className="whitespace-nowrap">{formatPrice(product.salePrice)}</p>
      {product.promotionalPrice && (
        <p className="text-xs whitespace-nowrap text-muted-foreground">
          Promoção {formatPrice(product.promotionalPrice)}
        </p>
      )}
    </div>
  );
}

// Foto, nome e SKU: o SKU fica abaixo do nome, em texto menor.
function NameCell({ product }: { product: Product }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <ProductPhoto photoUrl={product.photoUrl} />
      <div className="min-w-0">
        <p className="font-medium">{product.name}</p>
        {product.sku && (
          <p className="text-xs text-muted-foreground">SKU {product.sku}</p>
        )}
      </div>
    </div>
  );
}

/** Card da listagem: tabela (computador) ou lista empilhada (celular). */
export function ProductList({ products, filtered, footer }: ProductListProps) {
  const [viewing, setViewing] = useState<Product | null>(null);
  const [deactivating, setDeactivating] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [pending, startTransition] = useTransition();
  const [restoring, startRestore] = useTransition();

  function confirmDeactivate() {
    if (!deactivating) return;
    const target = deactivating;
    startTransition(async () => {
      const result = await setProductActiveAction(target.id, false);
      if (result.ok) {
        toast.success("Produto inativado.", { description: target.name });
        setDeactivating(null);
      } else {
        toast.error("Não foi possível inativar o produto.", {
          description: result.message,
        });
      }
    });
  }

  function restore(product: Product) {
    startRestore(async () => {
      const result = await setProductActiveAction(product.id, true);
      if (result.ok) {
        toast.success("Produto reativado.", { description: product.name });
      } else {
        // Ex.: a categoria do produto está inativa (400).
        toast.error("Não foi possível reativar o produto.", {
          description: result.message,
        });
      }
    });
  }

  function confirmDelete() {
    if (!deleting) return;
    const target = deleting;
    startTransition(async () => {
      const result = await deleteProductAction(target.id);
      if (result.ok) {
        toast.success("Produto excluído.", { description: target.name });
        setDeleting(null);
      } else {
        toast.error("Não foi possível excluir o produto.", {
          description: result.message,
        });
      }
    });
  }

  const handlers: RowHandlers = {
    onView: setViewing,
    onDeactivate: setDeactivating,
    onRestore: restore,
    onDelete: setDeleting,
    busy: restoring,
  };

  return (
    <ListCard
      columns={[
        "Produto",
        "Categoria",
        "Preço de venda",
        "Margem",
        "Estoque",
        "Status",
        "Ações",
      ]}
      emptyMessage={
        products.length === 0
          ? filtered
            ? "Nenhum produto encontrado com esses filtros."
            : "Nenhum produto cadastrado. Cadastre o primeiro!"
          : undefined
      }
      cards={products.map((product) => (
        <li key={product.id} className="space-y-2 p-4">
          <div className="flex items-center justify-between gap-2">
            <NameCell product={product} />
            <ProductActions product={product} {...handlers} />
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
            <dt className="text-muted-foreground">Categoria</dt>
            <dd>{product.category.name}</dd>
            <dt className="text-muted-foreground">Preço de venda</dt>
            <dd>
              <Prices product={product} />
            </dd>
            <dt className="text-muted-foreground">Margem</dt>
            <dd className="tabular-nums">
              <MarginValue margin={product.profitMargin} />
            </dd>
            <dt className="text-muted-foreground">Estoque</dt>
            <dd className="tabular-nums">{product.currentStock}</dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <StatusBadge active={product.isActive} />
            </dd>
          </dl>
        </li>
      ))}
      rows={products.map((product) => (
        <tr key={product.id} className="hover:bg-background">
          <td className="px-4 py-3">
            <NameCell product={product} />
          </td>
          <td className="px-4 py-3">{product.category.name}</td>
          <td className="px-4 py-3">
            <Prices product={product} />
          </td>
          <td className="px-4 py-3 tabular-nums">
            <MarginValue margin={product.profitMargin} />
          </td>
          <td className="px-4 py-3 tabular-nums">{product.currentStock}</td>
          <td className="px-4 py-3">
            <StatusBadge active={product.isActive} />
          </td>
          <td className="px-4 py-2">
            <ProductActions product={product} {...handlers} />
          </td>
        </tr>
      ))}
      footer={footer}
    >
      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent className="sm:max-w-lg">
          {viewing && <ProductDetails product={viewing} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              <X aria-hidden="true" />
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title="Inativar produto?"
        description={`${deactivating?.name ?? ""} ficará inativo. Você poderá reativá-lo depois.`}
        confirmLabel="Inativar"
        pendingLabel="Inativando…"
        icon={Ban}
        pending={pending}
        onConfirm={confirmDeactivate}
      />

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir produto?"
        description={`${deleting?.name ?? ""} sairá da lista de produtos, e o SKU dele ficará livre para outro produto. Não dá para desfazer.`}
        confirmLabel="Excluir"
        pendingLabel="Excluindo…"
        icon={Trash2}
        destructive
        pending={pending}
        onConfirm={confirmDelete}
      />
    </ListCard>
  );
}

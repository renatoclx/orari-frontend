import { ProductPhoto } from "@/components/products/ProductPhoto";
import {
  formatMargin,
  isNegativeMargin,
} from "@/components/products/product-pricing";
import { unitLabel } from "@/components/products/product-units";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { StatusBadge } from "@/components/shared/StatusBadge";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Product } from "@/types/product";
import { formatPrice } from "@/utils/format";

const termClass = "text-muted-foreground";

/** Conteúdo do dialog Visualizar: todos os dados do produto. */
export function ProductDetails({ product }: { product: Product }) {
  const optionalPrice = product.promotionalPrice
    ? formatPrice(product.promotionalPrice)
    : null;
  return (
    <>
      <DialogHeader className="flex-row items-center gap-3 space-y-0">
        <ProductPhoto photoUrl={product.photoUrl} size="lg" />
        <div className="min-w-0 space-y-1 text-left">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            <EmptyValue>{product.description}</EmptyValue>
          </DialogDescription>
        </div>
      </DialogHeader>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className={termClass}>SKU</dt>
        <dd>
          <EmptyValue>{product.sku}</EmptyValue>
        </dd>
        <dt className={termClass}>Categoria</dt>
        <dd>{product.category.name}</dd>
        <dt className={termClass}>Fornecedor</dt>
        <dd>
          <EmptyValue>{product.supplier?.name}</EmptyValue>
        </dd>
        <dt className={termClass}>Unidade de medida</dt>
        <dd>
          <EmptyValue>{unitLabel(product.measureUnit)}</EmptyValue>
        </dd>
        <dt className={termClass}>Preço de venda</dt>
        <dd className="tabular-nums">{formatPrice(product.salePrice)}</dd>
        <dt className={termClass}>Preço de custo</dt>
        <dd className="tabular-nums">{formatPrice(product.purchasePrice)}</dd>
        <dt className={termClass}>Preço promocional</dt>
        <dd className="tabular-nums">
          <EmptyValue>{optionalPrice}</EmptyValue>
        </dd>
        <dt className={termClass}>Margem de lucro</dt>
        <dd className="tabular-nums">
          <MarginValue margin={product.profitMargin} />
        </dd>
        <dt className={termClass}>Estoque atual</dt>
        <dd className="tabular-nums">{product.currentStock}</dd>
        <dt className={termClass}>Estoque mínimo</dt>
        <dd className="tabular-nums">
          <EmptyValue>{product.minimalStock?.toString()}</EmptyValue>
        </dd>
        <dt className={termClass}>Estoque máximo</dt>
        <dd className="tabular-nums">
          <EmptyValue>{product.maximumStock?.toString()}</EmptyValue>
        </dd>
        <dt className={termClass}>Status</dt>
        <dd>
          <StatusBadge active={product.isActive} />
        </dd>
      </dl>
    </>
  );
}

/** Margem negativa (custo acima da venda) em vermelho, como as informações negativas. */
export function MarginValue({ margin }: { margin: string | number }) {
  return (
    <span
      className={
        isNegativeMargin(margin)
          ? "font-medium text-destructive dark:text-red-400"
          : undefined
      }
    >
      {formatMargin(margin)}
    </span>
  );
}

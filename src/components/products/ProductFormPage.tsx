import { notFound } from "next/navigation";
import { ProductForm, type Option } from "@/components/products/ProductForm";
import { ApiError } from "@/services/api";
import { listPeople } from "@/services/people.service";
import { listProductCategories } from "@/services/product-category.service";
import { getProduct } from "@/services/product.service";

// Opções de categoria e fornecedor (a API aceita até 100).
const LOOKUP_LIMIT = 100;

// Na lista de escolha, a opção atual que foi inativada depois continua
// aparecendo (marcada como inativa), para o campo não ficar vazio.
function withCurrent(
  options: Option[],
  current: { id: string; name: string } | null | undefined,
  inactiveLabel: string,
): Option[] {
  if (!current || options.some((option) => option.id === current.id)) {
    return options;
  }
  return [
    ...options,
    { id: current.id, name: `${current.name} ${inactiveLabel}` },
  ];
}

/** Cadastro e alteração de produto: busca as opções (e o produto) e entrega ao formulário. */
export async function ProductFormPage({ id }: { id?: string }) {
  const [categories, suppliers, product] = await Promise.all([
    // Produto não entra em categoria inativa.
    listProductCategories({ isActive: true, page: 1, limit: LOOKUP_LIMIT }),
    listPeople({
      type: "SUPPLIER",
      isActive: true,
      page: 1,
      limit: LOOKUP_LIMIT,
    }),
    id
      ? getProduct(id).catch((error: unknown) => {
          if (error instanceof ApiError && error.status === 404) notFound();
          throw error;
        })
      : undefined,
  ]);
  const pick = ({ id, name }: Option) => ({ id, name });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {product ? "Alterar produto" : "Novo produto"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {product
            ? `Atualize os dados de ${product.name}.`
            : "Cadastre o produto com os preços e o estoque."}
        </p>
      </div>

      <ProductForm
        product={product}
        categories={withCurrent(
          categories.items.map(pick),
          product?.category,
          "(inativa)",
        )}
        suppliers={withCurrent(
          suppliers.items.map(pick),
          product?.supplier,
          "(inativo)",
        )}
      />
    </div>
  );
}

import { PaymentMethodList } from "@/components/payment-methods/PaymentMethodList";
import { PaymentMethodsToolbar } from "@/components/payment-methods/PaymentMethodsToolbar";
import { TablePagination } from "@/components/shared/TablePagination";
import { listPaymentMethods } from "@/services/payment-method.service";

// Itens por página da listagem.
const PAGE_SIZE = 10;
const BASE_PATH = "/financeiro/metodos-de-pagamento";

type PaymentMethodsListPageProps = {
  /** searchParams da rota (?q= e ?page=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Listagem de métodos de pagamento: renderizada no servidor, com busca e página pela URL.
export async function PaymentMethodsListPage({
  searchParams,
}: PaymentMethodsListPageProps) {
  const search =
    typeof searchParams.q === "string" ? searchParams.q.trim() : "";
  const page = Math.max(1, Number(searchParams.page) || 1);

  const result = await listPaymentMethods({
    name: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Métodos de pagamento</h1>
      <PaymentMethodsToolbar search={search} />
      <PaymentMethodList
        methods={result.items}
        search={search}
        footer={
          <TablePagination
            page={page}
            limit={PAGE_SIZE}
            total={result.total}
            basePath={BASE_PATH}
            query={{ q: search || undefined }}
          />
        }
      />
    </div>
  );
}

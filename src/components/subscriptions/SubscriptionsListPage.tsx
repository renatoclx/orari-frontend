import { notFound } from "next/navigation";
import { SubscriptionList } from "@/components/subscriptions/SubscriptionList";
import { SubscriptionsToolbar } from "@/components/subscriptions/SubscriptionsToolbar";
import { SUBSCRIPTION_FILTERS } from "@/components/subscriptions/subscription-filters";
import { getCurrentUser } from "@/services/auth.service";
import { listSubscriptions } from "@/services/subscription.service";

type SubscriptionsListPageProps = {
  /** searchParams da rota (?situacao=). */
  searchParams: Record<string, string | string[] | undefined>;
};

// Assinaturas (screens/assinaturas.md): só o SUPER_ADMIN; os demais veem 404.
// A API traz todas as empresas de uma vez (são poucas); o filtro de situação
// é aplicado aqui, no servidor.
export async function SubscriptionsListPage({
  searchParams,
}: SubscriptionsListPageProps) {
  const currentUser = await getCurrentUser();
  if (currentUser.type !== "SUPER_ADMIN") notFound();

  const filter =
    SUBSCRIPTION_FILTERS.find((item) => item.id === searchParams.situacao) ??
    SUBSCRIPTION_FILTERS[0];
  const items = (await listSubscriptions()).filter(filter.matches);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Assinaturas</h1>
        <p className="text-sm text-muted-foreground">
          Plano, valor e situação de cada empresa.
        </p>
      </div>
      <SubscriptionsToolbar filter={filter.id} />
      <SubscriptionList
        items={items}
        filtered={filter.id !== SUBSCRIPTION_FILTERS[0].id}
      />
    </div>
  );
}

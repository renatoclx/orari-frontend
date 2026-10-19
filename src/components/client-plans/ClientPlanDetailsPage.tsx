import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ClientPlanDetails } from "@/components/client-plans/ClientPlanDetails";
import { ApiError } from "@/services/api";
import { getCurrentUser } from "@/services/auth.service";
import { getClientPlan } from "@/services/client-plan.service";
import { listClientPlanPayments } from "@/services/payment.service";

// Detalhes de uma contratação: busca a contratação e as parcelas.
export async function ClientPlanDetailsPage({ id }: { id: string }) {
  // Instante em que a página foi montada: o relógio da tela começa nele.
  const renderedAt = new Date();
  const [{ company }, item, payments] = await Promise.all([
    getCurrentUser(),
    getClientPlan(id),
    listClientPlanPayments(id),
  ]).catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <Link
          href="/pacotes/contratacoes"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Contratações
        </Link>
        <h1 className="text-2xl font-semibold">Contratação</h1>
      </div>

      <ClientPlanDetails
        item={item}
        payments={payments}
        timeZone={company.timezone}
        serverNow={renderedAt.getTime()}
      />
    </div>
  );
}

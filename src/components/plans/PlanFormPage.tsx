import { notFound } from "next/navigation";
import { PlanForm } from "@/components/plans/PlanForm";
import { toCents } from "@/components/plans/plan-pricing";
import { ApiError } from "@/services/api";
import { getPlan } from "@/services/plan.service";
import { listServices } from "@/services/service.service";

type PlanFormPageProps = {
  /** Na alteração, o plano; sem ele, é o cadastro. */
  id?: string;
};

// Cadastro e alteração de plano: busca os serviços ativos (e o plano, na
// alteração) e entrega ao formulário.
export async function PlanFormPage({ id }: PlanFormPageProps) {
  const [services, plan] = await Promise.all([
    listServices({ page: 1, limit: 100 }),
    id
      ? getPlan(id).catch((error: unknown) => {
          if (error instanceof ApiError && error.status === 404) notFound();
          throw error;
        })
      : undefined,
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {plan ? "Alterar plano" : "Novo plano"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {plan
            ? `Atualize os dados de ${plan.name}. Contratações já feitas não mudam.`
            : "Monte o pacote de serviços, o valor mensal e os períodos de contratação."}
        </p>
      </div>

      <PlanForm
        plan={plan}
        services={services.items.map((service) => ({
          id: service.id,
          name: service.name,
          isActive: service.isActive,
          // Preço avulso em centavos: referência para o valor do plano.
          priceCents: service.price === null ? null : toCents(service.price),
        }))}
      />
    </div>
  );
}

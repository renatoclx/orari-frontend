import { ClientPlanForm } from "@/components/client-plans/ClientPlanForm";
import { toCents } from "@/components/plans/plan-pricing";
import { getCurrentUser } from "@/services/auth.service";
import { listPeople } from "@/services/people.service";
import { listPlans } from "@/services/plan.service";
import { listServices } from "@/services/service.service";
import { timeToMinutes, toDateString, toTimeString } from "@/utils/time";

// Tela de nova contratação: carrega as opções no servidor.
export async function NewClientPlanPage() {
  const { company } = await getCurrentUser();
  const now = new Date();

  const [clients, professionals, plans, services] = await Promise.all([
    // RASCUNHO: primeiros 100 clientes; o campo busca o restante pelo nome.
    listPeople({ type: "CLIENT", page: 1, limit: 100 }),
    listPeople({ type: "PROFESSIONAL", page: 1, limit: 100 }),
    listPlans({ isActive: true, page: 1, limit: 100 }),
    listServices({ page: 1, limit: 100 }),
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Nova contratação</h1>
        <p className="text-sm text-muted-foreground">
          Contrate um plano para o cliente: as agendas e os pagamentos são
          gerados de uma vez.
        </p>
      </div>

      <ClientPlanForm
        clients={clients.items
          .filter((item) => item.deletedAt === null)
          .map((item) => ({ id: item.id, name: item.name }))}
        // Contratável: ativo, com período e com todos os serviços ativos.
        plans={plans.items.filter(
          (plan) =>
            plan.periods.length > 0 &&
            plan.services.every((service) => service.isActive),
        )}
        professionals={professionals.items
          .filter((item) => item.deletedAt === null)
          .map((item) => ({ id: item.id, name: item.name }))
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))}
        services={Object.fromEntries(
          services.items.map((service) => [
            service.id,
            {
              duration: service.duration,
              priceCents:
                service.price === null ? null : toCents(service.price),
            },
          ]),
        )}
        today={toDateString(now, company.timezone)}
        nowMinutes={timeToMinutes(
          toTimeString(now.toISOString(), company.timezone),
        )}
      />
    </div>
  );
}

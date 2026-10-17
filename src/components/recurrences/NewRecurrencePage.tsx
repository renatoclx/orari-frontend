import { RecurrenceForm } from "@/components/recurrences/RecurrenceForm";
import { getCurrentUser } from "@/services/auth.service";
import { listPeople } from "@/services/people.service";
import { listServices } from "@/services/service.service";
import { timeToMinutes, toDateString, toTimeString } from "@/utils/time";

// Tela de cadastro de recorrência: carrega as opções dos campos no servidor.
export async function NewRecurrencePage() {
  const { company } = await getCurrentUser();
  const now = new Date();

  const [clients, professionals, services] = await Promise.all([
    // RASCUNHO: primeiros 100 clientes; o campo busca o restante pelo nome.
    listPeople({ type: "CLIENT", page: 1, limit: 100 }),
    listPeople({ type: "PROFESSIONAL", page: 1, limit: 100 }),
    listServices({ page: 1, limit: 100 }),
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Nova Recorrência</h1>
        <p className="text-sm text-muted-foreground">
          Reserve horários fixos na semana para um cliente, por um período.
        </p>
      </div>

      <RecurrenceForm
        clients={clients.items
          .filter((item) => item.deletedAt === null)
          .map((item) => ({ id: item.id, name: item.name }))}
        professionals={professionals.items
          .filter((item) => item.deletedAt === null)
          .map((item) => ({ id: item.id, name: item.name }))
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))}
        services={services.items
          .filter((item) => item.isActive && item.price !== null)
          .map((item) => ({
            id: item.id,
            name: item.name,
            duration: item.duration,
            color: item.color,
          }))}
        today={toDateString(now, company.timezone)}
        nowMinutes={timeToMinutes(
          toTimeString(now.toISOString(), company.timezone),
        )}
      />
    </div>
  );
}

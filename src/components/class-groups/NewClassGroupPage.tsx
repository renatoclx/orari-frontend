import { notFound } from "next/navigation";
import { ClassGroupForm } from "@/components/class-groups/ClassGroupForm";
import { getCurrentUser } from "@/services/auth.service";
import { listPeople } from "@/services/people.service";
import { listServices } from "@/services/service.service";

// Tela de cadastro de turma (só ADMIN): carrega as opções dos campos no servidor.
export async function NewClassGroupPage() {
  const currentUser = await getCurrentUser();
  if (currentUser.type !== "ADMIN") notFound();

  const [professionals, services] = await Promise.all([
    listPeople({ type: "PROFESSIONAL", page: 1, limit: 100 }),
    // A API de serviços não filtra por "aceita turma": o filtro é feito aqui.
    listServices({ page: 1, limit: 100 }),
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Nova Turma</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre um horário fixo da semana em que vários clientes são
          atendidos juntos.
        </p>
      </div>

      <ClassGroupForm
        services={services.items
          .filter((item) => item.isActive && item.allowsClasses)
          .map((item) => ({
            id: item.id,
            name: item.name,
            duration: item.duration,
          }))}
        professionals={professionals.items
          .filter((item) => item.deletedAt === null)
          .map((item) => ({ id: item.id, name: item.name }))
          .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))}
      />
    </div>
  );
}

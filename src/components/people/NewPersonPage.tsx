import { PersonForm } from "@/components/people/PersonForm";
import type { PeopleKind } from "@/components/people/people-kinds";
import { listStates } from "@/services/location.service";

type NewPersonPageProps = {
  kind: PeopleKind;
};

// Tela de cadastro de uma pessoa do tipo informado.
export async function NewPersonPage({ kind }: NewPersonPageProps) {
  // Os 27 estados vão prontos para o formulário; as cidades são buscadas
  // conforme o estado escolhido.
  const states = await listStates();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Cadastrar {kind.singular}</h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados para adicionar um novo {kind.singular} à sua
          empresa.
        </p>
      </div>

      <PersonForm kind={kind} states={states} />
    </div>
  );
}

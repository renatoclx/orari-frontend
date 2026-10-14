import type { Metadata } from "next";
import { ClientForm } from "@/components/clients/ClientForm";
import { listStates } from "@/services/location.service";

export const metadata: Metadata = {
  title: "Cadastrar cliente | Orari",
};

export default async function NewClientPage() {
  // Os 27 estados vão prontos para o formulário; as cidades são buscadas
  // conforme o estado escolhido.
  const states = await listStates();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Cadastrar cliente</h1>
        <p className="text-sm text-muted-foreground">
          Preencha os dados para adicionar um novo cliente à sua empresa.
        </p>
      </div>

      <ClientForm states={states} />
    </div>
  );
}

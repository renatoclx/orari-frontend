import { ClientList } from "@/components/clients/ClientList";
import { ClientsToolbar } from "@/components/clients/ClientsToolbar";
import { mockClients } from "@/components/clients/mock-data";

export default function ClientsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Clientes</h1>
      <ClientsToolbar />
      <ClientList clients={mockClients} />
    </div>
  );
}

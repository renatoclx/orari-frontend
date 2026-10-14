import { notFound } from "next/navigation";
import { PersonForm } from "@/components/people/PersonForm";
import type { PeopleKind } from "@/components/people/people-kinds";
import { ApiError } from "@/services/api";
import { listAddresses } from "@/services/address.service";
import { listContacts } from "@/services/contact.service";
import { getCity, listStates } from "@/services/location.service";
import { getPerson } from "@/services/people.service";

type EditPersonPageProps = {
  kind: PeopleKind;
  id: string;
};

// Tela de alteração: busca a pessoa, os contatos e os endereços e entrega ao
// formulário, que é o mesmo do cadastro.
export async function EditPersonPage({ kind, id }: EditPersonPageProps) {
  const [person, contacts, addresses, states] = await Promise.all([
    getPerson(id),
    listContacts(id),
    listAddresses(id),
    listStates(),
  ]).catch((error: unknown) => {
    // Inativa ou inexistente: a API responde 404.
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  });

  // A API devolve só o código da cidade; resolve o nome (uma busca por cidade).
  const cityIds = [...new Set(addresses.map((address) => address.cityId))];
  const cities = new Map(
    await Promise.all(
      cityIds.map(async (cityId) => [cityId, await getCity(cityId)] as const),
    ),
  );
  const acronyms = new Map(states.map((state) => [state.id, state.acronym]));

  const mainContact = contacts.find((contact) => contact.isPrincipal) ?? null;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Alterar {kind.singular}</h1>
        <p className="text-sm text-muted-foreground">
          Atualize os dados de {person.name}.
        </p>
      </div>

      <PersonForm
        kind={kind}
        states={states}
        editing={{
          person,
          mainContact,
          extraContacts: contacts.filter((contact) => contact !== mainContact),
          addresses: addresses.map((address) => {
            const city = cities.get(address.cityId);
            return {
              ...address,
              cityName: city?.name ?? "",
              stateAcronym: (city && acronyms.get(city.stateId)) ?? "",
            };
          }),
        }}
      />
    </div>
  );
}

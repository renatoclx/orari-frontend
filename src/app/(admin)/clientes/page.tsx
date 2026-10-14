import type { Metadata } from "next";
import { PeopleListPage } from "@/components/people/PeopleListPage";
import { PEOPLE_KINDS } from "@/components/people/people-kinds";

const kind = PEOPLE_KINDS.CLIENT;

export const metadata: Metadata = {
  title: `${kind.plural} | Orari`,
};

export default async function ClientsPage({
  searchParams,
}: PageProps<"/clientes">) {
  return <PeopleListPage kind={kind} searchParams={await searchParams} />;
}

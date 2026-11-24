import type { Metadata } from "next";
import { PeopleListPage } from "@/components/people/PeopleListPage";
import { PEOPLE_KINDS } from "@/components/people/people-kinds";
import { requireFeature } from "@/lib/require-feature";

const kind = PEOPLE_KINDS.SUPPLIER;

export const metadata: Metadata = {
  title: `${kind.plural} | Orari`,
};

export default async function SuppliersPage({
  searchParams,
}: PageProps<"/fornecedores">) {
  await requireFeature("suppliers");
  return <PeopleListPage kind={kind} searchParams={await searchParams} />;
}

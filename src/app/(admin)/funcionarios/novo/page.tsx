import type { Metadata } from "next";
import { NewPersonPage } from "@/components/people/NewPersonPage";
import { PEOPLE_KINDS } from "@/components/people/people-kinds";
import { requireFeature } from "@/lib/require-feature";

const kind = PEOPLE_KINDS.EMPLOYEE;

export const metadata: Metadata = {
  title: `Cadastrar ${kind.singular} | Orari`,
};

export default async function NewEmployeesPage() {
  await requireFeature("employees", "create");
  return <NewPersonPage kind={kind} />;
}

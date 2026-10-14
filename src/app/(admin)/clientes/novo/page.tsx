import type { Metadata } from "next";
import { NewPersonPage } from "@/components/people/NewPersonPage";
import { PEOPLE_KINDS } from "@/components/people/people-kinds";

const kind = PEOPLE_KINDS.CLIENT;

export const metadata: Metadata = {
  title: `Cadastrar ${kind.singular} | Orari`,
};

export default function NewClientsPage() {
  return <NewPersonPage kind={kind} />;
}

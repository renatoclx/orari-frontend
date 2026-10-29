import type { Metadata } from "next";
import { NewClassGroupPage } from "@/components/class-groups/NewClassGroupPage";

export const metadata: Metadata = {
  title: "Nova Turma | Orari",
};

export default function NewClassGroupRoute() {
  return <NewClassGroupPage />;
}

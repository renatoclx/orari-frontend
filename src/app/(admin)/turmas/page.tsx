import type { Metadata } from "next";
import { ClassGroupsListPage } from "@/components/class-groups/ClassGroupsListPage";

export const metadata: Metadata = {
  title: "Turmas | Orari",
};

export default async function ClassGroupsPage({
  searchParams,
}: PageProps<"/turmas">) {
  return <ClassGroupsListPage searchParams={await searchParams} />;
}

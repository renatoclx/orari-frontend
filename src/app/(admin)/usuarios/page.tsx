import type { Metadata } from "next";
import { UsersListPage } from "@/components/users/UsersListPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Usuários | Orari",
};

export default async function UsersPage({
  searchParams,
}: PageProps<"/usuarios">) {
  await requireFeature("users");
  return <UsersListPage searchParams={await searchParams} />;
}

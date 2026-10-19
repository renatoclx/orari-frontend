import type { Metadata } from "next";
import { UsersListPage } from "@/components/users/UsersListPage";

export const metadata: Metadata = {
  title: "Usuários | Orari",
};

export default async function UsersPage({
  searchParams,
}: PageProps<"/usuarios">) {
  return <UsersListPage searchParams={await searchParams} />;
}

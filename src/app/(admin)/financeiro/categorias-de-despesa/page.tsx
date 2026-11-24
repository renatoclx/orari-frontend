import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExpenseCategoriesListPage } from "@/components/expense-categories/ExpenseCategoriesListPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Categorias de despesa | Orari",
};

// Financeiro → Categorias de despesa: só o ADMIN (contas a pagar), com a
// funcionalidade no plano.
export default async function ExpenseCategoriesPage({
  searchParams,
}: PageProps<"/financeiro/categorias-de-despesa">) {
  const user = await requireFeature("expense-categories");
  if (user.type !== "ADMIN") notFound();
  return <ExpenseCategoriesListPage searchParams={await searchParams} />;
}

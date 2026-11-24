import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductsListPage } from "@/components/products/ProductsListPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Produtos | Orari",
};

// Produtos: só o ADMIN, com a funcionalidade liberada.
export default async function ProductsPage({
  searchParams,
}: PageProps<"/produtos">) {
  const user = await requireFeature("products");
  if (user.type !== "ADMIN") notFound();
  return <ProductsListPage searchParams={await searchParams} user={user} />;
}

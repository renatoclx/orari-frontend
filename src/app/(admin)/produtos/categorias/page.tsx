import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCategoriesListPage } from "@/components/product-categories/ProductCategoriesListPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Categorias de produto | Orari",
};

// Produtos → Categorias: só o ADMIN, com a funcionalidade liberada.
export default async function ProductCategoriesPage({
  searchParams,
}: PageProps<"/produtos/categorias">) {
  const user = await requireFeature("product-categories");
  if (user.type !== "ADMIN") notFound();
  return <ProductCategoriesListPage searchParams={await searchParams} />;
}

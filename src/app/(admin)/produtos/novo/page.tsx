import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductFormPage } from "@/components/products/ProductFormPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Novo produto | Orari",
};

export default async function NewProductRoute() {
  const user = await requireFeature("products", "create");
  if (user.type !== "ADMIN") notFound();
  return <ProductFormPage />;
}

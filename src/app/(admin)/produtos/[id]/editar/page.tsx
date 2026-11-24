import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductFormPage } from "@/components/products/ProductFormPage";
import { requireFeature } from "@/lib/require-feature";

export const metadata: Metadata = {
  title: "Alterar produto | Orari",
};

export default async function EditProductRoute({
  params,
}: PageProps<"/produtos/[id]/editar">) {
  const user = await requireFeature("products", "edit");
  if (user.type !== "ADMIN") notFound();
  const { id } = await params;
  return <ProductFormPage id={id} />;
}

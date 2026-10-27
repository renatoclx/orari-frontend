import "server-only";

import { notFound } from "next/navigation";
import { getCurrentUser } from "@/services/auth.service";
import { anamnesisAccess } from "@/utils/anamnesis-access";

/**
 * Páginas só do ADMIN (modelos de ficha e auditoria): os demais perfis veem 404,
 * como em Empresas. A API recusa (403) de qualquer forma.
 */
export async function requireAnamnesisAdmin() {
  const user = await getCurrentUser();
  if (!anamnesisAccess(user).isAdmin) notFound();
  return user;
}

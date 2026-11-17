import "server-only";

import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth.service";
import type { AccessAction } from "@/types/company-access";
import { canAccess } from "@/utils/access";

/**
 * Para as páginas de uma funcionalidade: quem não tem a ação liberada na
 * empresa vê "não encontrada", como em /empresas para quem não é SUPER_ADMIN.
 * O `getCurrentUser` é cacheado na requisição, então não custa outra chamada.
 */
export async function requireFeature(
  feature: string,
  action: AccessAction = "view",
) {
  const user = await getCurrentUser();
  // O SUPER_ADMIN só administra as empresas: qualquer tela da aplicação
  // (inclusive a inicial, para onde o login leva) o manda para o Painel.
  if (user.type === "SUPER_ADMIN") redirect("/painel");
  if (!canAccess(user.access, feature, action)) notFound();
  return user;
}

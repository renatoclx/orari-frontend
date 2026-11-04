import "server-only";

import { notFound } from "next/navigation";
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
  if (!canAccess(user.access, feature, action)) notFound();
  return user;
}

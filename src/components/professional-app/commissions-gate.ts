import "server-only";

import { notFound } from "next/navigation";
import { getProfessionalMe } from "@/services/app-pro.service";
import { getAppSessionKind } from "@/services/app-session";
import { canAccess } from "@/utils/access";

/**
 * Comissões é só do profissional e só de empresa com a funcionalidade
 * `commissions` no plano; fora disso a tela não existe (404). A API confere
 * de novo: aqui é para a tela não abrir vazia.
 */
export async function requireCommissions() {
  if ((await getAppSessionKind()) !== "professional") notFound();
  const me = await getProfessionalMe();
  if (!canAccess(me.access, "commissions")) notFound();
  return me;
}

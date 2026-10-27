import type { CurrentUser } from "@/types/auth";

/**
 * Quem usa a anamnese (espelha o `AnamnesisAccessService` do backend):
 * - `canAccess`: fichas dos clientes. O ADMIN, ou o usuário vinculado a um
 *   profissional ativo (`professional` do /auth/me). Os demais recebem 403.
 * - `isAdmin`: modelos de ficha e auditoria, só do ADMIN.
 *
 * É só conveniência de tela (esconder o que não vale): a API recusa de qualquer
 * forma. Funcionário vinculado não tem acesso (`professional` vem nulo).
 */
export function anamnesisAccess(
  user: Pick<CurrentUser, "type" | "professional">,
): {
  canAccess: boolean;
  isAdmin: boolean;
} {
  const isAdmin = user.type === "ADMIN";
  return { isAdmin, canAccess: isAdmin || user.professional !== null };
}

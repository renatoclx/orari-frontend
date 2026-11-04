import type { AccessAction } from "@/types/company-access";
import type { CurrentUser } from "@/types/auth";

/**
 * A empresa do usuário pode usar a funcionalidade (ver "Acessos e limites" em
 * screens/empresas.md)? É só conveniência de tela: a API barra de qualquer
 * forma. Sem o `access` (API antiga, ainda sem o recurso), nada é escondido.
 */
export function canAccess(
  access: CurrentUser["access"] | undefined,
  feature: string,
  action: AccessAction = "view",
): boolean {
  if (!access) return true;
  return (
    access.features.find((item) => item.feature === feature)?.[action] ?? false
  );
}

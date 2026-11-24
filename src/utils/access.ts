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

/**
 * Assinatura em somente leitura (screens/layout.md, "Aviso da assinatura"):
 * fica só o Visualiza de cada funcionalidade, e a tela esconde o que grava. A
 * API recusa as gravações de qualquer forma.
 */
export function withReadOnlyAccess<
  T extends Pick<CurrentUser, "access" | "subscription">,
>(user: T): T {
  if (!user.subscription?.readOnly || !user.access) return user;
  return {
    ...user,
    access: {
      features: user.access.features.map((item) => ({
        ...item,
        edit: false,
        create: false,
        remove: false,
      })),
    },
  };
}

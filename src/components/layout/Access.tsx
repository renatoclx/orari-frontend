"use client";

import { createContext, useContext } from "react";
import type { CurrentUser } from "@/types/auth";
import type { AccessAction } from "@/types/company-access";
import { canAccess } from "@/utils/access";

// O que a empresa do usuário tem liberado, lido de qualquer tela sem repassar
// prop. Só esconde botões e atalhos: a API barra de qualquer forma.
const AccessContext = createContext<CurrentUser["access"] | undefined>(
  undefined,
);

export function AccessProvider({
  access,
  children,
}: {
  access: CurrentUser["access"];
  children: React.ReactNode;
}) {
  return (
    <AccessContext.Provider value={access}>{children}</AccessContext.Provider>
  );
}

/** A empresa tem a ação liberada na funcionalidade? (sem o `access`, sim) */
export function useCan(feature: string, action: AccessAction = "view") {
  return canAccess(useContext(AccessContext), feature, action);
}

/** Mostra os filhos só quando a empresa tem a ação liberada. */
export function Can({
  feature,
  action = "view",
  children,
}: {
  feature: string;
  action?: AccessAction;
  children: React.ReactNode;
}) {
  return useCan(feature, action) ? children : null;
}

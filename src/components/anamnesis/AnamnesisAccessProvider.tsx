"use client";

import { createContext, useContext } from "react";

// Quem tem acesso às fichas, lido de qualquer tela sem repassar prop (o dialog
// do agendamento aparece na agenda, no histórico do cliente e no financeiro).
// Só esconde atalhos: a API recusa de qualquer forma.
const AnamnesisAccessContext = createContext(false);

export function AnamnesisAccessProvider({
  canAccess,
  children,
}: {
  canAccess: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnamnesisAccessContext.Provider value={canAccess}>
      {children}
    </AnamnesisAccessContext.Provider>
  );
}

export const useCanAccessAnamnesis = () => useContext(AnamnesisAccessContext);

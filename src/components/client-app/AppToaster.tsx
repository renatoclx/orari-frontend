"use client";

import { Toaster } from "@/components/ui/sonner";

// Distância do rodapé: com a barra de abas, logo acima dela (altura da barra,
// o gesto do iPhone e um respiro); sem barra (telas de entrar), só o respiro.
const WITH_NAV = "calc(4rem + 1px + env(safe-area-inset-bottom) + 12px)";
const WITHOUT_NAV = "calc(16px + env(safe-area-inset-bottom))";

/**
 * Toaster do app (cliente e profissional), no rodapé. É montado dentro da área
 * escura do app para herdar as cores dele; o toaster da clínica não aparece no
 * `/app` (ver AppToaster do layout raiz), senão cada aviso sairia duas vezes.
 */
export function AppToaster({ withNav = false }: { withNav?: boolean }) {
  const bottom = withNav ? WITH_NAV : WITHOUT_NAV;
  return (
    <Toaster
      theme="dark"
      position="bottom-center"
      closeButton
      offset={{ bottom }}
      mobileOffset={{ bottom, left: 16, right: 16 }}
    />
  );
}

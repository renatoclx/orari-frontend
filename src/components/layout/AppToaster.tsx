"use client";

import { useSyncExternalStore } from "react";
import { Toaster } from "@/components/ui/sonner";

const MOBILE_QUERY = "(max-width: 767px)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(MOBILE_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

// Toasts da aplicação: canto superior direito no computador e rodapé
// centralizado no celular, com cor e ícone próprios por tipo (richColors).
export function AppToaster() {
  const isMobile = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );

  return (
    <Toaster
      position={isMobile ? "bottom-center" : "top-right"}
      richColors
      closeButton
    />
  );
}

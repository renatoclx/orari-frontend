"use client";

import { useEffect } from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Tempo para os gráficos medirem a largura e desenharem antes da impressão.
const RENDER_DELAY_MS = 600;

/**
 * Versão de impressão: força o tema claro (papel branco), abre a impressão do
 * navegador ao carregar e mostra, só na tela, os botões de imprimir de novo e
 * fechar a aba. A preferência de tema do usuário não muda: só a classe desta
 * aba sai.
 */
export function AutoPrint() {
  useEffect(() => {
    const root = document.documentElement;
    const forceLight = () => {
      if (root.classList.contains("dark")) root.classList.remove("dark");
      root.style.colorScheme = "light";
    };
    forceLight();
    // O provedor de tema aplica a classe depois deste efeito (o efeito do pai
    // roda depois do filho): enquanto a aba existir, a classe volta a sair.
    const observer = new MutationObserver(forceLight);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    const timer = window.setTimeout(() => window.print(), RENDER_DELAY_MS);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="flex justify-end gap-2 print:hidden">
      <Button
        variant="outline"
        className="w-auto"
        onClick={() => window.close()}
      >
        <X aria-hidden="true" />
        Fechar
      </Button>
      <Button className="w-auto" onClick={() => window.print()}>
        <Printer aria-hidden="true" />
        Imprimir
      </Button>
    </div>
  );
}

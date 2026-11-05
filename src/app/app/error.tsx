"use client";

import { RotateCcw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Erro ao montar uma tela do app (ex.: a API fora do ar ou desatualizada), no
 * visual escuro do app e em português, com "Tentar de novo". Sem ela, o
 * cliente via a página de erro padrão, sem explicação.
 */
export default function AppError({ retry }: { retry: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
      <WifiOff className="size-10 text-muted-foreground" aria-hidden="true" />
      <h1 className="text-xl font-semibold">
        Não foi possível abrir esta tela
      </h1>
      <p className="text-sm text-muted-foreground">
        Confira a sua internet e tente de novo. Se continuar, tente mais tarde.
      </p>
      <Button
        type="button"
        onClick={() => retry()}
        className="h-12 w-full max-w-xs text-base"
      >
        <RotateCcw aria-hidden="true" />
        Tentar de novo
      </Button>
    </main>
  );
}

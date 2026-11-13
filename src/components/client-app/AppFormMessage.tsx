"use client";

import { useEffect, useState } from "react";
import { CircleAlert, Info } from "lucide-react";

// A confirmação fica 5 segundos e esmaece em 0,3 s.
const VISIBLE_MS = 5000;
const FADE_MS = 300;

// Aviso dentro da tela do app. As confirmações simples (agendado, senha trocada…)
// vão para o toaster do rodapé (AppNotice); este serve às recusas (`error`, que
// ficam até o cliente corrigir) e às mensagens que explicam uma regra
// (`info` com `persistent`).
export function AppFormMessage({
  tone = "error",
  persistent = false,
  children,
}: {
  tone?: "error" | "info";
  persistent?: boolean;
  children: React.ReactNode;
}) {
  const autoHide = tone === "info" && !persistent;
  const [phase, setPhase] = useState<"shown" | "fading" | "gone">("shown");

  useEffect(() => {
    if (!autoHide) return;
    const fade = setTimeout(() => setPhase("fading"), VISIBLE_MS);
    const gone = setTimeout(() => setPhase("gone"), VISIBLE_MS + FADE_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(gone);
    };
  }, [autoHide]);

  if (phase === "gone") return null;

  const Icon = tone === "error" ? CircleAlert : Info;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-control border px-3 py-2 text-sm transition-opacity duration-300 motion-reduce:transition-none ${
        phase === "fading" ? "opacity-0" : ""
      } ${
        tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-primary/30 bg-primary/10 text-foreground"
      }`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

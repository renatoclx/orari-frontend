"use client";

import { useEffect, useState } from "react";

// Quanto tempo o splash fica na tela antes de sumir (em ms).
const SPLASH_MS = 900;

/**
 * Tela de abertura do app instalado (screens/app-cliente.md): fundo na cor da
 * logo, o símbolo em cima e "orari" embaixo, na cor neutra. Só aparece no app
 * instalado (CSS `display-mode: standalone`), não no navegador. É igual no
 * Android e no iPhone; o iPhone não monta splash sozinho sem uma imagem por
 * modelo de aparelho.
 */
export function AppSplash() {
  const [phase, setPhase] = useState<"shown" | "fading" | "gone">("shown");

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const fade = setTimeout(
      () => setPhase(reduce ? "gone" : "fading"),
      SPLASH_MS,
    );
    const gone = setTimeout(() => setPhase("gone"), SPLASH_MS + 300);
    return () => {
      clearTimeout(fade);
      clearTimeout(gone);
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 hidden flex-col items-center justify-center gap-4 bg-[#00B8DB] transition-opacity duration-300 [@media(display-mode:standalone)]:flex ${
        phase === "fading" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- SVG local e pequeno, sem otimização */}
      <img src="/app-assets/symbol.svg" alt="" className="w-20" />
      {/* eslint-disable-next-line @next/next/no-img-element -- idem */}
      <img src="/app-assets/wordmark.svg" alt="" className="w-40" />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { timeToMinutes, toDateString, toTimeString } from "@/utils/time";

// Quanto o relógio da tela anda, e de quanto em quanto tempo os dados são
// buscados de novo (o backend muda o status dos agendamentos a cada 5 minutos).
const TICK_MS = 30_000;
const REFRESH_MS = 60_000;

/**
 * Relógio da agenda, no fuso da empresa, sem precisar recarregar a página.
 *
 * - O "agora" anda sozinho: a linha do horário atual, o que já passou e a
 *   possibilidade de cancelar acompanham o relógio.
 * - A cada minuto, e ao voltar para a aba, os dados da tela são buscados de novo
 *   (`router.refresh`), mantendo o que o usuário está fazendo (filtro, diálogos).
 * - Com a aba escondida, nada disso roda.
 *
 * `serverNow` é o instante em que o servidor montou a página: o primeiro
 * desenho usa ele, para servidor e navegador começarem iguais.
 */
export function useAgendaClock(timeZone: string, serverNow: number) {
  const router = useRouter();
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    const tick = setInterval(() => {
      if (document.visibilityState === "visible") setNow(Date.now());
    }, TICK_MS);

    const refresh = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, REFRESH_MS);

    // Ao voltar para a aba, atualiza o relógio e os dados na hora.
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      setNow(Date.now());
      router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearInterval(tick);
      clearInterval(refresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  const instant = new Date(now);
  return {
    /** Hoje, "aaaa-mm-dd", no fuso da empresa. */
    today: toDateString(instant, timeZone),
    /** Hora atual, "HH:mm", no fuso da empresa. */
    nowTime: toTimeString(instant.toISOString(), timeZone),
    /** Minutos desde a meia-noite, no fuso da empresa. */
    nowMinutes: timeToMinutes(toTimeString(instant.toISOString(), timeZone)),
  };
}

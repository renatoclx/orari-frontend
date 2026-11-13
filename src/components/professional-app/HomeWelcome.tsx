import Link from "next/link";
import { BellRing, Sparkles } from "lucide-react";
import { DismissWelcomeButton } from "./DismissWelcomeButton";

/**
 * Boas-vindas no Início do profissional (screens/app-profissional.md), até ele
 * dispensar: o que o app mostra e o convite para ativar os avisos no celular
 * (Menu → Avisos no celular). Os botões ocupam a largura do cartão.
 */
export function HomeWelcome() {
  return (
    <section
      aria-labelledby="welcome-title"
      className="space-y-4 rounded-card border border-primary/30 bg-primary/5 p-4"
    >
      <div className="flex items-start gap-3">
        <Sparkles
          className="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <h2 id="welcome-title" className="font-semibold">
            Boas-vindas ao Orari!
          </h2>
          <p className="text-sm text-muted-foreground">
            Aqui você acompanha a sua agenda, os seus clientes e as suas
            comissões. Ative os avisos no celular para saber de cada horário
            novo, receber o lembrete 30 minutos antes e o resumo da manhã.
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <Link
          href="/app/menu/notificacoes"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-control bg-primary text-base font-medium text-primary-foreground"
        >
          <BellRing className="size-5" aria-hidden="true" />
          Ativar avisos no celular
        </Link>
        <DismissWelcomeButton />
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  BellRing,
  CalendarCheck,
  Package,
  Repeat,
  type LucideIcon,
} from "lucide-react";

type Tip = {
  title: string;
  text: string;
  href: string;
  icon: LucideIcon;
};

// Dicas do próprio Orari (sem fotos): cada uma leva à tela dela.
const TIPS: Tip[] = [
  {
    title: "Agende em poucos toques",
    text: "Escolha o serviço, o profissional e o horário, sem ligar nem esperar.",
    href: "/app/buscar",
    icon: CalendarCheck,
  },
  {
    title: "Ative os avisos",
    text: "Receba no celular os lembretes e as mudanças dos seus agendamentos.",
    href: "/app/menu/avisos",
    icon: BellRing,
  },
  {
    title: "Seus pacotes num só lugar",
    text: "Veja os pacotes contratados e as sessões de cada um.",
    href: "/app/menu/pacotes",
    icon: Package,
  },
  {
    title: "Horário fixo garantido",
    text: "Acompanhe as suas recorrências e as próximas datas.",
    href: "/app/menu/recorrencias",
    icon: Repeat,
  },
];

/**
 * Carrossel de dicas do Início. Troca só pelo arrasto ou pelos pontos (sem
 * passar sozinho: animação só em resposta ao usuário).
 */
export function AppTips() {
  const list = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);

  // O ponto ativo acompanha o arrasto (cada dica ocupa a largura toda).
  function handleScroll() {
    const element = list.current;
    if (!element) return;
    setCurrent(Math.round(element.scrollLeft / element.clientWidth));
  }

  function goTo(index: number) {
    const element = list.current;
    element?.scrollTo({
      left: index * element.clientWidth,
      behavior: "smooth",
    });
  }

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Dicas do app"
      className="space-y-3"
    >
      <ul
        ref={list}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto [&::-webkit-scrollbar]:hidden"
      >
        {TIPS.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <li
              key={tip.href}
              aria-roledescription="dica"
              aria-label={`${index + 1} de ${TIPS.length}`}
              className="w-full shrink-0 snap-center"
            >
              <Link
                href={tip.href}
                className="relative flex h-40 flex-col justify-end overflow-hidden rounded-card bg-gradient-to-br from-primary/35 via-card to-card p-5"
              >
                <Icon
                  className="absolute top-4 right-4 size-14 text-primary/70"
                  aria-hidden="true"
                />
                <span className="max-w-[75%] text-lg leading-snug font-bold">
                  {tip.title}
                </span>
                <span className="max-w-[85%] text-sm text-muted-foreground">
                  {tip.text}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-center gap-2">
        {TIPS.map((tip, index) => (
          <button
            key={tip.href}
            type="button"
            aria-label={`Ver a dica ${index + 1}`}
            aria-current={index === current ? "true" : undefined}
            onClick={() => goTo(index)}
            className={`size-2.5 rounded-full ${index === current ? "bg-primary" : "bg-muted-foreground/40"}`}
          />
        ))}
      </div>
    </section>
  );
}

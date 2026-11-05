"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  House,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";

// Abas do app, como no AppBarber: a barra é do app inteiro, não de um local.
// `also`: outras rotas em que a aba fica marcada (a página de um
// estabelecimento faz parte de Buscar; a troca de senha, do Menu).
const TABS: {
  href: string;
  label: string;
  icon: LucideIcon;
  also?: string;
}[] = [
  { href: "/app", label: "Início", icon: House },
  { href: "/app/buscar", label: "Buscar", icon: Search, also: "/app/local/" },
  { href: "/app/agendamentos", label: "Agendamentos", icon: CalendarDays },
  { href: "/app/menu", label: "Menu", icon: UserRound, also: "/app/menu/" },
];

/**
 * Altura da barra (64 px dos itens + 1 px da borda), sem a área do gesto do
 * iPhone: quem fica preso logo acima dela (ex.: o Confirmar de Agendar) usa.
 */
export const BOTTOM_NAV_OFFSET =
  "bottom-[calc(4rem+1px+env(safe-area-inset-bottom))]";

/** Barra de navegação de baixo do app do cliente (screens/app-cliente.md). */
export function AppBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegação do app"
      className="sticky bottom-0 border-t border-border bg-sidebar pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex h-16">
        {TABS.map(({ href, label, icon: Icon, also }) => {
          const active =
            pathname === href || Boolean(also && pathname.startsWith(also));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full flex-col items-center justify-center gap-1 text-xs ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-6" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

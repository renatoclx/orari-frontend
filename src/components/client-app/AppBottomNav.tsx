"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Search, UserRound, type LucideIcon } from "lucide-react";

// Abas do app, como no AppBarber: a barra é do app inteiro, não de um local.
// Agendamentos entra quando a tela existir (7b4). `also`: outras rotas em que
// a aba fica marcada (a página de um estabelecimento faz parte de Buscar).
const TABS: {
  href: string;
  label: string;
  icon: LucideIcon;
  also?: string;
}[] = [
  { href: "/app", label: "Início", icon: House },
  { href: "/app/buscar", label: "Buscar", icon: Search, also: "/app/local/" },
  { href: "/app/menu", label: "Menu", icon: UserRound },
];

/** Barra de navegação de baixo do app do cliente (screens/app-cliente.md). */
export function AppBottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navegação do app"
      className="sticky bottom-0 border-t border-border bg-sidebar pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="flex">
        {TABS.map(({ href, label, icon: Icon, also }) => {
          const active =
            pathname === href || Boolean(also && pathname.startsWith(also));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs ${
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

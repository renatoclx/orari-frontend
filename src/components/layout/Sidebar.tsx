"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";

// Menu provisório: as rotas ainda não existem.
const navItems = [
  { href: "/", label: "Agenda", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/servicos", label: "Serviços", icon: ClipboardList },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
];

const iconButtonClass =
  "rounded-control p-1.5 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-2 focus-visible:outline-brand";

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      <aside
        className={`sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground motion-safe:transition-[width] md:flex ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {collapsed ? (
          <div className="flex h-16 items-center justify-center">
            {/* Recolhida, a logo vira o botão de expandir ao passar o mouse. */}
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Expandir menu"
              title="Expandir menu"
              className="group grid size-9 place-items-center rounded-control hover:bg-sidebar-accent focus-visible:outline-2 focus-visible:outline-brand"
            >
              <span className="col-start-1 row-start-1 group-hover:invisible group-focus-visible:invisible">
                <Logo variant="icon" />
              </span>
              <PanelLeftOpen
                className="invisible col-start-1 row-start-1 size-5 text-sidebar-foreground group-hover:visible group-focus-visible:visible"
                aria-hidden="true"
              />
            </button>
          </div>
        ) : (
          <div className="flex h-16 items-center justify-between px-4">
            <Logo variant="full" />
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label="Recolher menu"
              title="Recolher menu"
              className={iconButtonClass}
            >
              <PanelLeftClose className="size-5" aria-hidden="true" />
            </button>
          </div>
        )}

        <SidebarNav collapsed={collapsed} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={onCloseMobile}
            className="absolute inset-0 bg-black/40"
          />
          <aside className="relative flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground shadow-lg">
            <div className="flex h-16 items-center justify-between px-4">
              <Logo variant="full" />
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Fechar menu"
                className={iconButtonClass}
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <SidebarNav collapsed={false} onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  );
}

type SidebarNavProps = {
  collapsed: boolean;
  onNavigate?: () => void;
};

function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Menu principal" className="flex-1 p-2">
      <ul className="space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                title={collapsed ? label : undefined}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-control px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-brand ${
                  active
                    ? "bg-sidebar-accent font-medium text-sidebar-foreground"
                    : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                }`}
              >
                <Icon
                  className={`size-5 shrink-0 ${active ? "text-brand" : ""}`}
                  aria-hidden="true"
                />
                <span className={collapsed ? "sr-only" : undefined}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

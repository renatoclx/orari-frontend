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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Menu provisório: as rotas ainda não existem.
const navItems = [
  { href: "/", label: "Agendamentos", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/servicos", label: "Serviços", icon: ClipboardList },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
];

const iconButtonClass =
  "rounded-control p-1.5 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground";

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
        className={`hidden h-dvh shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground motion-safe:transition-[width] md:flex ${
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
              className="group grid size-9 place-items-center rounded-control hover:bg-sidebar-accent"
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

      {/* Gaveta do celular: o Sheet cuida do fundo escuro, do Esc e do foco. */}
      <Sheet
        open={mobileOpen}
        onOpenChange={(open) => !open && onCloseMobile()}
      >
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-64 gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground data-[side=left]:sm:max-w-64 md:hidden"
        >
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <div className="flex h-16 items-center justify-between px-4">
            <Logo variant="full" />
            <SheetClose aria-label="Fechar menu" className={iconButtonClass}>
              <X className="size-5" aria-hidden="true" />
            </SheetClose>
          </div>
          <SidebarNav collapsed={false} onNavigate={onCloseMobile} />
        </SheetContent>
      </Sheet>
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
          // Subpáginas (ex.: /clientes/novo) mantêm o item do menu ativo.
          const active =
            pathname === href ||
            (href !== "/" && pathname.startsWith(`${href}/`));
          const link = (
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-control px-3 py-2 text-sm ${
                active
                  ? "bg-sidebar-accent font-medium text-sidebar-foreground"
                  : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon
                className={`size-5 shrink-0 ${active ? "text-brand" : ""}`}
                aria-hidden="true"
              />
              <span className={collapsed ? "sr-only" : undefined}>{label}</span>
            </Link>
          );

          return (
            <li key={href}>
              {collapsed ? (
                // Recolhida, o nome aparece numa dica ao lado do ícone.
                <Tooltip>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{label}</TooltipContent>
                </Tooltip>
              ) : (
                link
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

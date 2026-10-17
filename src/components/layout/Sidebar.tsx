"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Repeat,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Hint } from "@/components/shared/Hint";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

// Itens do menu: link simples ou grupo com subitens.
type NavLink = { href: string; label: string; icon: LucideIcon };
type NavGroup = {
  label: string;
  icon: LucideIcon;
  children: { href: string; label: string }[];
};

// Menu provisório: várias rotas ainda não existem. "Pessoas" agrupa os tipos de
// pessoa (cada um referencia um PeopleType no backend); "Usuários" é outra
// entidade (UserType), listada junto por facilidade de acesso.
const navItems: (NavLink | NavGroup)[] = [
  { href: "/", label: "Agendamentos", icon: CalendarDays },
  { href: "/recorrencias", label: "Recorrências", icon: Repeat },
  {
    label: "Pessoas",
    icon: Users,
    children: [
      { href: "/clientes", label: "Clientes" },
      { href: "/funcionarios", label: "Funcionários" },
      { href: "/profissionais", label: "Profissionais" },
      { href: "/usuarios", label: "Usuários" },
    ],
  },
  { href: "/servicos", label: "Serviços", icon: ClipboardList },
  {
    label: "Pacotes",
    icon: Package,
    children: [
      { href: "/pacotes/planos", label: "Planos" },
      { href: "/pacotes/contratacoes", label: "Contratações" },
    ],
  },
  {
    label: "Financeiro",
    icon: Wallet,
    children: [
      { href: "/financeiro", label: "Pagamentos" },
      {
        href: "/financeiro/metodos-de-pagamento",
        label: "Métodos de pagamento",
      },
    ],
  },
];

// Botões de ícone da sidebar (recolher, fechar no celular).
const iconButtonClass =
  "rounded-control p-1.5 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground";

type SidebarProps = {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

/** Menu lateral: fixo e recolhível no computador, gaveta no celular. */
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
            <Hint label="Expandir o menu lateral" side="right">
              <button
                type="button"
                onClick={onToggleCollapsed}
                aria-label="Expandir menu"
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
            </Hint>
          </div>
        ) : (
          <div className="flex h-16 items-center justify-between px-4">
            <Logo variant="full" />
            <Hint label="Recolher o menu lateral" side="bottom">
              <button
                type="button"
                onClick={onToggleCollapsed}
                aria-label="Recolher menu"
                className={iconButtonClass}
              >
                <PanelLeftClose className="size-5" aria-hidden="true" />
              </button>
            </Hint>
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
            <Hint label="Fechar o menu" side="bottom">
              <SheetClose aria-label="Fechar menu" className={iconButtonClass}>
                <X className="size-5" aria-hidden="true" />
              </SheetClose>
            </Hint>
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

// Subpáginas (ex.: /clientes/novo) mantêm o item do menu ativo.
function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

// Subitem ativo de um grupo: o de caminho mais específico (em
// /financeiro/metodos-de-pagamento, "Métodos de pagamento", não "Pagamentos").
function activeChildHref(
  pathname: string,
  children: { href: string }[],
): string | undefined {
  return children
    .filter((child) => isActivePath(pathname, child.href))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}

// Estilo comum dos itens do menu, com destaque para o ativo.
const itemClass = (active: boolean) =>
  `flex w-full items-center gap-3 rounded-control px-3 py-2 text-sm ${
    active
      ? "bg-sidebar-accent font-medium text-sidebar-foreground"
      : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
  }`;

function SidebarNav({ collapsed, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Menu principal" className="flex-1 p-2">
      <ul className="space-y-1">
        {navItems.map((entry) =>
          "children" in entry ? (
            <li key={entry.label}>
              <SidebarGroup
                group={entry}
                collapsed={collapsed}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            </li>
          ) : (
            <li key={entry.href}>
              <SidebarLink
                link={entry}
                collapsed={collapsed}
                active={isActivePath(pathname, entry.href)}
                onNavigate={onNavigate}
              />
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

type SidebarLinkProps = {
  link: NavLink;
  collapsed: boolean;
  active: boolean;
  onNavigate?: () => void;
};

function SidebarLink({
  link,
  collapsed,
  active,
  onNavigate,
}: SidebarLinkProps) {
  const { href, label, icon: Icon } = link;
  const anchor = (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={itemClass(active)}
    >
      <Icon
        className={`size-5 shrink-0 ${active ? "text-brand" : ""}`}
        aria-hidden="true"
      />
      <span className={collapsed ? "sr-only" : undefined}>{label}</span>
    </Link>
  );

  if (!collapsed) return anchor;

  // Recolhida, o nome aparece numa dica ao lado do ícone.
  return (
    <Tooltip>
      <TooltipTrigger asChild>{anchor}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

type SidebarGroupProps = {
  group: NavGroup;
  collapsed: boolean;
  pathname: string;
  onNavigate?: () => void;
};

// Grupo com subitens: aberto, é uma seção que expande; recolhida a sidebar,
// vira um menu que abre ao lado do ícone.
function SidebarGroup({
  group,
  collapsed,
  pathname,
  onNavigate,
}: SidebarGroupProps) {
  const { label, icon: Icon, children } = group;
  const current = activeChildHref(pathname, children);
  const active = current !== undefined;
  const icon = (
    <Icon
      className={`size-5 shrink-0 ${active ? "text-brand" : ""}`}
      aria-hidden="true"
    />
  );

  if (collapsed) {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger
              aria-label={label}
              className={itemClass(active)}
            >
              {icon}
              <span className="sr-only">{label}</span>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent side="right" align="start" className="w-48">
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          {children.map((child) => (
            <DropdownMenuItem key={child.href} asChild>
              <Link
                href={child.href}
                aria-current={child.href === current ? "page" : undefined}
              >
                {child.label}
              </Link>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Collapsible defaultOpen={active}>
      <CollapsibleTrigger className={`group ${itemClass(active)}`}>
        {icon}
        <span>{label}</span>
        <ChevronDown
          className="ml-auto size-4 shrink-0 group-data-[state=open]:rotate-180 motion-safe:transition-transform"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <ul className="mt-1 space-y-1 pl-5">
          {children.map((child) => {
            const childActive = child.href === current;
            return (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={onNavigate}
                  aria-current={childActive ? "page" : undefined}
                  className={`block rounded-control px-3 py-2 text-sm ${
                    childActive
                      ? "bg-sidebar-accent font-medium text-sidebar-foreground"
                      : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  }`}
                >
                  {child.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

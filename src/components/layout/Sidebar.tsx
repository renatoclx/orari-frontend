"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ChartColumn,
  ChevronDown,
  CircleHelp,
  ClipboardList,
  FileHeart,
  MessageSquareText,
  Package,
  PanelLeftClose,
  PanelLeftOpen,
  Repeat,
  Smartphone,
  Users,
  UsersRound,
  Wallet,
  X,
  type LucideIcon,
  LayoutDashboard,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { filterMenuByAccess } from "@/components/layout/menu-access";
import { Hint } from "@/components/shared/Hint";
import type { CurrentUser } from "@/types/auth";
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
// `feature` liga o item ao que a empresa tem liberado (menu-access.ts); sem ele, sempre aparece.
type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  feature?: string;
};
type NavGroup = {
  label: string;
  icon: LucideIcon;
  children: { href: string; label: string; feature?: string }[];
};

// Menu provisório: várias rotas ainda não existem. "Pessoas" agrupa os tipos de
// pessoa (cada um referencia um PeopleType no backend); "Usuários" é outra
// entidade (UserType), listada junto por facilidade de acesso.
const navItems: (NavLink | NavGroup)[] = [
  {
    href: "/",
    label: "Agendamentos",
    icon: CalendarDays,
    feature: "appointments",
  },
  {
    href: "/recorrencias",
    label: "Recorrências",
    icon: Repeat,
    feature: "recurrences",
  },
  {
    label: "Pessoas",
    icon: Users,
    children: [
      { href: "/clientes", label: "Clientes", feature: "clients" },
      { href: "/funcionarios", label: "Funcionários", feature: "employees" },
      {
        href: "/profissionais",
        label: "Profissionais",
        feature: "professionals",
      },
      { href: "/usuarios", label: "Usuários", feature: "users" },
    ],
  },
  {
    href: "/servicos",
    label: "Serviços",
    icon: ClipboardList,
    feature: "services",
  },
  {
    label: "Pacotes",
    icon: Package,
    children: [
      { href: "/pacotes/planos", label: "Planos", feature: "plans" },
      {
        href: "/pacotes/contratacoes",
        label: "Contratações",
        feature: "contracts",
      },
    ],
  },
  {
    label: "Financeiro",
    icon: Wallet,
    children: [
      { href: "/financeiro/comandas", label: "Comandas", feature: "tabs" },
      { href: "/financeiro", label: "Pagamentos", feature: "payments" },
      {
        href: "/financeiro/metodos-de-pagamento",
        label: "Métodos de pagamento",
        feature: "payment-methods",
      },
    ],
  },
];

// Anamnese (screens/anamnese.md): modelos de ficha e auditoria são só do ADMIN.
// "Fichas preenchidas" é de quem acessa as fichas (ADMIN e profissional
// vinculado): o ADMIN a vê no grupo; o profissional, que só tem ela, como item
// direto. A criação de ficha ("Nova ficha") parte dessa tela.
const clientRecordsChild = {
  href: "/anamnese/fichas",
  label: "Fichas preenchidas",
  feature: "anamnesis",
};
const anamnesisGroup: NavGroup = {
  label: "Anamnese",
  icon: FileHeart,
  children: [
    clientRecordsChild,
    {
      href: "/anamnese/modelos",
      label: "Modelos de ficha",
      feature: "anamnesis-templates",
    },
    {
      href: "/anamnese/auditoria",
      label: "Auditoria",
      feature: "anamnesis-audit",
    },
  ],
};
const clientRecordsLink: NavLink = { ...clientRecordsChild, icon: FileHeart };

// Turmas (screens/turmas.md): só o ADMIN cadastra; o item entra logo depois de Serviços.
const classGroupsLink: NavLink = {
  href: "/turmas",
  label: "Turmas",
  icon: UsersRound,
  feature: "class-groups",
};

// Portal do cliente (screens/portal-do-cliente.md): só o ADMIN; o item fica
// por último, logo antes da Ajuda.
const clientPortalLink: NavLink = {
  href: "/portal-do-cliente",
  label: "Portal do cliente",
  icon: Smartphone,
  feature: "client-portal",
};

// Mensagens (screens/mensagens.md): só o ADMIN, com Mensagens no plano; logo
// depois do Portal do cliente, de que elas dependem.
const messagesGroup: NavGroup = {
  label: "Mensagens",
  icon: MessageSquareText,
  children: [
    {
      href: "/mensagens/automaticas",
      label: "Automáticas",
      feature: "messages",
    },
    { href: "/mensagens/enviar", label: "Enviar", feature: "messages" },
  ],
};

// Relatórios (screens/carteira-clientes.md): só o ADMIN; o grupo recebe os
// próximos relatórios. Fica depois do Financeiro.
const reportsGroup: NavGroup = {
  label: "Relatórios",
  icon: ChartColumn,
  children: [
    {
      href: "/relatorios/carteira-clientes",
      label: "Carteira de clientes",
      feature: "client-portfolio",
    },
    {
      href: "/relatorios/contas-a-receber",
      label: "Contas a receber",
      feature: "receivables",
    },
    {
      href: "/relatorios/agendamentos",
      label: "Agendamentos",
      feature: "appointments-report",
    },
    {
      href: "/relatorios/rankings",
      label: "Rankings",
      feature: "rankings",
    },
    {
      href: "/relatorios/financeiro",
      label: "Financeiro",
      feature: "financial-report",
    },
    {
      href: "/relatorios/pacotes",
      label: "Pacotes",
      feature: "packages-report",
    },
    {
      href: "/relatorios/perfil-do-cliente",
      label: "Perfil do cliente",
      feature: "clients-report",
    },
  ],
};

// Dashboard (screens/dashboard.md): só o ADMIN, no topo do menu. A página
// inicial continua sendo a agenda.
const dashboardLink: NavLink = {
  href: "/dashboard",
  label: "Dashboard",
  icon: LayoutDashboard,
  feature: "dashboard",
};

// Ajuda (screens/ajuda.md): os manuais em PDF. Por enquanto só para o ADMIN;
// o item fica no fim do menu.
const helpLink: NavLink = {
  href: "/ajuda",
  label: "Ajuda",
  icon: CircleHelp,
};

// Só o SUPER_ADMIN gerencia empresas (screens/empresas.md): o item entra no fim do
// menu e some para os demais perfis.
const superAdminItems: NavLink[] = [
  { href: "/empresas", label: "Empresas", icon: Building2 },
];

// Botões de ícone da sidebar (recolher, fechar no celular).
const iconButtonClass =
  "rounded-control p-1.5 text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground";

type SidebarProps = {
  /** Perfil de quem está logado: o SUPER_ADMIN vê o item Empresas. */
  isSuperAdmin: boolean;
  /** O ADMIN vê o grupo Anamnese (fichas dos clientes, modelos de ficha e auditoria). */
  isAdmin: boolean;
  /** Quem acessa as fichas (ADMIN ou profissional vinculado) vê "Fichas preenchidas". */
  canAccessAnamnesis: boolean;
  /** O que a empresa tem liberado: some do menu o que ela não pode usar. */
  access: CurrentUser["access"];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
};

/** Menu lateral: fixo e recolhível no computador, gaveta no celular. */
export function Sidebar({
  isSuperAdmin,
  isAdmin,
  canAccessAnamnesis,
  access,
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

        <SidebarNav
          collapsed={collapsed}
          isSuperAdmin={isSuperAdmin}
          isAdmin={isAdmin}
          canAccessAnamnesis={canAccessAnamnesis}
          access={access}
        />
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
          <SidebarNav
            collapsed={false}
            isSuperAdmin={isSuperAdmin}
            isAdmin={isAdmin}
            canAccessAnamnesis={canAccessAnamnesis}
            access={access}
            onNavigate={onCloseMobile}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}

type SidebarNavProps = {
  collapsed: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  canAccessAnamnesis: boolean;
  access: CurrentUser["access"];
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

function SidebarNav({
  collapsed,
  isSuperAdmin,
  isAdmin,
  canAccessAnamnesis,
  access,
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname();
  const services = navItems.findIndex(
    (entry) => "href" in entry && entry.href === "/servicos",
  );
  const items = filterMenuByAccess(
    [
      ...(isAdmin ? [dashboardLink] : []),
      ...navItems.slice(0, services + 1),
      ...(isAdmin ? [classGroupsLink] : []),
      ...navItems.slice(services + 1),
      ...(isAdmin ? [reportsGroup] : []),
      ...(isAdmin
        ? [anamnesisGroup]
        : canAccessAnamnesis
          ? [clientRecordsLink]
          : []),
      ...(isAdmin ? [clientPortalLink, messagesGroup, helpLink] : []),
      ...(isSuperAdmin ? superAdminItems : []),
    ],
    access,
  );

  return (
    <nav aria-label="Menu principal" className="flex-1 p-2">
      <ul className="space-y-1">
        {items.map((entry) =>
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

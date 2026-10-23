"use client";

import { useState } from "react";
import { ActionBar } from "@/components/layout/ActionBar";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { WelcomeToast } from "@/components/layout/WelcomeToast";
import { SIDEBAR_COOKIE } from "@/components/layout/sidebar-cookie";
import type { CurrentUser } from "@/types/auth";

type AdminShellProps = {
  defaultCollapsed: boolean;
  user: CurrentUser;
  children: React.ReactNode;
};

/** Moldura da área administrativa: sidebar, header, barra de ações e conteúdo. */
export function AdminShell({
  defaultCollapsed,
  user,
  children,
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next}; path=/; max-age=31536000`;
  }

  return (
    <>
      {/* Primeiro item do teclado: leva ao conteúdo sem passar por todo o menu. */}
      <a
        href="#conteudo"
        className="sr-only z-50 rounded-control bg-card px-4 py-2 text-sm font-medium text-foreground shadow-lg focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:px-4 focus:py-2"
      >
        Pular para o conteúdo
      </a>
      <div className="flex h-dvh overflow-hidden bg-background text-foreground">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Header user={user} onOpenMobile={() => setMobileOpen(true)} />
          {/* A página não rola: cada componente cuida da própria rolagem. */}
          <main
            id="conteudo"
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col p-4 md:p-8"
          >
            {children}
          </main>
        </div>

        <ActionBar />
        <WelcomeToast userName={user.name} />
      </div>
    </>
  );
}

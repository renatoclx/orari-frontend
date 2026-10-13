"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SIDEBAR_COOKIE } from "@/components/layout/sidebar-cookie";

type AdminShellProps = {
  defaultCollapsed: boolean;
  children: React.ReactNode;
};

export function AdminShell({ defaultCollapsed, children }: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = `${SIDEBAR_COOKIE}=${next}; path=/; max-age=31536000`;
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapsed={toggleCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMobile={() => setMobileOpen(true)} />
        {/* A página não rola: cada componente cuida da própria rolagem. */}
        <main className="flex min-h-0 flex-1 flex-col p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

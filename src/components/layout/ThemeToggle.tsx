"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const subscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // O servidor não conhece o tema: até montar no navegador, o estado do
  // switch fica indefinido e a posição visual é decidida pelo CSS (dark:).
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={mounted ? isDark : undefined}
      aria-label="Tema escuro"
      title="Alternar tema"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="h-7 w-12 shrink-0 rounded-full border border-border bg-background p-0.5 focus-visible:outline-2 focus-visible:outline-brand"
    >
      <span className="flex size-6 items-center justify-center rounded-full border border-border bg-surface text-muted motion-safe:transition-transform dark:translate-x-4.5">
        <Sun className="size-3.5 dark:hidden" aria-hidden="true" />
        <Moon className="hidden size-3.5 dark:block" aria-hidden="true" />
      </span>
    </button>
  );
}

"use client";

import { Hint } from "@/components/shared/Hint";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

// Sem assinatura: o valor só muda ao montar no navegador.
const subscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // O servidor não conhece o tema: o switch só aparece depois de montar no
  // navegador, para não nascer na posição errada e "pular" em seguida.
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Sun className="size-4" aria-hidden="true" />
      {mounted ? (
        <Hint label="Alternar entre tema claro e escuro">
          <Switch
            checked={resolvedTheme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            aria-label="Tema escuro"
          />
        </Hint>
      ) : (
        <span className="h-[18.4px] w-8 rounded-full bg-input" />
      )}
      <Moon className="size-4" aria-hidden="true" />
    </div>
  );
}

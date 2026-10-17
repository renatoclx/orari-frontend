"use client";

import { Hint } from "@/components/shared/Hint";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

// Sem assinatura: o valor só muda ao montar no navegador.
const subscribe = () => () => {};

// Switch de tema com sol e lua (tela de login).
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

// Tema claro/escuro como item do menu do usuário. O conteúdo do menu só é
// montado no navegador (ao abrir), então o tema resolvido já é conhecido.
export function ThemeMenuItem() {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <DropdownMenuItem
      // Alterna sem fechar o menu, para o usuário ver a troca.
      onSelect={(event) => {
        event.preventDefault();
        setTheme(dark ? "light" : "dark");
      }}
      className="gap-2.5 px-3 py-2"
    >
      <Moon aria-hidden="true" />
      Tema escuro
      {/* Só indica o estado: o clique é do item inteiro. */}
      <Switch
        checked={dark}
        tabIndex={-1}
        aria-hidden="true"
        className="pointer-events-none ml-auto"
      />
    </DropdownMenuItem>
  );
}

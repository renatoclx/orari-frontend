import { Menu } from "lucide-react";
import { CalendarShortcut } from "@/components/layout/CalendarShortcut";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { PersonAvatar } from "@/components/shared/PersonAvatar";

// Usuário provisório até a autenticação existir.
const user = { name: "Renato Jean", role: "Administrador" };

type HeaderProps = {
  onOpenMobile: () => void;
};

export function Header({ onOpenMobile }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-4 md:px-8">
      <button
        type="button"
        onClick={onOpenMobile}
        aria-label="Abrir menu"
        className="rounded-control p-2 text-muted-foreground hover:text-foreground md:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      <div className="md:hidden">
        <Logo variant="icon" />
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* No celular, os atalhos da barra lateral ficam aqui. */}
        <div className="md:hidden">
          <CalendarShortcut placement="header" />
        </div>
        <ThemeToggle />
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
          <PersonAvatar name={user.name} size="lg" />
        </div>
      </div>
    </header>
  );
}

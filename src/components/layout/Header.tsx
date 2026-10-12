import { Menu } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

// Usuário provisório até a autenticação existir.
const user = { name: "Renato Jean", role: "Administrador", initials: "RJ" };

type HeaderProps = {
  onOpenMobile: () => void;
};

export function Header({ onOpenMobile }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-surface px-4 md:px-8">
      <button
        type="button"
        onClick={onOpenMobile}
        aria-label="Abrir menu"
        className="rounded-control p-2 text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand md:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      <div className="md:hidden">
        <Logo variant="icon" />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted">{user.role}</p>
          </div>
          <span
            className="flex size-9 items-center justify-center rounded-full border border-border bg-background text-sm font-medium"
            aria-hidden="true"
          >
            {user.initials}
          </span>
        </div>
      </div>
    </header>
  );
}

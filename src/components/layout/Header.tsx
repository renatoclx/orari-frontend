import { Menu } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";

// Usuário provisório até a autenticação existir.
const user = { name: "Renato Jean", role: "Administrador" };

type HeaderProps = {
  onOpenMobile: () => void;
};

export function Header({ onOpenMobile }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-surface px-4 md:px-8">
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
          <Avatar name={user.name} />
        </div>
      </div>
    </header>
  );
}

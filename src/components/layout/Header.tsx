import { Menu } from "lucide-react";
import { CalendarShortcut } from "@/components/layout/CalendarShortcut";
import { Hint } from "@/components/shared/Hint";
import { Logo } from "@/components/layout/Logo";
import { CompanyLogo } from "@/components/layout/CompanyLogo";
import { UserMenu } from "@/components/layout/UserMenu";
import type { CurrentUser } from "@/types/auth";
import { formatUserType } from "@/utils/format";

type HeaderProps = {
  user: CurrentUser;
  onOpenMobile: () => void;
};

/** Cabeçalho: menu no celular, nome e logo da empresa, atalhos e usuário (o tema fica no menu do usuário). */
export function Header({ user, onOpenMobile }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card px-4 md:px-8">
      <Hint label="Abrir o menu de navegação" side="bottom">
        <button
          type="button"
          onClick={onOpenMobile}
          aria-label="Abrir menu"
          className="rounded-control p-2 text-muted-foreground hover:text-foreground md:hidden"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
      </Hint>
      <div className="md:hidden">
        <Logo variant="icon" />
      </div>
      {/* Nome fantasia da empresa, só do tablet em diante: no celular o espaço
          fica para o menu, a logo e os atalhos. */}
      <p className="hidden truncate text-lg font-semibold md:block">
        {user.company.name}
      </p>

      <div className="ml-auto flex items-center gap-3">
        {/* No celular só o calendário aparece (screens/layout.md); os demais atalhos
            ficam na barra lateral, do tablet em diante. */}
        <div className="flex items-center md:hidden">
          <CalendarShortcut placement="header" />
        </div>
        <CompanyLogo name={user.company.name} logoUrl={user.company.logoUrl} />
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatUserType(user.type)}
            </p>
          </div>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}

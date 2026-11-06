import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  ChevronRight,
  LockKeyhole,
  LogOut,
  Package,
  Repeat,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { appLogoutAction } from "@/app/app/actions";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { getAccount } from "@/services/app-account.service";
import { getProfile } from "@/services/app-profile.service";
import { formatPhone, getInitials } from "@/utils/format";

export const metadata: Metadata = { title: "Menu" };

// Linha do menu, como no AppBarber: ícone, título, explicação e seta, com
// espaço generoso para o dedo (a linha tem mais de 64 px de altura).
const rowClass =
  "flex w-full items-center gap-4 border-b border-border py-5 text-left";

const ITEMS: {
  href: string;
  icon: LucideIcon;
  title: string;
  detail: string;
}[] = [
  {
    href: "/app/menu/avisos",
    icon: Bell,
    title: "Avisos",
    detail: "Lembretes e mensagens dos estabelecimentos",
  },
  {
    href: "/app/menu/dados",
    icon: UserRound,
    title: "Meus dados",
    detail: "Altere as informações do seu perfil",
  },
  {
    href: "/app/menu/pacotes",
    icon: Package,
    title: "Pacotes",
    detail: "Acompanhe seus pacotes",
  },
  {
    href: "/app/menu/recorrencias",
    icon: Repeat,
    title: "Recorrências",
    detail: "Seus horários fixos e turmas",
  },
  {
    href: "/app/menu/senha",
    icon: LockKeyhole,
    title: "Segurança",
    detail: "Altere sua senha de acesso",
  },
];

/**
 * Menu do app (screens/app-cliente.md): a conta (foto, nome e telefone),
 * Avisos (com os não lidos), Meus dados, Pacotes, Recorrências, Segurança e Sair.
 */
export default async function AppMenuPage({
  searchParams,
}: PageProps<"/app/menu">) {
  const { senha, dados } = await searchParams;
  const [profile, { unreadMessages }] = await Promise.all([
    getProfile(),
    getAccount(),
  ]);
  return (
    <>
      <header className="flex items-center gap-4">
        {profile.photoUrl ? (
          <Image
            src={profile.photoUrl}
            alt="Sua foto"
            width={64}
            height={64}
            unoptimized
            className="size-16 shrink-0 rounded-full bg-card object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-16 shrink-0 place-items-center rounded-full bg-primary/20 text-xl font-bold text-primary"
          >
            {getInitials(profile.name)}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{profile.name}</h1>
          <p className="text-sm text-muted-foreground tabular-nums">
            {formatPhone(profile.phone)}
          </p>
        </div>
      </header>

      {senha && (
        <AppFormMessage tone="info">
          Senha trocada. Os outros aparelhos saíram da sua conta.
        </AppFormMessage>
      )}
      {dados && (
        <AppFormMessage tone="info">
          Dados salvos. Eles também foram atualizados nos seus estabelecimentos.
        </AppFormMessage>
      )}

      <nav aria-label="Opções da conta" className="border-t border-border">
        {ITEMS.map(({ href, icon: Icon, title, detail }) => (
          <Link key={href} href={href} className={rowClass}>
            <Icon className="size-6 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 space-y-0.5">
              <span className="block font-medium">{title}</span>
              <span className="block text-sm text-muted-foreground">
                {detail}
              </span>
            </span>
            {href === "/app/menu/avisos" && unreadMessages > 0 && (
              <span className="grid h-6 min-w-6 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground tabular-nums">
                {unreadMessages}
                <span className="sr-only"> não lidos</span>
              </span>
            )}
            <ChevronRight
              className="size-5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          </Link>
        ))}
        <form action={appLogoutAction}>
          <button type="submit" className={`${rowClass} cursor-pointer`}>
            <LogOut className="size-6 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 space-y-0.5">
              <span className="block font-medium">Sair</span>
              <span className="block text-sm text-muted-foreground">
                Só deste aparelho
              </span>
            </span>
          </button>
        </form>
      </nav>
    </>
  );
}

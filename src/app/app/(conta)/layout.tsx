import { AppBottomNav } from "@/components/client-app/AppBottomNav";
import { getAccount } from "@/services/app-account.service";
import { ProfessionalBell } from "@/components/professional-app/ProfessionalBell";
import { ApiError } from "@/services/api";
import { getProfessionalMe } from "@/services/app-pro.service";
import { getProUnreadCount } from "@/services/app-pro-notification.service";
import { getAppSessionKind } from "@/services/app-session";
import { canAccess } from "@/utils/access";

// Telas de quem entrou no app: o conteúdo rola e a barra fica embaixo.
export default async function AccountAppLayout({
  children,
}: LayoutProps<"/app">) {
  // O app é um só; o que muda é quem entrou (cliente ou profissional).
  const kind = (await getAppSessionKind()) ?? "client";
  // Avisos não lidos: o ponto na aba Menu (a mesma chamada do Início e do
  // Menu). Só o cliente tem avisos.
  const unreadMessages =
    kind === "client" ? (await getAccount()).unreadMessages : 0;
  // A aba Comissões só existe para a clínica que as usa (funcionalidade do plano).
  const showCommissions =
    kind === "professional" &&
    canAccess((await getProfessionalMe()).access, "commissions");
  // O sino do topo (só o profissional): o número já certo na primeira tela. Se a
  // API falhar só aqui, a tela abre sem número (o sino confere de novo depois).
  const unreadNotices =
    kind === "professional"
      ? await getProUnreadCount().catch((error: unknown) => {
          if (error instanceof ApiError) return 0;
          throw error;
        })
      : 0;
  return (
    <div className="flex flex-1 flex-col">
      {/* Margem lateral de 20 px: no celular, o conteúdo não encosta na borda. */}
      <main className="flex flex-1 flex-col gap-6 px-5 pt-8 pb-6">
        {kind === "professional" && (
          <div className="-mb-2 flex justify-end">
            <ProfessionalBell initial={unreadNotices} />
          </div>
        )}
        {children}
      </main>
      <AppBottomNav
        hasUnread={unreadMessages > 0}
        kind={kind}
        showCommissions={showCommissions}
      />
    </div>
  );
}

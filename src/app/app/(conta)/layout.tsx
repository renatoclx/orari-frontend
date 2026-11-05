import { AppBottomNav } from "@/components/client-app/AppBottomNav";
import { getAccount } from "@/services/app-account.service";

// Telas de quem entrou no app: o conteúdo rola e a barra fica embaixo.
export default async function AccountAppLayout({
  children,
}: LayoutProps<"/app">) {
  // Avisos não lidos: o ponto na aba Menu (a mesma chamada do Início e do Menu).
  const { unreadMessages } = await getAccount();
  return (
    <div className="flex flex-1 flex-col">
      {/* Margem lateral de 20 px: no celular, o conteúdo não encosta na borda. */}
      <main className="flex flex-1 flex-col gap-6 px-5 pt-8 pb-6">
        {children}
      </main>
      <AppBottomNav hasUnread={unreadMessages > 0} />
    </div>
  );
}

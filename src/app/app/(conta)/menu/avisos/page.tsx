import type { Metadata } from "next";
import { MarkMessagesRead } from "@/components/client-app/MarkMessagesRead";
import { MenuSubpageHeader } from "@/components/client-app/MenuSubpageHeader";
import { MessageList } from "@/components/client-app/MessageList";
import { PushDeviceCard } from "@/components/client-app/PushDeviceCard";
import { getPushInfo, listMessages } from "@/services/app-push.service";

export const metadata: Metadata = { title: "Avisos" };

/**
 * Menu → Avisos (screens/app-cliente.md): os avisos neste aparelho (ativar,
 * testar, interruptores) e a caixa com os avisos recebidos. Sem as chaves no
 * servidor, o bloco do aparelho some e só a caixa fica.
 */
export default async function AppMessagesPage() {
  const [{ publicKey, ...preferences }, messages] = await Promise.all([
    getPushInfo(),
    listMessages(),
  ]);
  return (
    <>
      <MenuSubpageHeader
        title="Avisos"
        description="Lembretes dos seus horários e mensagens dos seus estabelecimentos."
      />
      {publicKey && (
        <PushDeviceCard publicKey={publicKey} preferences={preferences} />
      )}
      <section aria-labelledby="messages-title" className="space-y-3">
        <h2 id="messages-title" className="font-semibold">
          Recebidos
        </h2>
        {messages.items.length > 0 ? (
          <MessageList messages={messages.items} />
        ) : (
          <p className="rounded-card border border-border bg-card p-4 text-sm text-muted-foreground">
            Nenhum aviso por enquanto.
          </p>
        )}
      </section>
      {messages.unread > 0 && <MarkMessagesRead />}
    </>
  );
}

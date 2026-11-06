import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleAlert, Info } from "lucide-react";
import { AutoMessagesForm } from "@/components/auto-messages/AutoMessagesForm";
import { getCurrentUser } from "@/services/auth.service";
import { listAutoMessages } from "@/services/auto-message.service";
import { getPortalSettings } from "@/services/portal-settings.service";
import { canAccess } from "@/utils/access";

/**
 * Mensagens → Automáticas (screens/mensagens.md): só o ADMIN, com Mensagens no
 * plano; os demais veem 404, e a API recusa com 403.
 */
export async function AutoMessagesPage() {
  const { type, company, access } = await getCurrentUser();
  if (type !== "ADMIN" || !canAccess(access, "messages")) notFound();

  const [messages, portal] = await Promise.all([
    listAutoMessages(),
    getPortalSettings(),
  ]);

  const notice = portal.enabled ? (
    <p className="flex items-start gap-2 text-sm text-muted-foreground">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      Só recebem os clientes que usam o app do Orari e deixaram os avisos
      ligados. Cada mensagem sai uma vez só.
    </p>
  ) : (
    <p className="flex items-start gap-2 text-sm text-destructive">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        O portal do cliente está desligado: nenhuma mensagem sai até ele ser
        ligado em{" "}
        <Link href="/portal-do-cliente" className="font-medium underline">
          Portal do cliente
        </Link>
        .
      </span>
    </p>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Mensagens automáticas</h1>
      {/* key: depois de salvar, o formulário recomeça com o que foi gravado. */}
      <AutoMessagesForm
        key={JSON.stringify(messages)}
        messages={messages}
        editable={canAccess(access, "messages", "edit")}
        placeName={company.name}
        notice={notice}
      />
    </div>
  );
}

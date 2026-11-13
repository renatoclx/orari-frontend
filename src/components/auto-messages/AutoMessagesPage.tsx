import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleAlert, Info } from "lucide-react";
import { AutoMessagesForm } from "@/components/auto-messages/AutoMessagesForm";
import {
  AUTO_MESSAGE_GROUPS,
  type AutoMessageGroup,
} from "@/components/auto-messages/auto-messages";
import { getCurrentUser } from "@/services/auth.service";
import { listAutoMessages } from "@/services/auto-message.service";
import { getPortalSettings } from "@/services/portal-settings.service";
import { canAccess } from "@/utils/access";

const hint = (text: React.ReactNode) => (
  <p className="flex items-start gap-2 text-sm text-muted-foreground">
    <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
    {text}
  </p>
);

/**
 * Mensagens → Ao cliente, Ao profissional e Ao administrador
 * (screens/mensagens.md): só o ADMIN, com Mensagens no plano; os demais veem 404,
 * e a API recusa com 403. Cada página mostra e grava só as situações do grupo dela.
 */
export async function AutoMessagesPage({ group }: { group: AutoMessageGroup }) {
  const { type, company, access } = await getCurrentUser();
  if (type !== "ADMIN" || !canAccess(access, "messages")) notFound();

  const { title, kinds } = AUTO_MESSAGE_GROUPS[group];
  const all = await listAutoMessages();
  const messages = all.filter((message) => kinds.includes(message.kind));

  let notice: React.ReactNode;
  if (group === "clientes") {
    // Só as mensagens ao cliente dependem do portal ligado.
    const portal = await getPortalSettings();
    notice = portal.enabled ? (
      hint(
        "Só recebem os clientes que usam o app do Orari e deixaram os avisos ligados. Cada mensagem sai uma vez só.",
      )
    ) : (
      <p className="flex items-start gap-2 text-sm text-destructive">
        <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <span>
          O portal do cliente está desligado: nenhuma mensagem ao cliente sai
          até ele ser ligado em{" "}
          <Link href="/portal-do-cliente" className="font-medium underline">
            Portal do cliente
          </Link>
          .
        </span>
      </p>
    );
  } else if (group === "profissionais") {
    notice = hint(
      "Chegam ao profissional que usa o app (no sino e, se ele ativar, no celular). Não dependem do portal do cliente. O texto não leva o nome do cliente.",
    );
  } else {
    notice = hint(
      "O resumo das pendências do dia chega a quem administra a clínica (no sino e, se ativar, no celular). Só entram os itens que o plano libera, e o dia sem nenhum item com número não manda nada. Não depende do portal do cliente.",
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">{title}</h1>
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

import { notFound } from "next/navigation";
import { CampaignForm } from "@/components/auto-messages/CampaignForm";
import { clientsLabel } from "@/components/auto-messages/campaign";
import { getCurrentUser } from "@/services/auth.service";
import {
  getCampaignAudience,
  listCampaigns,
} from "@/services/message-campaign.service";
import { getPortalSettings } from "@/services/portal-settings.service";
import { canAccess } from "@/utils/access";

// Data e hora do envio no fuso da clínica: "06/11/2026 14:22".
function sentAt(iso: string, timeZone: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

/**
 * Mensagens → Enviar (screens/mensagens.md): só o ADMIN, com Mensagens no
 * plano; os demais veem 404, e a API recusa com 403.
 */
export async function CampaignPage() {
  const { type, company, access } = await getCurrentUser();
  if (type !== "ADMIN" || !canAccess(access, "messages")) notFound();

  const [audience, campaigns, portal] = await Promise.all([
    getCampaignAudience(),
    listCampaigns(),
    getPortalSettings(),
  ]);

  const history = (
    <section
      aria-labelledby="campaign-history"
      className="space-y-3 p-4 md:p-6"
    >
      <h2 id="campaign-history" className="font-semibold">
        Enviadas
      </h2>
      {campaigns.items.length > 0 ? (
        <ul className="divide-y divide-border rounded-control border border-border">
          {campaigns.items.map((campaign) => (
            <li key={campaign.id} className="space-y-1 p-3 text-sm">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-semibold">{campaign.title}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {sentAt(campaign.createdAt, company.timezone)} ·{" "}
                  {campaign.createdBy.name}
                </p>
              </div>
              <p>{campaign.body}</p>
              <p className="text-xs text-muted-foreground">
                Recebida por {clientsLabel(campaign.recipients)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nenhuma mensagem enviada ainda.
        </p>
      )}
    </section>
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Enviar mensagem</h1>
      <CampaignForm
        audience={audience}
        editable={canAccess(access, "messages", "edit")}
        portalEnabled={portal.enabled}
        placeName={company.name}
        history={history}
      />
    </div>
  );
}

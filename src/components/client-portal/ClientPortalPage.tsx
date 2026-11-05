import { notFound } from "next/navigation";
import { ClientPortalForm } from "@/components/client-portal/ClientPortalForm";
import { portalUrl } from "@/components/client-portal/portal-settings";
import { publicOrigin } from "@/lib/public-origin";
import { getCurrentUser } from "@/services/auth.service";
import { getCompany } from "@/services/company.service";
import { getPortalSettings } from "@/services/portal-settings.service";
import { canAccess } from "@/utils/access";

// Portal do cliente (screens/portal-do-cliente.md): só o ADMIN, e só com a
// funcionalidade no plano; os demais veem 404, e a API recusa com 403.
export async function ClientPortalPage() {
  const { type, company: current, access } = await getCurrentUser();
  if (type !== "ADMIN" || !canAccess(access, "client-portal")) notFound();

  const [settings, company, origin] = await Promise.all([
    getPortalSettings(),
    getCompany(current.id),
    publicOrigin(),
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <h1 className="text-2xl font-semibold">Portal do cliente</h1>
      {/* key: depois de salvar, o formulário recomeça com o que foi gravado. */}
      <ClientPortalForm
        key={JSON.stringify(settings)}
        settings={settings}
        editable={canAccess(access, "client-portal", "edit")}
        url={portalUrl(origin, company.subdomain)}
      />
    </div>
  );
}

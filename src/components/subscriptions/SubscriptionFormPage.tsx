import { notFound } from "next/navigation";
import { SubscriptionForm } from "@/components/subscriptions/SubscriptionForm";
import { ApiError } from "@/services/api";
import { getCurrentUser } from "@/services/auth.service";
import { getCompany } from "@/services/company.service";
import { getSubscription } from "@/services/subscription.service";

/**
 * Criar ou alterar a assinatura de uma empresa (screens/assinaturas.md). Só o
 * SUPER_ADMIN; empresa inexistente (ou a da plataforma, que não tem
 * assinatura): 404.
 */
export async function SubscriptionFormPage({
  companyId,
}: {
  companyId: string;
}) {
  const currentUser = await getCurrentUser();
  if (currentUser.type !== "SUPER_ADMIN") notFound();
  if (companyId === currentUser.company.id) notFound();

  const [company, subscription] = await Promise.all([
    getCompany(companyId),
    getSubscription(companyId),
  ]).catch((error: unknown) => {
    if (error instanceof ApiError && [400, 404].includes(error.status)) {
      notFound();
    }
    throw error;
  });
  const name = company.fantasyName ?? company.corporateReason;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {subscription ? "Alterar assinatura" : "Nova assinatura"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {name}: plano, valor e as datas que definem a situação.
        </p>
      </div>
      <SubscriptionForm
        companyId={companyId}
        companyName={name}
        subscription={subscription}
      />
    </div>
  );
}

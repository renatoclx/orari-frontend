import type { Metadata } from "next";
import { Package } from "lucide-react";
import { MenuSubpageHeader } from "@/components/client-app/MenuSubpageHeader";
import {
  periodLabel,
  planStatusLabel,
} from "@/components/client-app/agreements";
import { Badge } from "@/components/ui/badge";
import { listPlans } from "@/services/app-profile.service";

export const metadata: Metadata = { title: "Pacotes" };

/**
 * Menu → Pacotes (screens/app-cliente.md): os pacotes contratados em todos os
 * estabelecimentos, só para ver (plano, período e situação; sem valores).
 */
export default async function AppPlansPage() {
  const plans = await listPlans();
  return (
    <>
      <MenuSubpageHeader
        title="Pacotes"
        description="Os pacotes que você contratou. Para contratar ou mudar, fale com o estabelecimento."
      />
      {plans.length > 0 ? (
        <ul className="space-y-3">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className="flex items-start gap-3 rounded-card border border-border bg-card p-4"
            >
              <Package
                className="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1 space-y-0.5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{plan.planName}</p>
                  <Badge
                    variant={
                      plan.status === "active"
                        ? "success"
                        : plan.status === "cancelled"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {planStatusLabel(plan.status)}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {periodLabel(plan.startDate, plan.endDate)}
                </p>
                <p className="text-muted-foreground">{plan.place.name}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-card border border-border bg-card p-4 text-sm text-muted-foreground">
          Você não tem pacotes contratados.
        </p>
      )}
    </>
  );
}

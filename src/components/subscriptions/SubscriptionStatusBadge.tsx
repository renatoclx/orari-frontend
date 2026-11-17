import { STATUS_BADGES } from "@/components/subscriptions/subscription-catalog";
import { Badge } from "@/components/ui/badge";
import type { SubscriptionStatus } from "@/types/subscription";

/** Situação da assinatura; sem assinatura, uma badge neutra. */
export function SubscriptionStatusBadge({
  status,
}: {
  status: SubscriptionStatus | null;
}) {
  if (!status) return <Badge variant="outline">Sem assinatura</Badge>;
  const { label, variant } = STATUS_BADGES[status];
  return <Badge variant={variant}>{label}</Badge>;
}

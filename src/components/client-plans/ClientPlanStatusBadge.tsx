import { CLIENT_PLAN_STATUS } from "@/components/client-plans/client-plan-status";
import { Badge } from "@/components/ui/badge";
import type { ClientPlanStatus } from "@/types/client-plan";

// Ativa (verde), encerrada (neutra) e cancelada (vermelha).
const VARIANT = {
  active: "success",
  ended: "secondary",
  cancelled: "destructive",
} as const;

export function ClientPlanStatusBadge({
  status,
}: {
  status: ClientPlanStatus;
}) {
  return <Badge variant={VARIANT[status]}>{CLIENT_PLAN_STATUS[status]}</Badge>;
}

import { Badge } from "@/components/ui/badge";

// Status da recorrência: ativa (verde) ou cancelada (vermelho).
export function RecurrenceStatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="success">Ativa</Badge>
  ) : (
    <Badge variant="destructive">Cancelada</Badge>
  );
}

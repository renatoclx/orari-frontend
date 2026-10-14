import { Badge } from "@/components/ui/badge";

// Status das entidades (screen-patterns.md, "Badges"): verde para ativo e
// vermelho para inativo, em caixa alta.
export function StatusBadge({ active }: { active: boolean }) {
  return active ? (
    <Badge variant="success">Ativo</Badge>
  ) : (
    <Badge variant="destructive">Inativo</Badge>
  );
}

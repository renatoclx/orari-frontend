import { Badge } from "@/components/ui/badge";

// Indica se o usuário está vinculado a um profissional (tem acesso à anamnese).
export function ProfessionalBadge({ linked }: { linked: boolean }) {
  return linked ? (
    <Badge variant="success">Sim</Badge>
  ) : (
    <Badge variant="outline">Não</Badge>
  );
}

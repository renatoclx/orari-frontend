import { Badge } from "@/components/ui/badge";
import type { UserListItem } from "@/types/user";

const FALLBACK = { PROFESSIONAL: "Profissional", EMPLOYEE: "Funcionário" };

// Função do usuário: o cargo da pessoa vinculada (ou o tipo, sem cargo). A cor
// diferencia o profissional (acesso à anamnese) do funcionário.
export function FunctionBadge({ person }: { person: UserListItem["people"] }) {
  if (!person) return <span className="text-muted-foreground">--</span>;
  return (
    <Badge variant={person.type === "PROFESSIONAL" ? "success" : "secondary"}>
      {person.profession?.trim() || FALLBACK[person.type]}
    </Badge>
  );
}

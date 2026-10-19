import { Badge } from "@/components/ui/badge";
import type { UserType } from "@/types/auth";
import { formatUserType } from "@/utils/format";

// Tipo do usuário como badge (screens/usuarios.md): cada tipo com a sua cor.
const VARIANT = {
  SUPER_ADMIN: "default",
  ADMIN: "secondary",
  USER: "outline",
} as const;

export function UserTypeBadge({ type }: { type: UserType }) {
  return <Badge variant={VARIANT[type]}>{formatUserType(type)}</Badge>;
}

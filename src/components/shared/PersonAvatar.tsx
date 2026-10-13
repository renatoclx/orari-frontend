import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/format";

type PersonAvatarProps = {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "default" | "lg";
};

// Decorativo: o nome sempre aparece ao lado, então fica fora da leitura de tela.
export function PersonAvatar({
  name,
  photoUrl,
  size = "default",
}: PersonAvatarProps) {
  return (
    <Avatar size={size} aria-hidden="true">
      {photoUrl && <AvatarImage src={photoUrl} alt="" />}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}

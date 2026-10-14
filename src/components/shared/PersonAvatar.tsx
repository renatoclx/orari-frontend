import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/utils/format";

type PersonAvatarProps = {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "default" | "lg";
  className?: string;
};

// Decorativo: o nome sempre aparece ao lado, então fica fora da leitura de tela.
export function PersonAvatar({
  name,
  photoUrl,
  size = "default",
  className,
}: PersonAvatarProps) {
  return (
    <Avatar size={size} aria-hidden="true" className={className}>
      {photoUrl && <AvatarImage src={photoUrl} alt="" />}
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}

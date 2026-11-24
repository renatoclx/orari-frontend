import { ShoppingBag } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Foto do produto no mesmo círculo das pessoas; sem foto, o ícone do menu.
// Decorativa: o nome sempre aparece ao lado.
export function ProductPhoto({
  photoUrl,
  size = "default",
  className,
}: {
  photoUrl: string | null;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  return (
    <Avatar size={size} aria-hidden="true" className={className}>
      {photoUrl && <AvatarImage src={photoUrl} alt="" />}
      <AvatarFallback>
        <ShoppingBag className="size-1/2" />
      </AvatarFallback>
    </Avatar>
  );
}

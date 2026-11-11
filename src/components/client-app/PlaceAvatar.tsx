import Image from "next/image";
import { placeInitials } from "@/components/client-app/client-app";

type PlaceAvatarProps = {
  name: string;
  logoUrl: string | null;
  size?: "md" | "lg" | "xl";
};

// Logo do estabelecimento em círculo; sem logo, as iniciais do nome.
export function PlaceAvatar({ name, logoUrl, size = "md" }: PlaceAvatarProps) {
  const box = {
    md: "size-10 text-sm",
    lg: "size-16 text-lg",
    // Últimos acessos do Início: o logo é o destaque.
    xl: "size-20 text-xl",
  }[size];
  return logoUrl ? (
    <Image
      src={logoUrl}
      alt={`Logo de ${name}`}
      width={80}
      height={80}
      unoptimized
      className={`${box} shrink-0 rounded-full bg-card object-contain`}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`${box} grid shrink-0 place-items-center rounded-full bg-primary/20 font-bold text-primary`}
    >
      {placeInitials(name)}
    </span>
  );
}

import Image from "next/image";
import { placeInitials } from "@/components/client-app/client-app";

type PlaceAvatarProps = {
  name: string;
  logoUrl: string | null;
  size?: "md" | "lg" | "xl";
  /** Texto da imagem; "" quando o nome já aparece ao lado (ex.: profissional). */
  alt?: string;
};

// Logo do estabelecimento em círculo; sem logo, as iniciais do nome. Serve
// também para a foto do profissional no Agendar, com o mesmo jeito.
export function PlaceAvatar({
  name,
  logoUrl,
  size = "md",
  alt = `Logo de ${name}`,
}: PlaceAvatarProps) {
  const box = {
    md: "size-10 text-sm",
    lg: "size-16 text-lg",
    // Últimos acessos do Início: o logo é o destaque.
    xl: "size-20 text-xl",
  }[size];
  return logoUrl ? (
    <Image
      src={logoUrl}
      alt={alt}
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

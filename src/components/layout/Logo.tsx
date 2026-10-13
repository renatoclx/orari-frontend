import Image from "next/image";

type LogoProps = {
  variant: "full" | "icon";
  /** Altura da logo; a largura acompanha a proporção. */
  className?: string;
};

export function Logo({ variant, className = "h-8 w-auto" }: LogoProps) {
  if (variant === "icon") {
    return (
      <Image
        src="/logo/logo-icon-color.svg"
        alt="Orari"
        width={300}
        height={287}
        className={className}
        priority
      />
    );
  }

  return (
    <Image
      src="/logo/logo-full-color.svg"
      alt="Orari"
      width={728}
      height={287}
      className={className}
      priority
    />
  );
}

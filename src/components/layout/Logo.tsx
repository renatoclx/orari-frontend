import Image from "next/image";

type LogoProps = {
  variant: "full" | "icon";
};

export function Logo({ variant }: LogoProps) {
  if (variant === "icon") {
    return (
      <Image
        src="/logo/logo-icon-color.svg"
        alt="Orari"
        width={300}
        height={287}
        className="h-8 w-auto"
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
      className="h-8 w-auto"
      priority
    />
  );
}

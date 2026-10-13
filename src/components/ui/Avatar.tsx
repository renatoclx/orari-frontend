type AvatarSize = "sm" | "md";

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-8 text-xs",
  md: "size-9 text-sm",
};

/** "Lucas Andrade" → "LA"; "Hugo" → "H" */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

type AvatarProps = {
  name: string;
  photoUrl?: string | null;
  size?: AvatarSize;
};

// Decorativo: o nome sempre aparece ao lado, então fica fora da leitura de tela.
export function Avatar({ name, photoUrl, size = "md" }: AvatarProps) {
  const baseClass = `shrink-0 rounded-full border border-border bg-background ${sizeClasses[size]}`;

  if (photoUrl) {
    return (
      // A origem das fotos ainda não foi definida; com next/image seria preciso
      // liberar o domínio no next.config.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        aria-hidden="true"
        className={`${baseClass} object-cover`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${baseClass} flex items-center justify-center font-medium`}
    >
      {getInitials(name)}
    </span>
  );
}

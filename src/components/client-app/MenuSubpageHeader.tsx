import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Topo das telas que se abrem pelo Menu: "‹ Menu", o título e uma explicação.
export function MenuSubpageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="space-y-1">
      <Link
        href="/app/menu"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Menu
      </Link>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </header>
  );
}

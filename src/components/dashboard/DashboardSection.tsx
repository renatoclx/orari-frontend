import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Um grupo do Dashboard: o nome do relatório de origem, o atalho para ele e
 * os blocos, dois por linha em telas largas.
 */
export function DashboardSection({
  title,
  href,
  children,
}: {
  title: string;
  /** Relatório completo. */
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-label={title} className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link href={href} aria-label={`Ver relatório: ${title}`}>
            <Eye aria-hidden="true" />
            Ver relatório
          </Link>
        </Button>
      </div>
      <div className="grid gap-3 xl:grid-cols-2">{children}</div>
    </section>
  );
}

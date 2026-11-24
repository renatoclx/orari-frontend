import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

// Mesmo desenho dos cartões de Pagamentos (PaymentsSummary): faixa à
// esquerda, ícone em círculo tingido e o valor grande. A casca (link ou div)
// usa esta classe; o conteúdo vem do SummaryCardContent.
export const summaryCardClass =
  "relative flex items-center gap-3 overflow-hidden rounded-card border border-border bg-card p-3 pl-4 sm:gap-4 sm:p-4 sm:pl-5";

/** Conteúdo de um cartão de resumo dos relatórios. */
export function SummaryCardContent({
  icon: Icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  detail: React.ReactNode;
  tone: "neutral" | "negative" | "positive";
}) {
  return (
    <>
      <span
        className={cn(
          "absolute inset-y-0 left-0 w-1.5",
          tone === "negative" && "bg-destructive",
          tone === "positive" && "bg-success",
          tone === "neutral" && "bg-muted-foreground",
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full max-sm:hidden sm:size-11",
          tone === "negative" &&
            "bg-destructive/10 text-destructive dark:text-red-400",
          tone === "positive" && "bg-success/15 text-success",
          tone === "neutral" && "bg-muted text-foreground",
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "block text-xl font-semibold tabular-nums sm:text-2xl",
            tone === "negative" && "text-destructive dark:text-red-400",
            tone === "positive" && "text-success",
          )}
        >
          {value}
        </span>
        <span className="block text-sm text-muted-foreground tabular-nums">
          {detail}
        </span>
      </span>
    </>
  );
}

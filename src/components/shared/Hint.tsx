"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type HintProps = Omit<
  React.ComponentProps<typeof TooltipTrigger>,
  "asChild" | "children"
> & {
  /** Texto da dica: diga o que a ação faz e sobre o quê (ex.: "Alterar Maria"). */
  label: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  /** O elemento que recebe a dica (um único elemento). */
  children: React.ReactElement;
};

/**
 * Dica ao passar o mouse ou focar com o teclado, no lugar do `title` nativo
 * (que é lento, sem estilo e não aparece no foco). Repassa as props ao
 * elemento filho, então pode ficar dentro de `DropdownMenuTrigger asChild`,
 * `PopoverTrigger asChild` e similares.
 */
export function Hint({ label, side, children, ...triggerProps }: HintProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild {...triggerProps}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}

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
 *
 * O foco só abre a dica quando é visível (Tab do teclado). Diálogos e gavetas
 * focam um botão sozinhos ao abrir; esse foco programático, depois de um clique
 * ou toque, não é visível e não deve mostrar a dica.
 */
export function Hint({ label, side, children, ...triggerProps }: HintProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        asChild
        onFocus={(event) => {
          // O Radix não abre a dica se o evento for cancelado.
          if (!event.currentTarget.matches(":focus-visible")) {
            event.preventDefault();
          }
        }}
        {...triggerProps}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent side={side}>{label}</TooltipContent>
    </Tooltip>
  );
}

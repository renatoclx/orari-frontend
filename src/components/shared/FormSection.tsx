"use client";

import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type FormSectionProps = {
  title: string;
  /** Resumo do que há dentro, visível com a seção recolhida. */
  description: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
};

// Seção recolhível de formulário: campos opcionais ficam fora do caminho até
// serem necessários.
export function FormSection({
  title,
  description,
  defaultOpen = false,
  children,
}: FormSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="border-t border-border">
      <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 py-3 text-left">
        <span>
          <span className="block font-semibold">{title}</span>
          <span className="block text-sm text-muted-foreground">
            {description}
          </span>
        </span>
        <ChevronDown
          className="size-5 shrink-0 text-muted-foreground group-data-[state=open]:rotate-180 motion-safe:transition-transform"
          aria-hidden="true"
        />
      </CollapsibleTrigger>
      {/* forceMount: fechada, a seção continua montada (só escondida), para não
          perder o que foi digitado nem os campos no envio do formulário. */}
      <CollapsibleContent
        forceMount
        className="pt-1 pb-4 data-[state=closed]:hidden"
      >
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

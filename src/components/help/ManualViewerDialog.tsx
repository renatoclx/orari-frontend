"use client";

import { ExternalLink, X } from "lucide-react";
import type { Manual } from "@/components/help/manuals";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ManualViewerDialogProps = {
  /** Manual aberto; nulo com o diálogo fechado. */
  manual: Manual | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * O PDF no visualizador do navegador (com busca, impressão e zoom), sem sair
 * da tela. "Abrir em nova aba" serve onde o PDF não aparece embutido (celular).
 */
export function ManualViewerDialog({
  manual,
  onOpenChange,
}: ManualViewerDialogProps) {
  return (
    <Dialog open={manual !== null} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90dvh] flex-col sm:max-w-4xl">
        {manual && (
          <>
            <DialogHeader>
              <DialogTitle>{manual.title}</DialogTitle>
              <DialogDescription>{manual.description}</DialogDescription>
            </DialogHeader>
            <iframe
              src={manual.file}
              title={manual.title}
              className="min-h-0 w-full flex-1 rounded-control border border-border"
            />
            <DialogFooter>
              <Button asChild variant="outline">
                <a href={manual.file} target="_blank" rel="noreferrer">
                  <ExternalLink aria-hidden="true" />
                  Abrir em nova aba
                </a>
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                <X aria-hidden="true" />
                Fechar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

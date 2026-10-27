"use client";

import { useEffect, useState, useTransition } from "react";
import { ExternalLink, FileText, Printer } from "lucide-react";
import { pdfErrorMessage } from "@/components/anamnesis/records/pdf-error";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type AnamnesisPdfDialogProps = {
  clientId: string;
  anamnesisId: string;
};

/**
 * Impressão da ficha: o PDF é gerado no backend e chega pelo Route Handler
 * (`.../pdf`), que leva o token do cookie. Aparece aqui, no visualizador do
 * navegador, que tem o botão de imprimir. O arquivo existe só na memória da
 * página (URL de blob, revogada ao fechar): nada de saúde em disco nem em cache.
 */
export function AnamnesisPdfDialog({
  clientId,
  anamnesisId,
}: AnamnesisPdfDialogProps) {
  const [open, setOpen] = useState(false);
  // O histórico é controle do profissional: marcado por padrão; sem ele, só a
  // ficha, para a via do cliente.
  const [includeHistory, setIncludeHistory] = useState(true);
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  // Libera a memória do PDF ao trocar de arquivo ou sair da tela.
  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setPdfUrl(undefined);
      setError(undefined);
    }
  }

  function changeIncludeHistory(next: boolean) {
    setIncludeHistory(next);
    // Outra opção, outro arquivo: o anterior deixa de valer.
    setPdfUrl(undefined);
    setError(undefined);
  }

  function generate() {
    setError(undefined);
    startTransition(async () => {
      try {
        const response = await fetch(
          `/clientes/${clientId}/anamnese/${anamnesisId}/pdf?includeHistory=${includeHistory}`,
          { cache: "no-store" },
        );
        if (!response.ok) {
          if (response.status === 401) {
            // Navegação completa (e não o router): é um Route Handler que apaga os cookies e leva ao login.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = "/session-expired";
            return;
          }
          const body = (await response.json().catch(() => null)) as {
            message?: string;
          } | null;
          setError(pdfErrorMessage(response.status, body?.message));
          return;
        }
        // Sem sessão, o proxy leva ao login (a resposta é a página, não o PDF).
        if (
          response.redirected ||
          !response.headers.get("content-type")?.includes("application/pdf")
        ) {
          setError(pdfErrorMessage(401));
          return;
        }
        setPdfUrl(URL.createObjectURL(await response.blob()));
      } catch {
        setError(pdfErrorMessage(0));
      }
    });
  }

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Printer aria-hidden="true" />
        Imprimir
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Imprimir ficha</DialogTitle>
            <DialogDescription>
              Gere o PDF e use o botão de imprimir do visualizador.
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-start gap-2">
            <Checkbox
              id="pdf-include-history"
              checked={includeHistory}
              onCheckedChange={(checked) =>
                changeIncludeHistory(checked === true)
              }
              className="mt-0.5"
            />
            <div className="space-y-0.5">
              <Label htmlFor="pdf-include-history">
                Incluir histórico de acompanhamento
              </Label>
              <p className="text-xs text-muted-foreground">
                Desmarque para a via do cliente: sai só a ficha, para
                assinatura.
              </p>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          {pdfUrl ? (
            <div className="space-y-3">
              {/* Em alguns celulares o PDF não aparece embutido: a nova aba resolve. */}
              <iframe
                src={pdfUrl}
                title="Ficha de anamnese em PDF"
                className="h-[65vh] w-full rounded-control border border-border"
              />
              <div className="flex justify-end">
                <Button asChild variant="outline">
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink aria-hidden="true" />
                    Abrir em nova aba
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button onClick={generate} disabled={pending}>
                <FileText aria-hidden="true" />
                {pending ? "Gerando…" : "Gerar PDF"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

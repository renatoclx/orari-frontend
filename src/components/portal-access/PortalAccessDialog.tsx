"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Copy, MessageCircle, QrCode, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { createPortalAccessAction } from "@/app/(admin)/portal-access-actions";
import {
  accessMessage,
  whatsAppLink,
} from "@/components/portal-access/portal-access";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toDateString, toTimeString } from "@/utils/time";

type PortalAccessDialogProps = {
  personId: string;
  clientName: string;
  companyName: string;
  phone: string | null;
  timeZone: string;
};

type Generated = { url: string; expiresAt: string; qr: string };

/**
 * "Acesso ao portal" na listagem e no histórico do cliente (screens/pessoas.md). Gera o link
 * só quando a clínica pede (gerar invalida o anterior) e mostra o QR code, o
 * link para copiar e o atalho para enviar pelo WhatsApp da própria clínica.
 */
export function PortalAccessDialog({
  compact = false,
  ...props
}: PortalAccessDialogProps & {
  /** Na coluna Ações da listagem: só o ícone, com a dica. */
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const label = `Acesso ao portal de ${props.clientName}`;
  return (
    <>
      {compact ? (
        <Hint label={label}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            onClick={() => setOpen(true)}
          >
            <QrCode aria-hidden="true" />
          </Button>
        </Hint>
      ) : (
        <Button variant="outline" onClick={() => setOpen(true)}>
          <QrCode aria-hidden="true" />
          Acesso ao portal
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          {/* Só existe aberto: fechar e abrir de novo recomeça (sem link gerado). */}
          {open && <AccessContent {...props} onClose={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function AccessContent({
  personId,
  clientName,
  companyName,
  phone,
  timeZone,
  onClose,
}: PortalAccessDialogProps & { onClose: () => void }) {
  const [generated, setGenerated] = useState<Generated>();
  const [pending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      const result = await createPortalAccessAction(personId);
      if (!result.ok) {
        toast.error("Não foi possível gerar o acesso.", {
          description: result.message,
        });
        return;
      }
      // QR gerado no navegador, como imagem (sem serviço externo).
      const qr = await QRCode.toDataURL(result.url, { margin: 1, width: 240 });
      setGenerated({ url: result.url, expiresAt: result.expiresAt, qr });
    });
  }

  async function copy() {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated.url);
      toast.success("Link copiado.");
    } catch {
      toast.error("Não foi possível copiar. Selecione e copie o link.");
    }
  }

  const until = generated
    ? `${toDateString(new Date(generated.expiresAt), timeZone)
        .split("-")
        .reverse()
        .join("/")} às ${toTimeString(generated.expiresAt, timeZone)}`
    : "";

  return (
    <>
      <DialogHeader>
        <DialogTitle>Acesso ao portal</DialogTitle>
        <DialogDescription>
          {clientName} entra no portal por um link de uso único, que vale por 24
          horas. Gerar um novo invalida o anterior.
        </DialogDescription>
      </DialogHeader>

      {!generated ? (
        <p className="text-sm text-muted-foreground">
          Gere o link e envie pelo WhatsApp da clínica, ou mostre o QR code para
          o cliente escanear no balcão.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Imagem gerada no navegador (data URL): sem otimização do Next. */}
          <Image
            src={generated.qr}
            alt={`QR code do acesso de ${clientName} ao portal`}
            width={192}
            height={192}
            unoptimized
            className="mx-auto size-48 rounded-control border border-border bg-white p-2"
          />
          <div className="flex gap-2">
            <Input
              value={generated.url}
              readOnly
              aria-label="Link de acesso"
              className="min-w-0"
            />
            <Hint label="Copiar o link">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Copiar o link"
                onClick={copy}
              >
                <Copy aria-hidden="true" />
              </Button>
            </Hint>
          </div>
          <p className="text-sm text-muted-foreground">
            Vale até {until}, uma vez só.
          </p>
          <Button asChild variant="outline" className="w-full">
            <a
              href={whatsAppLink(
                phone,
                accessMessage(clientName, companyName, generated.url),
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle aria-hidden="true" />
              Enviar pelo WhatsApp
            </a>
          </Button>
        </div>
      )}

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={pending}>
          <X aria-hidden="true" />
          Fechar
        </Button>
        <Button onClick={generate} disabled={pending}>
          <RefreshCw aria-hidden="true" />
          {pending ? "Gerando…" : generated ? "Gerar outro" : "Gerar link"}
        </Button>
      </DialogFooter>
    </>
  );
}

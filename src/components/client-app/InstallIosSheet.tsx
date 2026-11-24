"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Ellipsis, Share, SquarePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Como instalar o app no iPhone (screens/app-cliente.md, "Instalar no
 * celular"). O iPhone não tem botão de instalar: o cliente precisa do Safari e
 * de dois toques. A janela é desenhada aqui, e não com o Dialog do shadcn: ele
 * abre fora da área escura do app e sairia clara. Fecha pelo botão, pelo fundo
 * ou pelo Esc.
 */
export function InstallIosSheet({
  safari,
  onClose,
}: {
  /** Está no Safari? Outro navegador precisa abrir o endereço no Safari. */
  safari: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // A página de trás não rola enquanto a janela está aberta.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);

  const copyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/app`);
      setCopied(true);
    } catch {
      // Sem permissão para copiar: o endereço continua à vista para digitar.
    }
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-ios-title"
        onClick={(event) => event.stopPropagation()}
        className="max-h-dvh w-full max-w-md space-y-5 overflow-y-auto rounded-t-card border border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
      >
        <div className="space-y-1">
          <h2 id="install-ios-title" className="text-lg font-semibold">
            Instalar o Orari no iPhone
          </h2>
          <p className="text-sm text-muted-foreground">
            O app abre direto da tela de início, em tela cheia.
          </p>
        </div>

        {safari ? (
          <ol className="space-y-5">
            <Step number={1} title="Toque nos três pontinhos">
              {/* Barra do Safari (ilustrativa): o endereço e o botão "…" em destaque. */}
              <div
                aria-hidden="true"
                className="mt-2 flex items-center gap-3 rounded-control bg-muted px-4 py-2 text-muted-foreground"
              >
                <span className="flex h-9 flex-1 items-center justify-center rounded-full bg-background/60 text-xs">
                  app.orariapp.com.br
                </span>
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary ring-2 ring-primary">
                  <Ellipsis className="size-5" />
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                O botão com os três pontinhos fica ao lado do endereço, na barra
                do Safari. Se a sua barra já mostrar o Compartilhar (iOS mais
                antigo), vá para o passo 2.
              </p>
            </Step>
            <Step number={2} title="Toque em Compartilhar">
              <div
                aria-hidden="true"
                className="mt-2 flex items-center justify-between rounded-control bg-muted px-4 py-3 text-sm ring-2 ring-primary"
              >
                <span>Compartilhar</span>
                <Share className="size-5" />
              </div>
            </Step>
            <Step number={3} title="Escolha Adicionar à Tela de Início">
              <div
                aria-hidden="true"
                className="mt-2 flex items-center justify-between rounded-control bg-muted px-4 py-3 text-sm ring-2 ring-primary"
              >
                <span>Adicionar à Tela de Início</span>
                <SquarePlus className="size-5" />
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Role a lista para baixo, se não aparecer logo.
              </p>
            </Step>
            <Step number={4} title="Toque em Adicionar">
              <p className="mt-1 text-sm text-muted-foreground">
                O Orari aparece na tela de início. Abra o app por ele.
              </p>
            </Step>
          </ol>
        ) : (
          <div className="space-y-3">
            <div className="rounded-control border border-primary/30 bg-primary/10 p-3 text-sm">
              <p className="font-medium">Abra no Safari</p>
              <p className="mt-0.5 text-muted-foreground">
                No iPhone, a instalação só funciona pelo Safari. Copie o
                endereço, abra o Safari, cole e siga os passos que aparecem
                aqui.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => void copyAddress()}
              className="h-12 w-full text-base"
            >
              {copied ? (
                <Check aria-hidden="true" />
              ) : (
                <Copy aria-hidden="true" />
              )}
              {copied ? "Endereço copiado" : "Copiar endereço"}
            </Button>
          </div>
        )}

        <Button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="h-12 w-full text-base"
        >
          <X aria-hidden="true" />
          Entendi
        </Button>
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        {children}
      </div>
    </li>
  );
}

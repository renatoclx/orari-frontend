"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Circle, CircleCheck, RotateCcw, X } from "lucide-react";
import { getOnboardingAction } from "@/app/(admin)/onboarding-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Onboarding } from "@/types/onboarding";
import { DismissOnboardingButton } from "./DismissOnboardingButton";
import { onboardingItems, progressPercent, progressText } from "./onboarding";

type Loaded = { key: number; onboarding?: Onboarding; failed?: boolean };

/**
 * "Primeiros passos" (screens/dashboard.md): a orientação da clínica nova fica
 * fora do Dashboard, num dialog aberto pela notificação de boas-vindas. Busca os
 * passos ao abrir, para mostrar sempre o que já foi feito.
 */
export function OnboardingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // A versão sobe em "Tentar de novo" e a cada abertura, para buscar outra vez.
  const [version, setVersion] = useState(0);
  const [loaded, setLoaded] = useState<Loaded>();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    getOnboardingAction()
      .then((result) => {
        if (cancelled) return;
        setLoaded(
          result.ok
            ? { key: version, onboarding: result.onboarding }
            : { key: version, failed: true },
        );
      })
      // Falha inesperada: sem isso, ficaria "buscando" para sempre.
      .catch(() => {
        if (!cancelled) setLoaded({ key: version, failed: true });
      });
    return () => {
      cancelled = true;
    };
  }, [open, version]);

  // O resultado de outra versão é antigo: mostra "buscando".
  const current = loaded?.key === version ? loaded : undefined;
  const onboarding = current?.onboarding;

  function handleOpenChange(next: boolean) {
    // Ao fechar, a próxima abertura começa do zero.
    if (!next) setLoaded(undefined);
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[85dvh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Primeiros passos</DialogTitle>
          <DialogDescription>
            Deixe a clínica pronta para agendar. Cada passo leva à tela certa.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
          {!current && (
            <p className="text-sm text-muted-foreground">Buscando…</p>
          )}
          {current?.failed && (
            <div role="alert" className="space-y-3 text-sm">
              <p>Não foi possível buscar os primeiros passos.</p>
              <Button
                variant="outline"
                onClick={() => setVersion((value) => value + 1)}
              >
                <RotateCcw aria-hidden="true" />
                Tentar de novo
              </Button>
            </div>
          )}
          {onboarding && (
            <>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {progressText(onboarding)}
                </p>
                <div
                  role="progressbar"
                  aria-label="Primeiros passos"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPercent(onboarding)}
                  className="h-2 overflow-hidden rounded-full bg-muted"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progressPercent(onboarding)}%` }}
                  />
                </div>
              </div>
              <ul className="space-y-2">
                {onboardingItems(onboarding).map((item) => (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      onClick={() => handleOpenChange(false)}
                      className="flex items-start gap-3 rounded-control border border-border p-3 hover:bg-muted"
                    >
                      {item.done ? (
                        <CircleCheck
                          className="mt-0.5 size-5 shrink-0 text-success"
                          aria-hidden="true"
                        />
                      ) : (
                        <Circle
                          className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                      <span className="min-w-0 flex-1 text-sm">
                        <span
                          className={`block font-medium ${
                            item.done
                              ? "text-muted-foreground line-through"
                              : ""
                          }`}
                        >
                          {item.label}
                          {item.done && (
                            <span className="sr-only"> (feito)</span>
                          )}
                          {item.optional && (
                            <span className="font-normal text-muted-foreground">
                              {" "}
                              · opcional
                            </span>
                          )}
                        </span>
                        <span className="block text-muted-foreground">
                          {item.hint}
                        </span>
                      </span>
                      {!item.done && (
                        <ArrowRight
                          className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                          aria-hidden="true"
                        />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <DialogFooter>
          {onboarding && !onboarding.dismissed && (
            <DismissOnboardingButton onDone={() => handleOpenChange(false)} />
          )}
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            <X aria-hidden="true" />
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

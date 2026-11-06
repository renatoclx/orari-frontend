"use client";

import { useState, useTransition } from "react";
import { Trash2, X } from "lucide-react";
import { appClearMessagesAction } from "@/app/app/actions";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { Button } from "@/components/ui/button";

/**
 * Título "Recebidos" de Menu → Avisos com o Limpar (screens/app-cliente.md).
 * Apagar pede confirmação no próprio lugar, como o Cancelar dos agendamentos:
 * as janelas de diálogo da clínica ficam fora da área escura do app.
 */
export function ReceivedHeader({ canClear }: { canClear: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function clear() {
    startTransition(async () => {
      const result = await appClearMessagesAction();
      if (!result.ok) {
        setError(result.message);
        return;
      }
      // Limpo: a página é recarregada (revalidatePath) e a lista fica vazia.
      setConfirming(false);
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <h2 id="messages-title" className="font-semibold">
          Recebidos
        </h2>
        {canClear && !confirming && (
          <Button
            type="button"
            variant="ghost"
            className="h-10 text-muted-foreground"
            onClick={() => {
              setError(undefined);
              setConfirming(true);
            }}
          >
            <Trash2 aria-hidden="true" />
            Limpar
          </Button>
        )}
      </div>

      {confirming && (
        <div className="space-y-2 rounded-control border border-destructive/30 bg-destructive/10 p-3">
          <p className="text-sm">Apagar todos os avisos?</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1"
              disabled={pending}
              onClick={() => setConfirming(false)}
            >
              <X aria-hidden="true" />
              Manter
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-11 flex-1"
              disabled={pending}
              onClick={clear}
            >
              <Trash2 aria-hidden="true" />
              {pending ? "Apagando…" : "Apagar"}
            </Button>
          </div>
        </div>
      )}

      {error && <AppFormMessage>{error}</AppFormMessage>}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { announceNotificationsChanged } from "./useUnreadCount";

/**
 * "Limpar notificações" com a confirmação no próprio lugar (o app e o sino não
 * abrem diálogos): o primeiro toque pede a confirmação, o segundo limpa. Limpar
 * tira tudo da lista e do contador; `action` é a Server Action de quem usa e
 * `onCleared` deixa o sino esvaziar a lista na hora.
 */
export function ClearNotificationsButton({
  action,
  disabled,
  onCleared,
  fullWidth = false,
}: {
  action: () => Promise<void>;
  disabled: boolean;
  onCleared?: () => void;
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  function clear() {
    startTransition(async () => {
      await action();
      setConfirming(false);
      onCleared?.();
      announceNotificationsChanged();
      router.refresh();
    });
  }

  if (!confirming) {
    return (
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => setConfirming(true)}
        className={fullWidth ? "w-full" : undefined}
      >
        <Trash2 aria-hidden="true" />
        Limpar notificações
      </Button>
    );
  }

  return (
    <div
      role="alertdialog"
      aria-label="Confirmar a limpeza"
      className="space-y-2"
    >
      <p className="text-sm">
        Limpar todas as notificações? Elas somem da lista e do contador.
      </p>
      <div className="flex gap-2">
        <Button variant="destructive" onClick={clear} disabled={pending}>
          <Trash2 aria-hidden="true" />
          {pending ? "Limpando…" : "Limpar"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setConfirming(false)}
          disabled={pending}
        >
          <X aria-hidden="true" />
          Manter
        </Button>
      </div>
    </div>
  );
}

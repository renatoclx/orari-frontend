"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { announceNotificationsChanged } from "./useUnreadCount";

/** "Marcar todas como lidas": chama a ação de quem usa e atualiza a página. */
export function MarkAllReadButton({
  action,
  disabled,
  app = false,
}: {
  action: () => Promise<void>;
  disabled: boolean;
  /** No app: o botão ocupa a largura do bloco (h-12, texto de 16 px). */
  app?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      className={app ? "h-12 w-full text-base" : undefined}
      disabled={disabled || pending}
      onClick={() =>
        startTransition(async () => {
          await action();
          announceNotificationsChanged();
          router.refresh();
        })
      }
    >
      <CheckCheck aria-hidden="true" />
      {pending ? "Marcando…" : "Marcar todas como lidas"}
    </Button>
  );
}

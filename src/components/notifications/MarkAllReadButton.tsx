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
}: {
  action: () => Promise<void>;
  disabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
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

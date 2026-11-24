"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { appProDismissWelcomeAction } from "@/app/app/notification-actions";
import { Button } from "@/components/ui/button";

/** "Agora não": esconde o cartão de boas-vindas (só para este usuário). */
export function DismissWelcomeButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      disabled={pending}
      className="h-12 w-full text-base"
      onClick={() =>
        startTransition(async () => {
          await appProDismissWelcomeAction();
          router.refresh();
        })
      }
    >
      <X aria-hidden="true" />
      {pending ? "Dispensando…" : "Agora não"}
    </Button>
  );
}

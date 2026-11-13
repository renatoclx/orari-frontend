"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { dismissOnboardingAction } from "@/app/(admin)/onboarding-actions";
import { Button } from "@/components/ui/button";

/** "Dispensar": esconde a lista de primeiros passos (só para este usuário). */
export function DismissOnboardingButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await dismissOnboardingAction();
          router.refresh();
        })
      }
    >
      <X aria-hidden="true" />
      {pending ? "Dispensando…" : "Dispensar"}
    </Button>
  );
}

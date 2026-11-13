"use client";

import { useTransition } from "react";
import { EyeOff } from "lucide-react";
import { dismissOnboardingAction } from "@/app/(admin)/onboarding-actions";
import { Button } from "@/components/ui/button";

/** "Dispensar": esconde a lista de primeiros passos (só para este usuário). */
export function DismissOnboardingButton({ onDone }: { onDone: () => void }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await dismissOnboardingAction();
          onDone();
        })
      }
    >
      <EyeOff aria-hidden="true" />
      {pending ? "Dispensando…" : "Dispensar"}
    </Button>
  );
}

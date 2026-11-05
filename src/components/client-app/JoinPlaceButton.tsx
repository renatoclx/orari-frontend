"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { appJoinPlaceAction } from "@/app/app/actions";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { Button } from "@/components/ui/button";

/** "Entrar neste estabelecimento" na página do local (screens/app-cliente.md). */
export function JoinPlaceButton({ slug }: { slug: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div className="space-y-3">
      {error && <AppFormMessage>{error}</AppFormMessage>}
      <Button
        type="button"
        disabled={pending}
        className="h-12 w-full text-base"
        onClick={() =>
          startTransition(async () => {
            const result = await appJoinPlaceAction(slug);
            if (result) setError(result.message);
          })
        }
      >
        <UserPlus aria-hidden="true" />
        {pending ? "Entrando…" : "Entrar neste estabelecimento"}
      </Button>
    </div>
  );
}

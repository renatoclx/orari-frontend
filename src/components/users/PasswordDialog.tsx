"use client";

import { useState, useTransition } from "react";
import { KeyRound, X } from "lucide-react";
import { toast } from "sonner";
import { resetUserPasswordAction } from "@/app/(admin)/user-actions";
import { validatePassword } from "@/components/users/user-validation";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { UserListItem } from "@/types/user";

type PasswordDialogProps = {
  /** Usuário cuja senha será alterada; nulo = fechado. */
  user: UserListItem | null;
  onOpenChange: (open: boolean) => void;
};

/** Alteração de senha em dialog: nova senha e confirmação, ambas obrigatórias. */
export function PasswordDialog({ user, onOpenChange }: PasswordDialogProps) {
  return (
    <Dialog open={user !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {user && (
          <PasswordForm user={user} onClose={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

function PasswordForm({
  user,
  onClose,
}: {
  user: UserListItem;
  onClose: () => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<{
    password?: string;
    passwordConfirmation?: string;
  }>({});
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validatePassword(password, confirmation);
    setErrors(found);
    if (found.password || found.passwordConfirmation) {
      document
        .getElementById(
          found.password ? "new-password" : "new-password-confirmation",
        )
        ?.focus();
      return;
    }

    startTransition(async () => {
      const result = await resetUserPasswordAction(
        user.id,
        password,
        confirmation,
      );
      if (result.ok) {
        toast.success("Senha alterada.", { description: user.name });
        onClose();
        return;
      }
      toast.error("Não foi possível alterar a senha.", {
        description: result.message,
      });
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Alterar senha</DialogTitle>
        <DialogDescription>
          Nova senha de {user.name} ({user.email}).
        </DialogDescription>
      </DialogHeader>

      <FormField
        id="new-password"
        label="Nova senha"
        required
        error={errors.password}
      >
        <Input
          id="new-password"
          type="password"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrors((current) => ({ ...current, password: undefined }));
          }}
          autoComplete="new-password"
          aria-invalid={errors.password ? true : undefined}
          autoFocus
        />
      </FormField>
      <FormField
        id="new-password-confirmation"
        label="Confirme a nova senha"
        required
        error={errors.passwordConfirmation}
      >
        <Input
          id="new-password-confirmation"
          type="password"
          value={confirmation}
          onChange={(event) => {
            setConfirmation(event.target.value);
            setErrors((current) => ({
              ...current,
              passwordConfirmation: undefined,
            }));
          }}
          autoComplete="new-password"
          aria-invalid={errors.passwordConfirmation ? true : undefined}
        />
      </FormField>
      <p className="text-xs text-muted-foreground">
        A senha deve ter de 8 a 72 caracteres.
      </p>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onClose}
        >
          <X aria-hidden="true" />
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          <KeyRound aria-hidden="true" />
          {pending ? "Salvando…" : "Alterar senha"}
        </Button>
      </DialogFooter>
    </form>
  );
}

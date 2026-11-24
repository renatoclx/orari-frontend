"use client";

import { useState, useTransition } from "react";
import { CircleAlert, Eye, EyeOff, KeyRound, X } from "lucide-react";
import { toast } from "sonner";
import {
  changeMyPasswordAction,
  type ChangePasswordFields,
} from "@/app/(admin)/actions";
import { validatePassword } from "@/components/users/user-validation";
import { FormField } from "@/components/shared/FormField";
import { Hint } from "@/components/shared/Hint";
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

type Errors = Partial<Record<keyof ChangePasswordFields, string>>;

const FIELDS: { key: keyof ChangePasswordFields; label: string }[] = [
  { key: "currentPassword", label: "Senha atual" },
  { key: "password", label: "Nova senha" },
  { key: "passwordConfirmation", label: "Confirme a nova senha" },
];

/**
 * Troca da própria senha, aberta pelo menu do usuário (screens/layout.md):
 * senha atual, nova e confirmação. Os outros aparelhos saem; este continua.
 */
export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* Montado só aberto: os campos nascem vazios a cada abertura. */}
        {open && <PasswordForm onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function PasswordForm({ onClose }: { onClose: () => void }) {
  const [values, setValues] = useState<ChangePasswordFields>({
    currentPassword: "",
    password: "",
    passwordConfirmation: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string>();
  const [show, setShow] = useState(false);
  const [pending, startTransition] = useTransition();

  function set(key: keyof ChangePasswordFields, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function focusFirst(found: Errors) {
    const first = FIELDS.find((field) => found[field.key]);
    if (first) document.getElementById(`my-${first.key}`)?.focus();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: Errors = {
      ...(values.currentPassword
        ? {}
        : { currentPassword: "Informe a senha atual." }),
      ...validatePassword(values.password, values.passwordConfirmation),
    };
    setErrors(found);
    setMessage(undefined);
    if (Object.values(found).some(Boolean)) {
      focusFirst(found);
      return;
    }
    startTransition(async () => {
      const result = await changeMyPasswordAction(values);
      if (!result.ok) {
        setErrors(result.fieldErrors);
        setMessage(result.message);
        focusFirst(result.fieldErrors);
        return;
      }
      toast.success("Senha alterada.", {
        description: "Nos outros aparelhos, será preciso entrar de novo.",
      });
      onClose();
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>Alterar senha</DialogTitle>
        <DialogDescription>
          Confirme a senha atual e escolha a nova, com pelo menos 8 caracteres.
        </DialogDescription>
      </DialogHeader>

      {message && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-control border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {message}
        </p>
      )}

      {FIELDS.map((field, index) => (
        <FormField
          key={field.key}
          id={`my-${field.key}`}
          label={field.label}
          required
          error={errors[field.key]}
        >
          <div className="relative">
            <Input
              id={`my-${field.key}`}
              type={show ? "text" : "password"}
              autoComplete={
                field.key === "currentPassword"
                  ? "current-password"
                  : "new-password"
              }
              value={values[field.key]}
              onChange={(event) => set(field.key, event.target.value)}
              aria-invalid={errors[field.key] ? true : undefined}
              className={index === 0 ? "pr-11" : undefined}
            />
            {/* Um olho só, no primeiro campo: mostra ou esconde as três. */}
            {index === 0 && (
              <Hint label={show ? "Esconder as senhas" : "Mostrar as senhas"}>
                <button
                  type="button"
                  onClick={() => setShow((current) => !current)}
                  aria-label={show ? "Esconder as senhas" : "Mostrar as senhas"}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-control p-1.5 text-muted-foreground hover:text-foreground"
                >
                  {show ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              </Hint>
            )}
          </div>
        </FormField>
      ))}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={pending}
        >
          <X aria-hidden="true" />
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          <KeyRound aria-hidden="true" />
          {pending ? "Alterando…" : "Alterar senha"}
        </Button>
      </DialogFooter>
    </form>
  );
}

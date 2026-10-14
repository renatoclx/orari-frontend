"use client";

import { useState, useTransition } from "react";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { quickCreateClientAction } from "@/app/(admin)/clientes/actions";
import {
  validateClientForm,
  type ClientFormErrors,
} from "@/components/clients/client-validation";
import { MaskedInput } from "@/components/shared/MaskedInput";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskPhone } from "@/utils/masks";

// Atalho de cadastro rápido de cliente (screens.md, "Barra de ações lateral"):
// um diálogo só com nome e telefone; o restante é completado depois. Usado na
// barra lateral e no header do celular. O telefone vira o contato principal.
export function QuickClientShortcut() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<ClientFormErrors>({});
  const [pending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setName("");
      setPhone("");
      setErrors({});
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validateClientForm({ name, phone, email: "", document: "" });
    setErrors(found);
    if (found.name) {
      document.getElementById("quick-name")?.focus();
      return;
    }
    if (found.phone) {
      document.getElementById("quick-phone")?.focus();
      return;
    }

    startTransition(async () => {
      const result = await quickCreateClientAction(name, phone);

      if (result.ok) {
        toast.success("Cliente cadastrado.", { description: name.trim() });
        handleOpenChange(false);
        return;
      }

      if (result.field) {
        setErrors({ [result.field]: result.message });
      }
      toast.error("Não foi possível cadastrar o cliente.", {
        description: result.message,
      });
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        aria-label="Cadastrar cliente rapidamente"
        title="Cadastro rápido de cliente"
        className="rounded-control p-2 text-muted-foreground hover:bg-background hover:text-foreground"
      >
        <UserPlus className="size-5" aria-hidden="true" />
      </DialogTrigger>

      <DialogContent>
        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Cadastro rápido</DialogTitle>
            <DialogDescription>
              Informe o nome e o telefone. Os demais dados podem ser adicionados
              depois.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="quick-name">
              <span>
                Nome
                <span className="ml-0.5 text-destructive" aria-hidden="true">
                  *
                </span>
              </span>
            </Label>
            <Input
              id="quick-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (errors.name) setErrors((c) => ({ ...c, name: undefined }));
              }}
              autoComplete="off"
              placeholder="Nome completo"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "quick-name-error" : undefined}
            />
            {errors.name && (
              <p
                id="quick-name-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-phone">
              <span>
                Telefone
                <span className="ml-0.5 text-destructive" aria-hidden="true">
                  *
                </span>
              </span>
            </Label>
            <MaskedInput
              id="quick-phone"
              mask={maskPhone}
              value={phone}
              onValueChange={(next) => {
                setPhone(next);
                if (errors.phone)
                  setErrors((c) => ({ ...c, phone: undefined }));
              }}
              type="tel"
              inputMode="tel"
              placeholder="(11) 91234-5678"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={errors.phone ? "quick-phone-error" : undefined}
            />
            {errors.phone && (
              <p
                id="quick-phone-error"
                role="alert"
                className="text-sm text-destructive"
              >
                {errors.phone}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => handleOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Cadastrando…" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

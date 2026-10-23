"use client";

import { useState, useTransition } from "react";
import { Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { createUserAction, updateUserAction } from "@/app/(admin)/user-actions";
import {
  userFieldOrder,
  validateUpdateUserForm,
  validateUserForm,
  type UserFormErrors,
  type UserFormValues,
} from "@/components/users/user-validation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserType } from "@/types/auth";
import type { UserListItem } from "@/types/user";
import { formatUserType } from "@/utils/format";

type UserFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Presente na alteração; sem isso, é o cadastro. */
  user?: UserListItem;
  /** Tipos que quem está logado pode atribuir (o ADMIN não cria SUPER_ADMIN). */
  typeOptions: UserType[];
  /** Usuário logado: não pode alterar o próprio tipo. */
  currentUserId: string;
  /**
   * Cadastro para outra empresa (o SUPER_ADMIN, ao criar uma empresa): o usuário
   * nasce nela e com o tipo fixo, sem a escolha do tipo.
   */
  forCompany?: { id: string; name: string; type: UserType };
};

// Id de cada campo: liga o erro ao elemento que recebe o foco.
const ids = (field: keyof UserFormValues) => `user-${field}`;

/**
 * Cadastro e alteração de usuário em dialog (screens/usuarios.md). Na alteração
 * não há senha: ela tem dialog próprio.
 */
export function UserFormDialog(props: UserFormDialogProps) {
  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {/* O conteúdo só existe aberto: os campos começam limpos a cada vez. */}
        <UserForm {...props} />
      </DialogContent>
    </Dialog>
  );
}

function UserForm({
  onOpenChange,
  user,
  typeOptions,
  currentUserId,
  forCompany,
}: UserFormDialogProps) {
  const editing = user !== undefined;
  const isSelf = user?.id === currentUserId;
  const [values, setValues] = useState<UserFormValues>({
    name: user?.name ?? "",
    email: user?.email ?? "",
    type: user?.type ?? forCompany?.type ?? "",
    password: "",
    passwordConfirmation: "",
  });
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [pending, startTransition] = useTransition();

  // O tipo atual continua na lista mesmo que quem edita não possa atribuí-lo.
  const options =
    user && !typeOptions.includes(user.type)
      ? [...typeOptions, user.type]
      : typeOptions;

  function set(field: keyof UserFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = editing
      ? validateUpdateUserForm(values)
      : validateUserForm(values);
    setErrors(found);
    const firstInvalid = userFieldOrder.find((field) => found[field]);
    if (firstInvalid) {
      document.getElementById(ids(firstInvalid))?.focus();
      return;
    }

    startTransition(async () => {
      const result = user
        ? await updateUserAction(user.id, values)
        : await createUserAction(values, forCompany?.id);

      if (result.ok) {
        toast.success(
          editing
            ? "Usuário atualizado."
            : forCompany
              ? "Administrador cadastrado."
              : "Usuário cadastrado.",
          { description: values.name.trim() },
        );
        onOpenChange(false);
        return;
      }
      if (result.field) {
        setErrors({ [result.field]: result.message });
        document.getElementById(ids(result.field))?.focus();
      }
      toast.error(
        editing
          ? "Não foi possível atualizar o usuário."
          : "Não foi possível cadastrar o usuário.",
        { description: result.message },
      );
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {editing
            ? "Alterar usuário"
            : forCompany
              ? "Cadastrar administrador"
              : "Novo usuário"}
        </DialogTitle>
        <DialogDescription>
          {editing
            ? `Atualize os dados de ${user.name}. A senha é alterada em "Alterar senha".`
            : forCompany
              ? `Acesso de administrador da empresa ${forCompany.name}.`
              : "Preencha os dados de acesso do novo usuário."}
        </DialogDescription>
      </DialogHeader>

      <FormField id={ids("name")} label="Nome" required error={errors.name}>
        <Input
          id={ids("name")}
          value={values.name}
          onChange={(event) => set("name", event.target.value)}
          autoComplete="off"
          aria-invalid={errors.name ? true : undefined}
          autoFocus
        />
      </FormField>

      <FormField id={ids("email")} label="E-mail" required error={errors.email}>
        <Input
          id={ids("email")}
          type="email"
          value={values.email}
          onChange={(event) => set("email", event.target.value)}
          autoComplete="off"
          aria-invalid={errors.email ? true : undefined}
        />
      </FormField>

      {!forCompany && (
        <FormField
          id={ids("type")}
          label="Tipo de usuário"
          required
          error={errors.type}
        >
          <Select
            value={values.type || undefined}
            onValueChange={(next) => set("type", next)}
            // O próprio tipo não muda (o backend recusa): evita rebaixar a si mesmo.
            disabled={isSelf}
          >
            <SelectTrigger
              id={ids("type")}
              className="w-full"
              aria-invalid={errors.type ? true : undefined}
            >
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {options.map((type) => (
                <SelectItem key={type} value={type}>
                  {formatUserType(type)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isSelf && (
            <p className="text-xs text-muted-foreground">
              Você não pode alterar o seu próprio tipo.
            </p>
          )}
        </FormField>
      )}

      {!editing && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id={ids("password")}
            label="Senha"
            required
            error={errors.password}
          >
            <Input
              id={ids("password")}
              type="password"
              value={values.password}
              onChange={(event) => set("password", event.target.value)}
              autoComplete="new-password"
              aria-invalid={errors.password ? true : undefined}
            />
          </FormField>
          <FormField
            id={ids("passwordConfirmation")}
            label="Confirme a senha"
            required
            error={errors.passwordConfirmation}
          >
            <Input
              id={ids("passwordConfirmation")}
              type="password"
              value={values.passwordConfirmation}
              onChange={(event) =>
                set("passwordConfirmation", event.target.value)
              }
              autoComplete="new-password"
              aria-invalid={errors.passwordConfirmation ? true : undefined}
            />
          </FormField>
        </div>
      )}
      {!editing && (
        <p className="text-xs text-muted-foreground">
          A senha deve ter de 8 a 72 caracteres.
        </p>
      )}

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => onOpenChange(false)}
        >
          <X aria-hidden="true" />
          Cancelar
        </Button>
        <Button type="submit" disabled={pending}>
          {editing ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {editing
            ? pending
              ? "Salvando…"
              : "Salvar alterações"
            : pending
              ? "Cadastrando…"
              : "Cadastrar"}
        </Button>
      </DialogFooter>
    </form>
  );
}

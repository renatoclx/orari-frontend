"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  clientFieldOrder,
  validateClientForm,
  type ClientFormErrors,
} from "@/components/clients/client-validation";
import { AddressesField } from "@/components/people/AddressesField";
import { ContactsField } from "@/components/people/ContactsField";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormFooter } from "@/components/shared/FormFooter";
import { FormSection } from "@/components/shared/FormSection";
import { MaskedInput } from "@/components/shared/MaskedInput";
import { PhotoUpload } from "@/components/shared/PhotoUpload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { State } from "@/types/location";
import type { ContactType } from "@/types/people";
import { contactTypeLabels } from "@/utils/format";
import { maskCpf, maskPhone } from "@/utils/masks";

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
};

function Field({ id, label, required, error, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {/* Um único filho: o Label espaça os filhos com gap. */}
        <span>
          {label}
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden="true">
              *
            </span>
          )}
        </span>
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

type ClientFormProps = {
  states: State[];
};

// Duas colunas ocupando a largura do card (screens.md, "Layout do formulário"):
// à esquerda os dados principais; à direita os opcionais, em seções recolhíveis.
export function ClientForm({ states }: ClientFormProps) {
  const [errors, setErrors] = useState<ClientFormErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [clientName, setClientName] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      document: String(data.get("document") ?? ""),
    };

    const found = validateClientForm(values);
    setErrors(found);

    const firstInvalid = clientFieldOrder.find((field) => found[field]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setClientName(values.name.trim());
    setConfirmOpen(true);
  }

  // Corrigir um campo limpa o erro dele.
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    const field = (event.target as HTMLElement).id as keyof ClientFormErrors;
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  return (
    <>
      <form
        noValidate
        onSubmit={handleSubmit}
        onChange={handleChange}
        // Padrão de página: o card ocupa a largura toda e a altura que sobra.
        className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card"
      >
        <div className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
          {/* Foto centralizada, acima das colunas (screens.md). */}
          <div className="mb-6 flex justify-center">
            <PhotoUpload />
          </div>

          <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
            <section aria-labelledby="client-main" className="space-y-4">
              <h2 id="client-main" className="font-semibold">
                Dados principais
              </h2>

              <Field id="name" label="Nome" required error={errors.name}>
                <Input
                  id="name"
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  name="name"
                  autoComplete="name"
                  placeholder="Nome completo"
                />
              </Field>

              <div className="grid grid-cols-[3fr_2fr] gap-3">
                <Field id="phone" label="Contato" required error={errors.phone}>
                  <MaskedInput
                    id="phone"
                    aria-invalid={errors.phone ? true : undefined}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    name="phone"
                    mask={maskPhone}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(11) 91234-5678"
                  />
                </Field>

                <Field id="contactType" label="Tipo do contato">
                  <Select name="contactType" defaultValue="MAIN">
                    <SelectTrigger id="contactType" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(contactTypeLabels) as ContactType[]).map(
                        (type) => (
                          <SelectItem key={type} value={type}>
                            {contactTypeLabels[type]}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field id="email" label="E-mail" error={errors.email}>
                <Input
                  id="email"
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="nome@exemplo.com"
                />
              </Field>

              <Field id="note" label="Observações">
                <Textarea
                  id="note"
                  name="note"
                  rows={4}
                  // Pelo menos 4 linhas (screens.md); cresce com o conteúdo.
                  className="min-h-28"
                  placeholder="Preferências, cuidados, informações úteis para o atendimento"
                />
              </Field>
            </section>

            <section aria-labelledby="client-optional" className="space-y-4">
              <h2 id="client-optional" className="font-semibold">
                Informações opcionais
              </h2>

              <div>
                <FormSection
                  title="Mais informações"
                  description="CPF, data de nascimento e profissão"
                  defaultOpen
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Field id="document" label="CPF" error={errors.document}>
                        <MaskedInput
                          id="document"
                          aria-invalid={errors.document ? true : undefined}
                          aria-describedby={
                            errors.document ? "document-error" : undefined
                          }
                          name="document"
                          mask={maskCpf}
                          inputMode="numeric"
                          placeholder="000.000.000-00"
                        />
                      </Field>

                      <Field id="birthDate" label="Data de nascimento">
                        <DatePicker
                          id="birthDate"
                          name="birthDate"
                          maxDate={new Date()}
                        />
                      </Field>
                    </div>

                    <Field id="profession" label="Profissão">
                      <Input id="profession" name="profession" />
                    </Field>
                  </div>
                </FormSection>

                <FormSection
                  title="Outros contatos"
                  description="Telefones adicionais"
                >
                  <ContactsField />
                </FormSection>

                <FormSection
                  title="Endereços"
                  description="Onde o cliente pode ser encontrado"
                >
                  <AddressesField states={states} />
                </FormSection>
              </div>
            </section>
          </div>
        </div>

        <FormFooter
          note={
            <>
              <span className="text-destructive">*</span> Campos obrigatórios
            </>
          }
        >
          <Button variant="outline" asChild>
            <Link href="/clientes">Cancelar</Link>
          </Button>
          <Button type="submit">Salvar</Button>
        </FormFooter>
      </form>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cadastrar cliente?</AlertDialogTitle>
            <AlertDialogDescription>
              O cadastro de {clientName} será criado com os dados informados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                // Provisório: o envio à API entra na etapa do salvar (C4).
                toast.info("Dados conferidos.", {
                  description: "O envio ao servidor entra na próxima etapa.",
                })
              }
            >
              Cadastrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

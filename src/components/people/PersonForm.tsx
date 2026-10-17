"use client";

import { Save, X, Plus } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createPersonAction,
  updatePersonAction,
} from "@/app/(admin)/people-actions";
import type { PeopleKind } from "@/components/people/people-kinds";
import {
  personFieldOrder,
  validatePersonForm,
  type PersonFormErrors,
} from "@/components/people/person-validation";
import {
  AddressesField,
  type PersistedAddress,
} from "@/components/people/AddressesField";
import { ContactsField } from "@/components/people/ContactsField";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { FormSection } from "@/components/shared/FormSection";
import { MaskedInput } from "@/components/shared/MaskedInput";
import { PhotoUpload } from "@/components/shared/PhotoUpload";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { State } from "@/types/location";
import type {
  ContactRecord,
  ContactType,
  PersonListItem,
} from "@/types/people";
import { contactTypeLabels } from "@/utils/format";
import { maskCpf, maskPhone } from "@/utils/masks";

/** Dados da pessoa na alteração (vêm do servidor). */
export type EditablePerson = {
  person: PersonListItem;
  /** Contato principal: o que os campos Contato, Tipo e E-mail mostram. */
  mainContact: ContactRecord | null;
  /** Demais contatos ("Outros contatos"). */
  extraContacts: ContactRecord[];
  addresses: PersistedAddress[];
};

type PersonFormProps = {
  kind: PeopleKind;
  states: State[];
  /** Presente na alteração; sem isso, é o cadastro. */
  editing?: EditablePerson;
};

// Duas colunas ocupando a largura do card (screens/pessoas.md, "Layout do formulário"):
// à esquerda os dados principais; à direita os opcionais, em seções recolhíveis.
export function PersonForm({ kind, states, editing }: PersonFormProps) {
  const [errors, setErrors] = useState<PersonFormErrors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [personName, setPersonName] = useState("");
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      document: String(data.get("document") ?? ""),
    };

    const found = validatePersonForm(values);
    setErrors(found);

    const firstInvalid = personFieldOrder.find((field) => found[field]);
    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    setPersonName(values.name.trim());

    if (editing) {
      save(data, values.name.trim());
      return;
    }
    setConfirmOpen(true);
  }

  // Alteração: salva a pessoa, o contato principal e a foto.
  function save(data: FormData, name: string) {
    if (!editing) return;

    startTransition(async () => {
      const result = await updatePersonAction(
        kind.type,
        editing.person.id,
        data,
      );

      if (result.ok) {
        toast.success(`${kind.singularTitle} atualizado.`, {
          description: name,
        });
        for (const warning of result.warnings) {
          toast.warning("Parte da alteração não foi salva.", {
            description: warning,
          });
        }
        router.push(kind.path);
        return;
      }

      if (result.field) {
        const field = result.field;
        setErrors({ [field]: result.message });
        document.getElementById(field)?.focus();
      }
      toast.error(`Não foi possível atualizar o ${kind.singular}.`, {
        description: result.message,
      });
    });
  }

  // Envia o formulário inteiro (inclusive as listas e a foto) ao servidor.
  function confirmCreate() {
    const form = formRef.current;
    if (!form) return;
    const data = new FormData(form);

    startTransition(async () => {
      const result = await createPersonAction(kind.type, data);

      if (result.ok) {
        toast.success(`${kind.singularTitle} cadastrado.`, {
          description: personName,
        });
        if (result.photoFailed) {
          toast.warning("A foto não foi enviada.", {
            description: "Você poderá adicioná-la depois, na alteração.",
          });
        }
        router.push(kind.path);
        return;
      }

      setConfirmOpen(false);
      if (result.field) {
        const field = result.field;
        setErrors({ [field]: result.message });
        document.getElementById(field)?.focus();
      }
      toast.error(`Não foi possível cadastrar o ${kind.singular}.`, {
        description: result.message,
      });
    });
  }

  // Corrigir um campo limpa o erro dele.
  function handleChange(event: React.FormEvent<HTMLFormElement>) {
    const field = (event.target as HTMLElement).id as keyof PersonFormErrors;
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  return (
    <>
      <form
        ref={formRef}
        noValidate
        onSubmit={handleSubmit}
        onChange={handleChange}
        // Padrão de página: o card ocupa a largura toda e a altura que sobra.
        className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card"
      >
        {editing?.mainContact && (
          <input
            type="hidden"
            name="mainContactId"
            value={editing.mainContact.id}
          />
        )}
        <div className="min-h-0 flex-1 overflow-auto p-4 md:p-6">
          {/* Foto centralizada, acima das colunas (screens/pessoas.md). */}
          <div className="mb-6 flex justify-center">
            <PhotoUpload currentUrl={editing?.person.photoUrl} />
          </div>

          <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
            <section aria-labelledby="person-main" className="space-y-4">
              <h2 id="person-main" className="font-semibold">
                Dados principais
              </h2>

              <FormField id="name" label="Nome" required error={errors.name}>
                <Input
                  id="name"
                  aria-invalid={errors.name ? true : undefined}
                  aria-describedby={errors.name ? "name-error" : undefined}
                  name="name"
                  defaultValue={editing?.person.name}
                  autoComplete="name"
                  placeholder="Nome completo"
                />
              </FormField>

              <div className="grid grid-cols-[3fr_2fr] gap-3">
                <FormField
                  id="phone"
                  label="Contato"
                  required
                  error={errors.phone}
                >
                  <MaskedInput
                    id="phone"
                    aria-invalid={errors.phone ? true : undefined}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    name="phone"
                    initialValue={editing?.mainContact?.phone ?? ""}
                    mask={maskPhone}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(11) 91234-5678"
                  />
                </FormField>

                <FormField id="contactType" label="Tipo do contato">
                  <Select
                    name="contactType"
                    defaultValue={editing?.mainContact?.type ?? "MAIN"}
                  >
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
                </FormField>
              </div>

              <FormField id="email" label="E-mail" error={errors.email}>
                <Input
                  id="email"
                  aria-invalid={errors.email ? true : undefined}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  name="email"
                  defaultValue={editing?.mainContact?.email ?? ""}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="nome@exemplo.com"
                />
              </FormField>

              <FormField id="note" label="Observações">
                <Textarea
                  id="note"
                  name="note"
                  defaultValue={editing?.person.note ?? ""}
                  rows={4}
                  maxLength={1000}
                  // Pelo menos 4 linhas (screens/pessoas.md); cresce com o conteúdo.
                  className="min-h-28"
                  placeholder="Preferências, cuidados, informações úteis para o atendimento"
                />
              </FormField>
            </section>

            <section aria-labelledby="person-optional" className="space-y-4">
              <h2 id="person-optional" className="font-semibold">
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
                      <FormField
                        id="document"
                        label="CPF"
                        error={errors.document}
                      >
                        <MaskedInput
                          id="document"
                          aria-invalid={errors.document ? true : undefined}
                          aria-describedby={
                            errors.document ? "document-error" : undefined
                          }
                          name="document"
                          initialValue={editing?.person.document ?? ""}
                          mask={maskCpf}
                          inputMode="numeric"
                          placeholder="000.000.000-00"
                        />
                      </FormField>

                      <FormField id="birthDate" label="Data de nascimento">
                        <DatePicker
                          id="birthDate"
                          name="birthDate"
                          initialValue={editing?.person.birthDate}
                          maxDate={new Date()}
                        />
                      </FormField>
                    </div>

                    <FormField id="profession" label="Profissão">
                      <Input
                        id="profession"
                        name="profession"
                        defaultValue={editing?.person.profession ?? ""}
                      />
                    </FormField>
                  </div>
                </FormSection>

                <FormSection
                  title="Outros contatos"
                  description="Telefones adicionais"
                >
                  <ContactsField
                    persisted={
                      editing && {
                        kind,
                        personId: editing.person.id,
                        contacts: editing.extraContacts,
                      }
                    }
                  />
                </FormSection>

                <FormSection
                  title="Endereços"
                  description={`Onde o ${kind.singular} pode ser encontrado`}
                >
                  <AddressesField
                    states={states}
                    persisted={
                      editing && {
                        kind,
                        personId: editing.person.id,
                        addresses: editing.addresses,
                      }
                    }
                  />
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
            <Link href={kind.path}>
              <X aria-hidden="true" />
              Cancelar
            </Link>
          </Button>
          <Button type="submit" disabled={pending}>
            <Save aria-hidden="true" />
            {editing ? (pending ? "Salvando…" : "Salvar alterações") : "Salvar"}
          </Button>
        </FormFooter>
      </form>

      {!editing && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={`Cadastrar ${kind.singular}?`}
          description={`O cadastro de ${personName} será criado com os dados informados.`}
          confirmLabel="Cadastrar"
          icon={Plus}
          pendingLabel="Cadastrando…"
          pending={pending}
          onConfirm={confirmCreate}
        />
      )}
    </>
  );
}

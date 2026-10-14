"use client";

import { Hint } from "@/components/shared/Hint";
import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addContactAction,
  deleteContactAction,
} from "@/app/(admin)/people-actions";
import type { PeopleKind } from "@/components/people/people-kinds";
import { MaskedInput } from "@/components/shared/MaskedInput";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ContactRecord, ContactType } from "@/types/people";
import { contactTypeLabels } from "@/utils/format";
import { maskPhone } from "@/utils/masks";

// Contato como a lista o exibe: o já cadastrado (com id da API) ou o local, ainda não enviado.
type ExtraContact = {
  id: string;
  phone: string;
  email: string | null;
  type: ContactType;
};

type ContactsFieldProps = {
  /**
   * Alteração: contatos já cadastrados da pessoa. Adicionar e excluir valem na
   * hora (a API mantém contatos por rotas próprias). Sem isso, é o cadastro:
   * a lista fica no formulário e vai junto com a pessoa.
   */
  persisted?: {
    kind: PeopleKind;
    personId: string;
    contacts: ContactRecord[];
  };
};

// Tipos de contato em ordem de exibição.
const contactTypes = Object.keys(contactTypeLabels) as ContactType[];

// A API aceita até 10 contatos por cadastro; um deles é o contato principal.
const MAX_EXTRA_CONTACTS = 9;

// "Outros contatos" (screens.md): o formulário aparece ao clicar em adicionar;
// os contatos adicionados aparecem numa tabela com a opção de excluir.
export function ContactsField({ persisted }: ContactsFieldProps) {
  const [localContacts, setLocalContacts] = useState<ExtraContact[]>([]);
  const [deleting, setDeleting] = useState<ExtraContact | null>(null);
  const [pending, startTransition] = useTransition();

  const contacts: ExtraContact[] = persisted
    ? persisted.contacts.map((contact) => ({
        id: contact.id,
        phone: contact.phone ?? "",
        email: contact.email,
        type: contact.type,
      }))
    : localContacts;
  const [adding, setAdding] = useState(false);
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<ContactType>("MAIN");
  const [error, setError] = useState<string>();

  function closeForm() {
    setAdding(false);
    setPhone("");
    setType("MAIN");
    setError(undefined);
  }

  function addContact() {
    // O backend aceita DDD + número: 10 ou 11 dígitos.
    if (phone.length < 10) {
      setError("Informe um telefone válido, com DDD.");
      return;
    }

    if (!persisted) {
      setLocalContacts((current) => [
        ...current,
        { id: crypto.randomUUID(), phone, email: null, type },
      ]);
      closeForm();
      return;
    }

    startTransition(async () => {
      const result = await addContactAction(
        persisted.kind.type,
        persisted.personId,
        { phone, type },
      );
      if (result.ok) {
        toast.success("Contato adicionado.");
        closeForm();
      } else {
        setError(result.message);
        toast.error("Não foi possível adicionar o contato.", {
          description: result.message,
        });
      }
    });
  }

  function removeContact(contact: ExtraContact) {
    if (!persisted) {
      setLocalContacts((current) =>
        current.filter((item) => item.id !== contact.id),
      );
      return;
    }
    // Já cadastrado: pede confirmação (padrão de exclusão).
    setDeleting(contact);
  }

  function confirmRemove() {
    if (!persisted || !deleting) return;
    const target = deleting;

    startTransition(async () => {
      const result = await deleteContactAction(
        persisted.kind.type,
        persisted.personId,
        target.id,
      );
      if (result.ok) {
        toast.success("Contato excluído.");
        setDeleting(null);
      } else {
        toast.error("Não foi possível excluir o contato.", {
          description: result.message,
        });
      }
    });
  }

  const limitReached = contacts.length >= MAX_EXTRA_CONTACTS;

  return (
    <div className="space-y-4">
      {/* Cadastro: vai no envio do formulário, junto com os demais campos. */}
      {!persisted && (
        <input
          type="hidden"
          name="extraContacts"
          value={JSON.stringify(
            contacts.map(({ phone, type }) => ({ phone, type })),
          )}
        />
      )}
      {adding ? (
        // Dentro do formulário principal: o Enter adiciona o contato em vez de
        // enviar o cadastro inteiro.
        <div
          className="space-y-4 rounded-control border border-border p-4"
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              event.target instanceof HTMLInputElement &&
              event.currentTarget.contains(event.target)
            ) {
              event.preventDefault();
              addContact();
            }
          }}
        >
          <div className="grid grid-cols-[3fr_2fr] gap-3">
            <div className="space-y-2">
              <Label htmlFor="extra-contact-phone">Contato</Label>
              <MaskedInput
                id="extra-contact-phone"
                mask={maskPhone}
                value={phone}
                onValueChange={setPhone}
                type="tel"
                inputMode="tel"
                placeholder="(11) 91234-5678"
                aria-invalid={error ? true : undefined}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extra-contact-type">Tipo</Label>
              <Select
                value={type}
                onValueChange={(next) => setType(next as ContactType)}
              >
                <SelectTrigger id="extra-contact-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contactTypes.map((option) => (
                    <SelectItem key={option} value={option}>
                      {contactTypeLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeForm}>
              Cancelar
            </Button>
            <Button type="button" disabled={pending} onClick={addContact}>
              {pending ? "Adicionando…" : "Adicionar"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {contacts.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum outro contato.
            </p>
          )}
          {limitReached && (
            <p className="text-sm text-muted-foreground">
              Limite de contatos atingido.
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={limitReached}
            onClick={() => setAdding(true)}
          >
            <Plus aria-hidden="true" />
            Adicionar contato
          </Button>
        </div>
      )}

      {contacts.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contato</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-16 text-right">Excluir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="tabular-nums">
                  {contact.phone ? maskPhone(contact.phone) : contact.email}
                </TableCell>
                <TableCell>{contactTypeLabels[contact.type]}</TableCell>
                <TableCell className="text-right">
                  <Hint
                    label={`Excluir contato ${contact.phone ? maskPhone(contact.phone) : contact.email}`}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Excluir contato ${contact.phone ? maskPhone(contact.phone) : contact.email}`}
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => removeContact(contact)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </Hint>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir contato?"
        description={`O contato ${deleting?.phone ? maskPhone(deleting.phone) : (deleting?.email ?? "")} será excluído.`}
        confirmLabel="Excluir"
        pendingLabel="Excluindo…"
        pending={pending}
        destructive
        onConfirm={confirmRemove}
      />
    </div>
  );
}

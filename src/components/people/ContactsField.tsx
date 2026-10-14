"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { MaskedInput } from "@/components/shared/MaskedInput";
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
import type { ContactType } from "@/types/people";
import { contactTypeLabels } from "@/utils/format";
import { maskPhone } from "@/utils/masks";

type ExtraContact = {
  id: string;
  phone: string;
  type: ContactType;
};

const contactTypes = Object.keys(contactTypeLabels) as ContactType[];

// "Outros contatos" (screens.md): o formulário aparece ao clicar em adicionar;
// os contatos adicionados aparecem numa tabela com a opção de excluir.
export function ContactsField() {
  const [contacts, setContacts] = useState<ExtraContact[]>([]);
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
    setContacts((current) => [
      ...current,
      { id: crypto.randomUUID(), phone, type },
    ]);
    closeForm();
  }

  return (
    <div className="space-y-4">
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
            <Button type="button" onClick={addContact}>
              Adicionar
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
          <Button
            type="button"
            variant="outline"
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
                  {maskPhone(contact.phone)}
                </TableCell>
                <TableCell>{contactTypeLabels[contact.type]}</TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir contato ${maskPhone(contact.phone)}`}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() =>
                      setContacts((current) =>
                        current.filter((item) => item.id !== contact.id),
                      )
                    }
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

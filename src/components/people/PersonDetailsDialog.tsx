"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";
import { getPersonContactsAction } from "@/app/(admin)/people-actions";
import type { PersistedAddress } from "@/components/people/AddressesField";
import { PersonDetails } from "@/components/people/PersonDetails";
import type { PeopleKind } from "@/components/people/people-kinds";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ContactRecord, PersonListItem } from "@/types/people";

type Extra = { contacts: ContactRecord[]; addresses: PersistedAddress[] };

/**
 * Botão "Visualizar" do cabeçalho do histórico do cliente (screens/pessoas.md):
 * o dialog de dados cadastrais da listagem, com todos os contatos e
 * endereços. Eles só são buscados ao abrir: o histórico abre sem esperar por
 * eles.
 */
export function PersonDetailsDialog({
  person,
  kind,
}: {
  person: PersonListItem;
  kind: PeopleKind;
}) {
  const [open, setOpen] = useState(false);
  const [extra, setExtra] = useState<Extra | null>(null);
  const [error, setError] = useState<string>();

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) return;
    setExtra(null);
    setError(undefined);
    void getPersonContactsAction(person.id).then((result) => {
      if (result.ok) {
        setExtra({ contacts: result.contacts, addresses: result.addresses });
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Eye aria-hidden="true" />
          Visualizar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <PersonDetails
          person={person}
          kind={kind}
          extra={error ? undefined : extra}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            <X aria-hidden="true" />
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

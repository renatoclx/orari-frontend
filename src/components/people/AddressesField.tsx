"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  addAddressAction,
  deleteAddressAction,
} from "@/app/(admin)/people-actions";
import {
  AddressDraftForm,
  type NewAddressFields,
} from "@/components/people/AddressDraftForm";
import type { PeopleKind } from "@/components/people/people-kinds";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { State } from "@/types/location";
import type { AddressRecord, AddressType } from "@/types/people";
import { addressTypeLabels } from "@/utils/format";

// Endereço como a lista o exibe: o já cadastrado (com id da API) ou o local, ainda não enviado.
type ExtraAddress = {
  id: string;
  type: AddressType;
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  cityId: string;
  cityName: string;
  stateAcronym: string;
};

// A API aceita até 10 endereços por cadastro.
const MAX_ADDRESSES = 10;

/** Endereço já cadastrado, com a cidade resolvida para exibição. */
export type PersistedAddress = AddressRecord & {
  cityName: string;
  stateAcronym: string;
};

type AddressesFieldProps = {
  states: State[];
  /**
   * Alteração: endereços já cadastrados da pessoa. Adicionar e excluir valem na
   * hora (a API mantém endereços por rotas próprias). Sem isso, é o cadastro:
   * a lista fica no formulário e vai junto com a pessoa.
   */
  persisted?: {
    kind: PeopleKind;
    personId: string;
    addresses: PersistedAddress[];
  };
};

// "Endereços" (screens.md): o formulário aparece ao clicar em adicionar e os
// endereços adicionados vão para uma tabela com a opção de excluir.
export function AddressesField({ states, persisted }: AddressesFieldProps) {
  const [localAddresses, setLocalAddresses] = useState<ExtraAddress[]>([]);
  const [deleting, setDeleting] = useState<ExtraAddress | null>(null);
  const [adding, setAdding] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const addresses: ExtraAddress[] = persisted
    ? persisted.addresses.map((address) => ({
        ...address,
        neighborhood: address.neighborhood ?? "",
        complement: address.complement ?? "",
      }))
    : localAddresses;

  function closeForm() {
    setAdding(false);
    setSubmitError(undefined);
  }

  function addAddress(fields: NewAddressFields) {
    if (!persisted) {
      setLocalAddresses((current) => [
        ...current,
        { id: crypto.randomUUID(), ...fields },
      ]);
      closeForm();
      return;
    }

    startTransition(async () => {
      // A action usa só os campos que a API aceita (o nome da cidade e a UF
      // servem à exibição).
      const result = await addAddressAction(
        persisted.kind.type,
        persisted.personId,
        {
          ...fields,
          // O primeiro endereço da pessoa é o principal.
          isPrincipal: addresses.length === 0,
        },
      );
      if (result.ok) {
        toast.success("Endereço adicionado.");
        closeForm();
      } else {
        setSubmitError(result.message);
        toast.error("Não foi possível adicionar o endereço.", {
          description: result.message,
        });
      }
    });
  }

  function removeAddress(address: ExtraAddress) {
    if (!persisted) {
      setLocalAddresses((current) =>
        current.filter((item) => item.id !== address.id),
      );
      return;
    }
    // Já cadastrado: pede confirmação (padrão de exclusão).
    setDeleting(address);
  }

  function confirmRemove() {
    if (!persisted || !deleting) return;
    const target = deleting;

    startTransition(async () => {
      const result = await deleteAddressAction(
        persisted.kind.type,
        persisted.personId,
        target.id,
      );
      if (result.ok) {
        toast.success("Endereço excluído.");
        setDeleting(null);
      } else {
        toast.error("Não foi possível excluir o endereço.", {
          description: result.message,
        });
      }
    });
  }

  const limitReached = addresses.length >= MAX_ADDRESSES;

  return (
    <div className="space-y-4">
      {/* Cadastro: vai no envio do formulário, junto com os demais campos. */}
      {!persisted && (
        <input
          type="hidden"
          name="addresses"
          value={JSON.stringify(
            addresses.map(
              ({
                type,
                cep,
                street,
                number,
                neighborhood,
                complement,
                cityId,
              }) => ({
                type,
                cep,
                street,
                number,
                neighborhood,
                complement,
                cityId,
              }),
            ),
          )}
        />
      )}
      {adding ? (
        <AddressDraftForm
          states={states}
          pending={pending}
          submitError={submitError}
          onSubmit={addAddress}
          onCancel={closeForm}
        />
      ) : (
        <div className="space-y-2">
          {addresses.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum endereço cadastrado.
            </p>
          )}
          {limitReached && (
            <p className="text-sm text-muted-foreground">
              Limite de endereços atingido.
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={limitReached}
            onClick={() => setAdding(true)}
          >
            <Plus aria-hidden="true" />
            Adicionar endereço
          </Button>
        </div>
      )}

      {addresses.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Logradouro</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-16 text-right">Excluir</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {addresses.map((address) => (
              <TableRow key={address.id}>
                <TableCell className="whitespace-normal">
                  <span className="block font-medium">
                    {address.street}, {address.number}
                  </span>
                  <span className="block text-sm text-muted-foreground">
                    {address.neighborhood && `${address.neighborhood}, `}
                    {address.cityName}/{address.stateAcronym}
                  </span>
                </TableCell>
                <TableCell>{addressTypeLabels[address.type]}</TableCell>
                <TableCell className="text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Excluir endereço ${address.street}, ${address.number}`}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeAddress(address)}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir endereço?"
        description={`O endereço ${deleting?.street ?? ""}, ${deleting?.number ?? ""} será excluído.`}
        confirmLabel="Excluir"
        pendingLabel="Excluindo…"
        pending={pending}
        destructive
        onConfirm={confirmRemove}
      />
    </div>
  );
}

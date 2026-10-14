"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  lookupCepAction,
  searchCitiesAction,
} from "@/app/(admin)/location-actions";
import {
  addAddressAction,
  deleteAddressAction,
} from "@/app/(admin)/people-actions";
import type { PeopleKind } from "@/components/people/people-kinds";
import { Combobox } from "@/components/shared/Combobox";
import { MaskedInput } from "@/components/shared/MaskedInput";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { City, State } from "@/types/location";
import type { AddressRecord, AddressType } from "@/types/people";
import { addressTypeLabels } from "@/utils/format";
import { maskCep } from "@/utils/masks";
import { normalizeText } from "@/utils/text";

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

type Draft = Omit<ExtraAddress, "id" | "stateAcronym"> & {
  stateId: string;
};

const emptyDraft: Draft = {
  type: "MAIN",
  cep: "",
  street: "",
  number: "",
  neighborhood: "",
  complement: "",
  stateId: "",
  cityId: "",
  cityName: "",
};

const addressTypes = Object.keys(addressTypeLabels) as AddressType[];

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

function FieldBox({
  id,
  label,
  className,
  children,
}: {
  id: string;
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

// "Endereços" (screens.md): o formulário aparece ao clicar em adicionar; o CEP
// busca o logradouro; Estado habilita Cidade; os endereços adicionados vão
// para uma tabela com a opção de excluir.
export function AddressesField({ states, persisted }: AddressesFieldProps) {
  const [localAddresses, setLocalAddresses] = useState<ExtraAddress[]>([]);
  const [deleting, setDeleting] = useState<ExtraAddress | null>(null);
  const [pending, startTransition] = useTransition();

  const addresses: ExtraAddress[] = persisted
    ? persisted.addresses.map((address) => ({
        ...address,
        neighborhood: address.neighborhood ?? "",
        complement: address.complement ?? "",
      }))
    : localAddresses;
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string>();

  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  // Só a resposta da última busca vale (respostas podem chegar fora de ordem).
  const cityRequest = useRef(0);
  const cityDebounce = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => () => clearTimeout(cityDebounce.current), []);

  function update(changes: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...changes }));
  }

  function closeForm() {
    setAdding(false);
    setDraft(emptyDraft);
    setCities([]);
    setError(undefined);
  }

  async function loadCities(stateId: string, term: string) {
    const request = ++cityRequest.current;
    setCitiesLoading(true);
    const result = await searchCitiesAction(stateId, term);
    if (request !== cityRequest.current) return;

    setCitiesLoading(false);
    if (result.ok) {
      setCities(result.cities);
    } else {
      setCities([]);
      toast.error("Não foi possível carregar as cidades.", {
        description: result.message,
      });
    }
  }

  function handleStateChange(stateId: string) {
    // Trocar o estado invalida a cidade escolhida.
    update({ stateId, cityId: "", cityName: "" });
    setCities([]);
    void loadCities(stateId, "");
  }

  function handleCitySearch(term: string) {
    if (!draft.stateId) return;
    clearTimeout(cityDebounce.current);
    cityDebounce.current = setTimeout(
      () => void loadCities(draft.stateId, term),
      300,
    );
  }

  async function handleCepChange(cep: string) {
    update({ cep });
    if (cep.length !== 8) return;

    setCepLoading(true);
    const result = await lookupCepAction(cep);
    setCepLoading(false);

    if (result.status === "not-found") {
      toast.error("CEP não encontrado.", {
        description: "Confira o número ou preencha o endereço manualmente.",
      });
      return;
    }
    if (result.status === "unavailable") {
      toast.error("Não foi possível consultar o CEP.", {
        description: "Preencha o endereço manualmente.",
      });
      return;
    }

    const { address } = result;
    // Só preenche o que a consulta trouxe; o resto fica para a pessoa.
    update({
      ...(address.street && { street: address.street }),
      ...(address.complement && { complement: address.complement }),
      ...(address.neighborhood && { neighborhood: address.neighborhood }),
    });

    const state = states.find((item) => item.acronym === address.stateAcronym);
    if (!state) return;

    update({ stateId: state.id, cityId: "", cityName: "" });
    await selectCityByName(state.id, address.city);
  }

  // Escolhe a cidade devolvida pela consulta de CEP. A API de CEP traz o nome,
  // e o cadastro guarda o código: a cidade é localizada pelo nome no estado.
  async function selectCityByName(stateId: string, cityName: string) {
    const request = ++cityRequest.current;
    setCitiesLoading(true);
    const result = await searchCitiesAction(stateId, cityName);
    if (request !== cityRequest.current) return;

    if (!result.ok) {
      setCitiesLoading(false);
      toast.error("Não foi possível carregar as cidades.", {
        description: result.message,
      });
      return;
    }

    const wanted = normalizeText(cityName);
    const match = result.cities.find(
      (city) => normalizeText(city.name) === wanted,
    );

    if (match) {
      setCities(result.cities);
      setCitiesLoading(false);
      update({ cityId: match.id, cityName: match.name });
    } else {
      // Grafia diferente: a pessoa escolhe a cidade na lista do estado.
      void loadCities(stateId, "");
    }
  }

  function addAddress() {
    const state = states.find((item) => item.id === draft.stateId);

    if (
      draft.cep.length !== 8 ||
      !draft.street.trim() ||
      !draft.number.trim() ||
      !draft.cityId ||
      !state
    ) {
      setError("Informe CEP, rua, número, estado e cidade.");
      return;
    }

    const fields = {
      type: draft.type,
      cep: draft.cep,
      street: draft.street.trim(),
      number: draft.number.trim(),
      neighborhood: draft.neighborhood.trim(),
      complement: draft.complement.trim(),
      cityId: draft.cityId,
    };

    if (!persisted) {
      setLocalAddresses((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          ...fields,
          cityName: draft.cityName,
          stateAcronym: state.acronym,
        },
      ]);
      closeForm();
      return;
    }

    startTransition(async () => {
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
        setError(result.message);
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

  const stateOptions = states.map((state) => ({
    value: state.id,
    label: `${state.name} (${state.acronym})`,
  }));
  const cityOptions = cities.map((city) => ({
    value: city.id,
    label: city.name,
  }));
  // A busca recarrega a lista (100 por vez): a cidade já escolhida continua
  // aparecendo mesmo que não esteja na página atual.
  if (draft.cityId && !cityOptions.some((o) => o.value === draft.cityId)) {
    cityOptions.unshift({ value: draft.cityId, label: draft.cityName });
  }

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
        // Dentro do formulário principal: o Enter adiciona o endereço em vez
        // de enviar o cadastro inteiro.
        <div
          className="space-y-4 rounded-control border border-border p-4"
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              event.target instanceof HTMLInputElement &&
              event.currentTarget.contains(event.target)
            ) {
              event.preventDefault();
              addAddress();
            }
          }}
        >
          <div className="grid gap-x-3 gap-y-4 sm:grid-cols-6">
            <FieldBox id="address-cep" label="CEP" className="sm:col-span-2">
              <div className="relative">
                <MaskedInput
                  id="address-cep"
                  mask={maskCep}
                  value={draft.cep}
                  onValueChange={(cep) => void handleCepChange(cep)}
                  inputMode="numeric"
                  placeholder="00000-000"
                  autoFocus
                />
                {cepLoading && (
                  <LoaderCircle
                    className="absolute top-1/2 right-2.5 size-4 -translate-y-1/2 animate-spin text-muted-foreground"
                    aria-label="Buscando CEP"
                  />
                )}
              </div>
            </FieldBox>

            <FieldBox id="address-street" label="Rua" className="sm:col-span-4">
              <Input
                id="address-street"
                value={draft.street}
                onChange={(event) => update({ street: event.target.value })}
                autoComplete="off"
              />
            </FieldBox>

            <FieldBox
              id="address-number"
              label="Número"
              className="sm:col-span-2"
            >
              <Input
                id="address-number"
                value={draft.number}
                onChange={(event) => update({ number: event.target.value })}
                autoComplete="off"
              />
            </FieldBox>

            <FieldBox
              id="address-complement"
              label="Complemento"
              className="sm:col-span-2"
            >
              <Input
                id="address-complement"
                value={draft.complement}
                onChange={(event) => update({ complement: event.target.value })}
                autoComplete="off"
              />
            </FieldBox>

            <FieldBox
              id="address-neighborhood"
              label="Bairro"
              className="sm:col-span-2"
            >
              <Input
                id="address-neighborhood"
                value={draft.neighborhood}
                onChange={(event) =>
                  update({ neighborhood: event.target.value })
                }
                autoComplete="off"
              />
            </FieldBox>

            <FieldBox id="address-type" label="Tipo" className="sm:col-span-2">
              <Select
                value={draft.type}
                onValueChange={(next) => update({ type: next as AddressType })}
              >
                <SelectTrigger id="address-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {addressTypes.map((option) => (
                    <SelectItem key={option} value={option}>
                      {addressTypeLabels[option]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldBox>

            <FieldBox
              id="address-state"
              label="Estado"
              className="sm:col-span-2"
            >
              <Combobox
                id="address-state"
                options={stateOptions}
                value={draft.stateId}
                onValueChange={handleStateChange}
                placeholder="Selecione"
                searchPlaceholder="Buscar estado…"
                emptyMessage="Nenhum estado encontrado."
              />
            </FieldBox>

            <FieldBox
              id="address-city"
              label="Cidade"
              className="sm:col-span-2"
            >
              <Combobox
                id="address-city"
                options={cityOptions}
                value={draft.cityId}
                onValueChange={(cityId) =>
                  update({
                    cityId,
                    cityName:
                      cities.find((city) => city.id === cityId)?.name ?? "",
                  })
                }
                placeholder="Selecione"
                searchPlaceholder="Buscar cidade…"
                emptyMessage="Nenhuma cidade encontrada."
                disabled={!draft.stateId}
                loading={citiesLoading}
                onSearchChange={handleCitySearch}
              />
            </FieldBox>
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
            <Button type="button" disabled={pending} onClick={addAddress}>
              {pending ? "Adicionando…" : "Adicionar"}
            </Button>
          </div>
        </div>
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

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && !pending && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir endereço?</AlertDialogTitle>
            <AlertDialogDescription>
              O endereço {deleting?.street}, {deleting?.number} será excluído.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={(event) => {
                event.preventDefault();
                confirmRemove();
              }}
            >
              {pending ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

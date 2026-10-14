"use server";

import { revalidatePath } from "next/cache";
import {
  validateClientForm,
  type ClientFormValues,
} from "@/components/clients/client-validation";
import { ApiError } from "@/services/api";
import {
  createPerson,
  deletePerson,
  restorePerson,
  uploadPersonPhoto,
} from "@/services/people.service";
import type {
  AddressType,
  ContactType,
  NewAddressInput,
  NewContactInput,
} from "@/types/people";
import { onlyDigits } from "@/utils/masks";

export type ClientField = keyof ClientFormValues;

export type ActionFailure = {
  ok: false;
  message: string;
  /** Campo do formulário a que o erro se refere, quando houver. */
  field?: ClientField;
};

export type DeleteClientResult = { ok: true } | ActionFailure;
export type ReactivateClientResult = { ok: true } | ActionFailure;
export type CreateClientResult =
  { ok: true; photoFailed: boolean } | ActionFailure;

const CONTACT_TYPES: ContactType[] = ["MAIN", "MESSAGE", "BRANCH"];
const ADDRESS_TYPES: AddressType[] = ["MAIN", "MESSAGE", "BRANCH"];

function failure(error: ApiError): ActionFailure {
  // Na criação, o 409 é CPF duplicado.
  return { ok: false, message: error.message };
}

function text(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function parseList(raw: string): Record<string, unknown>[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? value.filter(
          (item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null,
        )
      : [];
  } catch {
    return [];
  }
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Cadastro completo do cliente. O formulário entra como FormData (os campos,
 * mais as listas de contatos e endereços em JSON e a foto, se houver). Valida
 * de novo no servidor, cria pessoa + contatos + endereços numa chamada e, só
 * depois, envia a foto: a API recebe a foto numa rota própria.
 */
export async function createClientAction(
  data: FormData,
): Promise<CreateClientResult> {
  const values: ClientFormValues = {
    name: text(data, "name"),
    phone: text(data, "phone"),
    email: text(data, "email"),
    document: text(data, "document"),
  };

  const errors = validateClientForm(values);
  const invalid = (Object.keys(errors) as ClientField[]).find(
    (field) => errors[field],
  );
  if (invalid) {
    return { ok: false, field: invalid, message: errors[invalid] ?? "" };
  }

  const contactType = text(data, "contactType") as ContactType;
  const mainContact: NewContactInput = {
    type: CONTACT_TYPES.includes(contactType) ? contactType : "MAIN",
    phone: onlyDigits(values.phone),
    ...(values.email && { email: values.email }),
    isPrincipal: true,
  };

  const extraContacts: NewContactInput[] = parseList(
    text(data, "extraContacts"),
  ).map((item) => ({
    type: CONTACT_TYPES.includes(item.type as ContactType)
      ? (item.type as ContactType)
      : "MAIN",
    phone: onlyDigits(asString(item.phone)),
    isPrincipal: false,
  }));

  const addresses: NewAddressInput[] = parseList(text(data, "addresses")).map(
    (item, index) => ({
      type: ADDRESS_TYPES.includes(item.type as AddressType)
        ? (item.type as AddressType)
        : "MAIN",
      cep: onlyDigits(asString(item.cep)),
      street: asString(item.street),
      number: asString(item.number),
      ...(asString(item.neighborhood) && {
        neighborhood: asString(item.neighborhood),
      }),
      ...(asString(item.complement) && {
        complement: asString(item.complement),
      }),
      cityId: asString(item.cityId),
      // O primeiro endereço é o principal (o exibido para o cliente).
      isPrincipal: index === 0,
    }),
  );

  const birthDate = text(data, "birthDate");
  const profession = text(data, "profession");
  const note = text(data, "note");

  let personId: string;
  try {
    const person = await createPerson({
      name: values.name,
      type: "CLIENT",
      ...(values.document && { document: onlyDigits(values.document) }),
      ...(birthDate && { birthDate }),
      ...(profession && { profession }),
      ...(note && { note }),
      contacts: [mainContact, ...extraContacts],
      ...(addresses.length > 0 && { addresses }),
    });
    personId = person.id;
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return {
      ...failure(error),
      ...(error.status === 409 && { field: "document" as const }),
    };
  }

  // A pessoa já existe: uma falha na foto não desfaz o cadastro.
  let photoFailed = false;
  const photo = data.get("photo");
  if (photo instanceof File && photo.size > 0) {
    try {
      await uploadPersonPhoto(personId, photo);
    } catch (error) {
      if (!(error instanceof ApiError)) throw error;
      photoFailed = true;
    }
  }

  revalidatePath("/clientes");
  return { ok: true, photoFailed };
}

/** Cadastro rápido: só nome e telefone (o telefone vira o contato principal). */
export async function quickCreateClientAction(
  name: string,
  phone: string,
): Promise<{ ok: true } | ActionFailure> {
  const errors = validateClientForm({
    name,
    phone,
    email: "",
    document: "",
  });
  if (errors.name) return { ok: false, field: "name", message: errors.name };
  if (errors.phone) return { ok: false, field: "phone", message: errors.phone };

  try {
    await createPerson({
      name: name.trim(),
      type: "CLIENT",
      phone: onlyDigits(phone),
    });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return failure(error);
  }

  revalidatePath("/clientes");
  return { ok: true };
}

export async function deleteClientAction(
  id: string,
): Promise<DeleteClientResult> {
  try {
    await deletePerson(id);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return failure(error);
  }

  // A listagem é renderizada no servidor: recarrega com o cliente inativo.
  revalidatePath("/clientes");
  return { ok: true };
}

export async function reactivateClientAction(
  id: string,
): Promise<ReactivateClientResult> {
  try {
    await restorePerson(id);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return failure(error);
  }

  revalidatePath("/clientes");
  return { ok: true };
}

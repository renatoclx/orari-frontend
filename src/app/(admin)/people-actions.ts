"use server";

import { revalidatePath } from "next/cache";
import { isPeopleType, PEOPLE_KINDS } from "@/components/people/people-kinds";
import {
  validatePersonForm,
  type PersonFormValues,
} from "@/components/people/person-validation";
import { ApiError } from "@/services/api";
import {
  failureFrom,
  type ActionFailure as BaseActionFailure,
} from "@/lib/action-result";
import { formText } from "@/lib/form-data";
import { createAddress, deleteAddress } from "@/services/address.service";
import {
  createContact,
  deleteContact,
  updateContact,
} from "@/services/contact.service";
import {
  createPerson,
  deletePerson,
  removePersonPhoto,
  restorePerson,
  updatePerson,
  uploadPersonPhoto,
} from "@/services/people.service";
import type {
  AddressType,
  ContactType,
  NewAddressInput,
  NewContactInput,
  PeopleType,
} from "@/types/people";
import { onlyDigits } from "@/utils/masks";

/** Campos do formulário de pessoa a que um erro pode se referir. */
export type PersonField = keyof PersonFormValues;

export type ActionFailure = BaseActionFailure<PersonField>;

export type DeletePersonResult = { ok: true } | ActionFailure;
export type ReactivatePersonResult = { ok: true } | ActionFailure;
export type CreatePersonResult =
  { ok: true; photoFailed: boolean } | ActionFailure;

// Valores aceitos pela API; o que vem do navegador é conferido contra eles.
const CONTACT_TYPES: ContactType[] = ["MAIN", "MESSAGE", "BRANCH"];
const ADDRESS_TYPES: AddressType[] = ["MAIN", "MESSAGE", "BRANCH"];

// As listas de contatos e endereços chegam como JSON em campos ocultos do formulário.
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

// Item de lista vindo do navegador: só aceita texto.
function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// O tipo da pessoa vem do navegador e pode ter sido adulterado.
const INVALID_TYPE: ActionFailure = {
  ok: false,
  message: "Tipo de cadastro inválido.",
};

/**
 * Cadastro completo da pessoa (cliente, funcionário ou profissional). O formulário entra como FormData (os campos,
 * mais as listas de contatos e endereços em JSON e a foto, se houver). Valida
 * de novo no servidor, cria pessoa + contatos + endereços numa chamada e, só
 * depois, envia a foto: a API recebe a foto numa rota própria.
 */
export async function createPersonAction(
  type: PeopleType,
  data: FormData,
): Promise<CreatePersonResult> {
  // O tipo vem do navegador: confere antes de usar.
  if (!isPeopleType(type)) return INVALID_TYPE;

  const values: PersonFormValues = {
    name: formText(data, "name"),
    phone: formText(data, "phone"),
    email: formText(data, "email"),
    document: formText(data, "document"),
  };

  const errors = validatePersonForm(values);
  const invalid = (Object.keys(errors) as PersonField[]).find(
    (field) => errors[field],
  );
  if (invalid) {
    return { ok: false, field: invalid, message: errors[invalid] ?? "" };
  }

  const contactType = formText(data, "contactType") as ContactType;
  const mainContact: NewContactInput = {
    type: CONTACT_TYPES.includes(contactType) ? contactType : "MAIN",
    phone: onlyDigits(values.phone),
    ...(values.email && { email: values.email }),
    isPrincipal: true,
  };

  const extraContacts: NewContactInput[] = parseList(
    formText(data, "extraContacts"),
  ).map((item) => ({
    type: CONTACT_TYPES.includes(item.type as ContactType)
      ? (item.type as ContactType)
      : "MAIN",
    phone: onlyDigits(asString(item.phone)),
    isPrincipal: false,
  }));

  const addresses: NewAddressInput[] = parseList(
    formText(data, "addresses"),
  ).map((item, index) => ({
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
    // O primeiro endereço é o principal (o exibido para a pessoa).
    isPrincipal: index === 0,
  }));

  const birthDate = formText(data, "birthDate");
  const profession = formText(data, "profession");
  const note = formText(data, "note");

  let personId: string;
  try {
    const person = await createPerson({
      name: values.name,
      type,
      ...(values.document && { document: onlyDigits(values.document) }),
      ...(birthDate && { birthDate }),
      ...(profession && { profession }),
      ...(note && { note }),
      contacts: [mainContact, ...extraContacts],
      ...(addresses.length > 0 && { addresses }),
    });
    personId = person.id;
  } catch (error) {
    return failureFrom(error, "document" as const);
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

  revalidatePath(PEOPLE_KINDS[type].path);
  return { ok: true, photoFailed };
}

/** Cadastro rápido: só nome e telefone (o telefone vira o contato principal). */
export async function quickCreateClientAction(
  name: string,
  phone: string,
): Promise<{ ok: true } | ActionFailure> {
  const errors = validatePersonForm({
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
    return failureFrom(error);
  }

  revalidatePath(PEOPLE_KINDS.CLIENT.path);
  return { ok: true };
}

/** Exclusão lógica: a pessoa fica inativa e continua na listagem. */
export async function deletePersonAction(
  id: string,
  type: PeopleType,
): Promise<DeletePersonResult> {
  if (!isPeopleType(type)) return INVALID_TYPE;

  try {
    await deletePerson(id);
  } catch (error) {
    return failureFrom(error);
  }

  // A listagem é renderizada no servidor: recarrega com a pessoa inativa.
  revalidatePath(PEOPLE_KINDS[type].path);
  return { ok: true };
}

/** Reativa uma pessoa inativa (a API recusa se o CPF já estiver em uso). */
export async function reactivatePersonAction(
  id: string,
  type: PeopleType,
): Promise<ReactivatePersonResult> {
  if (!isPeopleType(type)) return INVALID_TYPE;

  try {
    await restorePerson(id);
  } catch (error) {
    return failureFrom(error);
  }

  revalidatePath(PEOPLE_KINDS[type].path);
  return { ok: true };
}

/** `warnings`: partes da alteração (contato principal, foto) que falharam depois de a pessoa ser salva. */
export type UpdatePersonResult =
  { ok: true; warnings: string[] } | ActionFailure;

/** Atualiza a lista e a tela de alteração da pessoa. */
function revalidatePerson(type: PeopleType, id: string) {
  const { path } = PEOPLE_KINDS[type];
  revalidatePath(path);
  revalidatePath(`${path}/${id}/editar`);
}

/**
 * Alteração: salva os dados da pessoa, o contato principal e a foto. Contatos
 * e endereços adicionais têm ações próprias (aplicadas na hora), porque a API
 * os mantém por rotas separadas.
 */
export async function updatePersonAction(
  type: PeopleType,
  id: string,
  data: FormData,
): Promise<UpdatePersonResult> {
  if (!isPeopleType(type)) return INVALID_TYPE;

  const values: PersonFormValues = {
    name: formText(data, "name"),
    phone: formText(data, "phone"),
    email: formText(data, "email"),
    document: formText(data, "document"),
  };

  const errors = validatePersonForm(values);
  const invalid = (Object.keys(errors) as PersonField[]).find(
    (field) => errors[field],
  );
  if (invalid) {
    return { ok: false, field: invalid, message: errors[invalid] ?? "" };
  }

  // Campo vazio vira null: é assim que a API limpa um valor opcional.
  try {
    await updatePerson(id, {
      name: values.name,
      document: values.document ? onlyDigits(values.document) : null,
      birthDate: formText(data, "birthDate") || null,
      profession: formText(data, "profession") || null,
      note: formText(data, "note") || null,
    });
  } catch (error) {
    return failureFrom(error, "document" as const);
  }

  // A pessoa já foi salva: o que falhar daqui para a frente vira aviso, e
  // tentar de novo é seguro (as operações são repetíveis).
  const warnings: string[] = [];

  const contactType = formText(data, "contactType") as ContactType;
  const type_ = CONTACT_TYPES.includes(contactType) ? contactType : "MAIN";
  const mainContactId = formText(data, "mainContactId");
  try {
    if (mainContactId) {
      await updateContact(mainContactId, {
        type: type_,
        phone: onlyDigits(values.phone),
        email: values.email || null,
      });
    } else {
      await createContact(id, {
        type: type_,
        phone: onlyDigits(values.phone),
        ...(values.email && { email: values.email }),
        isPrincipal: true,
      });
    }
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    warnings.push(`Contato principal: ${error.message}`);
  }

  const photo = data.get("photo");
  try {
    if (photo instanceof File && photo.size > 0) {
      await uploadPersonPhoto(id, photo);
    } else if (formText(data, "removePhoto") === "1") {
      await removePersonPhoto(id);
    }
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    warnings.push(`Foto: ${error.message}`);
  }

  revalidatePerson(type, id);
  return { ok: true, warnings };
}

// Contatos e endereços adicionais: ações aplicadas na hora, na tela de alteração.
export type SimpleResult = { ok: true } | ActionFailure;

export async function addContactAction(
  type: PeopleType,
  personId: string,
  contact: { phone: string; type: ContactType },
): Promise<SimpleResult> {
  if (!isPeopleType(type)) return INVALID_TYPE;

  try {
    await createContact(personId, {
      type: CONTACT_TYPES.includes(contact.type) ? contact.type : "MAIN",
      phone: onlyDigits(contact.phone),
      isPrincipal: false,
    });
  } catch (error) {
    return failureFrom(error);
  }

  revalidatePerson(type, personId);
  return { ok: true };
}

export async function deleteContactAction(
  type: PeopleType,
  personId: string,
  contactId: string,
): Promise<SimpleResult> {
  if (!isPeopleType(type)) return INVALID_TYPE;

  try {
    await deleteContact(contactId);
  } catch (error) {
    return failureFrom(error);
  }

  revalidatePerson(type, personId);
  return { ok: true };
}

export async function addAddressAction(
  type: PeopleType,
  personId: string,
  address: NewAddressInput,
): Promise<SimpleResult> {
  if (!isPeopleType(type)) return INVALID_TYPE;

  try {
    await createAddress(personId, {
      type: ADDRESS_TYPES.includes(address.type) ? address.type : "MAIN",
      cep: onlyDigits(address.cep),
      street: address.street.trim(),
      number: address.number.trim(),
      ...(address.neighborhood?.trim() && {
        neighborhood: address.neighborhood.trim(),
      }),
      ...(address.complement?.trim() && {
        complement: address.complement.trim(),
      }),
      cityId: address.cityId,
      isPrincipal: address.isPrincipal ?? false,
    });
  } catch (error) {
    return failureFrom(error);
  }

  revalidatePerson(type, personId);
  return { ok: true };
}

export async function deleteAddressAction(
  type: PeopleType,
  personId: string,
  addressId: string,
): Promise<SimpleResult> {
  if (!isPeopleType(type)) return INVALID_TYPE;

  try {
    await deleteAddress(addressId);
  } catch (error) {
    return failureFrom(error);
  }

  revalidatePerson(type, personId);
  return { ok: true };
}

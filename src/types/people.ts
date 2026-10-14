// Espelham os enums de pessoas, contatos e endereços do backend (schema.prisma).

export type ContactType = "MAIN" | "MESSAGE" | "BRANCH";

export type AddressType = "MAIN" | "MESSAGE" | "BRANCH";

/** Espelha o enum PeopleType do backend. */
export type PeopleType = "CLIENT" | "EMPLOYEE" | "PROFESSIONAL";

/** Contato principal que a listagem de pessoas traz junto de cada item. */
export type PrincipalContact = {
  id: string;
  type: ContactType;
  phone: string | null;
  email: string | null;
};

/** Item de GET /people. Datas chegam como texto ISO. */
export type PersonListItem = {
  id: string;
  name: string;
  /** CPF sem máscara. */
  document: string | null;
  birthDate: string | null;
  profession: string | null;
  type: PeopleType;
  note: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt: string | null;
  /** Preenchido quando a pessoa foi excluída (o status é derivado disso). */
  deletedAt: string | null;
  principalContact: PrincipalContact | null;
};

/** Contato enviado junto com a pessoa (POST /people). */
export type NewContactInput = {
  type: ContactType;
  phone?: string;
  email?: string;
  isPrincipal?: boolean;
};

/** Endereço enviado junto com a pessoa (POST /people). */
export type NewAddressInput = {
  type: AddressType;
  cep: string;
  street: string;
  number: string;
  neighborhood?: string;
  complement?: string;
  cityId: string;
  isPrincipal?: boolean;
};

/**
 * Corpo de POST /people. `phone` cria só o contato principal (tipo fixo MAIN,
 * sem e-mail); para escolher tipo e e-mail, o principal vai em `contacts`.
 */
export type CreatePersonInput = {
  name: string;
  type: PeopleType;
  /** CPF sem máscara. */
  document?: string;
  /** "aaaa-mm-dd". */
  birthDate?: string;
  profession?: string;
  note?: string;
  phone?: string;
  contacts?: NewContactInput[];
  addresses?: NewAddressInput[];
};

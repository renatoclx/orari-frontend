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

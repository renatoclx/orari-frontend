// Perfil do cliente (screens/relatorio-perfil-cliente.md).

/** Quantidade e parte da base, de 0 a 1. */
export type Share = { count: number; share: number };

export type AttendanceKind = "single" | "recurrence" | "package" | "class";

export type ClientsReport = {
  clients: number;
  active: number;
  newClients: number;
  lapsed: number;
  attended: number;
  /** Concluídos ÷ atendidos; null sem atendimento. */
  frequency: number | null;
  kinds: Record<AttendanceKind, Share>;
  sources: { clinic: Share; portal: Share };
  withApp: Share;
  /** key null: sem data de nascimento. */
  ages: (Share & { key: string | null })[];
  /** name null: sem endereço; others: a soma das demais cidades. */
  cities: (Share & { name: string | null; others?: true })[];
};

export type BirthdayClient = {
  id: string;
  name: string;
  photoUrl: string | null;
  phone: string | null;
  /** "aaaa-mm-dd". */
  birthDate: string;
  /** O aniversário no período, "aaaa-mm-dd". */
  birthday: string;
  turning: number;
};

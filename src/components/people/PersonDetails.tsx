import type { PersistedAddress } from "@/components/people/AddressesField";
import type { PeopleKind } from "@/components/people/people-kinds";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ContactRecord, PersonListItem } from "@/types/people";
import {
  addressTypeLabels,
  contactTypeLabels,
  formatCpf,
  formatDateOnly,
  formatPhone,
} from "@/utils/format";
import { maskCep } from "@/utils/masks";

type PersonDetailsProps = {
  person: PersonListItem;
  kind: PeopleKind;
  /**
   * Contatos e endereços (Visualizar do histórico do cliente). Sem eles, o
   * dialog mostra só o contato principal, como na listagem; `null` enquanto
   * carregam.
   */
  extra?: { contacts: ContactRecord[]; addresses: PersistedAddress[] } | null;
};

/**
 * Conteúdo do dialog "Visualizar" (screens/pessoas.md): os dados cadastrais.
 * Usado na listagem de pessoas e no cabeçalho do histórico do cliente.
 */
export function PersonDetails({ person, kind, extra }: PersonDetailsProps) {
  const phone = person.principalContact?.phone;
  const rows: [string, React.ReactNode][] = [
    ["Celular", phone && formatPhone(phone)],
    ["E-mail", person.principalContact?.email],
    ["CPF", person.document && formatCpf(person.document)],
    [
      "Data de nascimento",
      person.birthDate && formatDateOnly(person.birthDate),
    ],
    ["Profissão", person.profession],
    ["Observações", person.note],
  ];

  return (
    <>
      <DialogHeader>
        <div className="flex flex-1 justify-center">
          <PersonAvatar
            name={person.name}
            photoUrl={person.photoUrl}
            className="size-20 **:data-[slot=avatar-fallback]:text-3xl"
          />
        </div>
        <DialogTitle className="flex items-center gap-3">
          {person.name}
        </DialogTitle>
        <DialogDescription>Dados do {kind.singular}.</DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="tabular-nums">
              <EmptyValue>{value}</EmptyValue>
            </dd>
          </div>
        ))}
        <dt className="text-muted-foreground">Status</dt>
        <dd>
          <StatusBadge active={person.deletedAt === null} />
        </dd>
      </dl>

      {extra === null && (
        <p className="text-sm text-muted-foreground">
          Carregando contatos e endereços…
        </p>
      )}

      {extra && (
        <>
          <section aria-labelledby="details-contacts" className="space-y-2">
            <h3 id="details-contacts" className="text-sm font-semibold">
              Contatos
            </h3>
            {extra.contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum contato cadastrado.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-card border border-border text-sm">
                {extra.contacts.map((contact) => (
                  <li key={contact.id} className="space-y-0.5 px-3 py-2">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {contactTypeLabels[contact.type]}
                      {contact.isPrincipal && (
                        <Badge variant="secondary">Principal</Badge>
                      )}
                    </p>
                    <p className="text-muted-foreground tabular-nums">
                      {[
                        contact.phone && formatPhone(contact.phone),
                        contact.email,
                      ]
                        .filter(Boolean)
                        .join(" · ") || "Sem telefone e e-mail"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="details-addresses" className="space-y-2">
            <h3 id="details-addresses" className="text-sm font-semibold">
              Endereços
            </h3>
            {extra.addresses.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum endereço cadastrado.
              </p>
            ) : (
              <ul className="divide-y divide-border rounded-card border border-border text-sm">
                {extra.addresses.map((address) => (
                  <li key={address.id} className="space-y-0.5 px-3 py-2">
                    <p className="flex flex-wrap items-center gap-2 font-medium">
                      {address.street}, {address.number}
                      {address.complement && ` · ${address.complement}`}
                      {address.isPrincipal && (
                        <Badge variant="secondary">Principal</Badge>
                      )}
                    </p>
                    <p className="text-muted-foreground">
                      {address.neighborhood && `${address.neighborhood}, `}
                      {address.cityName}/{address.stateAcronym} · CEP{" "}
                      {maskCep(address.cep)} · {addressTypeLabels[address.type]}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}

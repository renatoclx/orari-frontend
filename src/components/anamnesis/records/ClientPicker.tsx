"use client";

import { useRouter } from "next/navigation";
import type { ClientOption } from "@/app/(admin)/appointment-actions";
import { useClientSearch } from "@/components/recurrences/useClientSearch";
import { Combobox } from "@/components/shared/Combobox";
import { FormField } from "@/components/shared/FormField";

type ClientPickerProps = {
  /** Primeiros clientes ativos; a busca no servidor cobre os demais. */
  initial: ClientOption[];
  /** Cliente já escolhido (na URL), se houver. */
  picked?: ClientOption;
};

/**
 * Escolha do cliente da nova ficha. Escolher leva à mesma página com o cliente
 * na URL (só o id), que então mostra o formulário.
 */
export function ClientPicker({ initial, picked }: ClientPickerProps) {
  const router = useRouter();
  const search = useClientSearch(initial, picked?.id ?? "", picked);

  return (
    <FormField id="anamnesis-client" label="Cliente" required>
      <Combobox
        id="anamnesis-client"
        options={search.options.map((item) => ({
          value: item.id,
          label: item.name,
        }))}
        value={picked?.id ?? ""}
        onValueChange={(next) => {
          search.pick(next);
          router.push(`/anamnese/fichas/nova?clienteId=${next}`);
        }}
        placeholder="Selecione o cliente…"
        searchPlaceholder="Buscar cliente…"
        emptyMessage="Nenhum cliente encontrado."
        loading={search.loading}
        onSearchChange={search.search}
      />
    </FormField>
  );
}

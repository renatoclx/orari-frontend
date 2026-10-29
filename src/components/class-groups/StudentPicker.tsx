"use client";

import { X } from "lucide-react";
import type { ClientOption } from "@/app/(admin)/appointment-actions";
import { useClientSearch } from "@/components/recurrences/useClientSearch";
import { Combobox } from "@/components/shared/Combobox";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { Button } from "@/components/ui/button";

/** Cliente escolhido para entrar na turma; `error` é o motivo da última recusa. */
export type PickedStudent = ClientOption & { error?: string };

type StudentPickerProps = {
  id: string;
  /** Primeiros clientes, para a busca. */
  clients: ClientOption[];
  selected: PickedStudent[];
  onChange: (selected: PickedStudent[]) => void;
  /** Clientes que já estão na sessão: não aparecem nas opções. */
  excludeIds?: string[];
  disabled?: boolean;
};

/**
 * Escolha de vários alunos de uma vez: cada cliente escolhido no Combobox vai
 * para a lista abaixo (e sai das opções), e o Combobox volta a ficar vazio.
 */
export function StudentPicker({
  id,
  clients,
  selected,
  onChange,
  excludeIds = [],
  disabled,
}: StudentPickerProps) {
  // Sem cliente "escolhido" no Combobox: a escolha vai direto para a lista.
  const clientSearch = useClientSearch(clients, "");
  const hidden = new Set([...excludeIds, ...selected.map((s) => s.id)]);

  return (
    <div className="space-y-2">
      <Combobox
        id={id}
        options={clientSearch.options
          .filter((option) => !hidden.has(option.id))
          .map((item) => ({ value: item.id, label: item.name }))}
        value=""
        onValueChange={(next) => {
          const client = clientSearch.options.find((c) => c.id === next);
          if (client) onChange([...selected, client]);
        }}
        placeholder="Selecione os clientes…"
        searchPlaceholder="Buscar cliente…"
        emptyMessage="Nenhum cliente encontrado."
        loading={clientSearch.loading}
        onSearchChange={clientSearch.search}
        disabled={disabled}
      />

      {selected.length > 0 && (
        <ul className="divide-y divide-border rounded-control border border-border">
          {selected.map((student) => (
            <li key={student.id} className="px-3 py-2 text-sm">
              <div className="flex items-center gap-3">
                <PersonAvatar name={student.name} size="sm" />
                <span className="min-w-0 flex-1 truncate">{student.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Tirar ${student.name} da lista`}
                  disabled={disabled}
                  onClick={() =>
                    onChange(selected.filter((s) => s.id !== student.id))
                  }
                >
                  <X aria-hidden="true" />
                </Button>
              </div>
              {/* O motivo fica junto do nome: dá para corrigir e tentar de novo. */}
              {student.error && (
                <p role="alert" className="mt-1 text-sm text-destructive">
                  {student.error}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

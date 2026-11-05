"use client";

import { useEffect, useState } from "react";
import { loadServiceProfessionalsAction } from "@/app/(admin)/service-actions";
import { Checkbox } from "@/components/ui/checkbox";

type Loaded = {
  professionals: { id: string; name: string }[];
  selected: string[];
};

/**
 * Quem atende o serviço (screens/servicos.md). Busca ao abrir o formulário. Os
 * marcados vão no formulário como `professionalIds`; `professionalsLoaded` só
 * vai se a lista carregou, para uma falha na busca não apagar os vínculos.
 */
export function ServiceProfessionalsField({
  serviceId,
}: {
  serviceId?: string;
}) {
  const [state, setState] = useState<Loaded>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let current = true;
    loadServiceProfessionalsAction(serviceId).then((result) => {
      if (!current) return;
      if (result.ok) {
        setState({
          professionals: result.professionals,
          selected: result.selected,
        });
      } else {
        setError(result.message);
      }
    });
    return () => {
      current = false;
    };
  }, [serviceId]);

  function toggle(id: string, checked: boolean) {
    setState(
      (current) =>
        current && {
          ...current,
          selected: checked
            ? [...current.selected, id]
            : current.selected.filter((item) => item !== id),
        },
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">Profissionais que atendem</legend>
      <p className="text-sm text-muted-foreground">
        O serviço aparece no portal do cliente quando tem ao menos um
        profissional.
      </p>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : !state ? (
        <p className="text-sm text-muted-foreground">Buscando…</p>
      ) : state.professionals.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum profissional ativo cadastrado.
        </p>
      ) : (
        <>
          <input type="hidden" name="professionalsLoaded" value="1" />
          <ul className="grid max-h-40 gap-2 overflow-y-auto rounded-control border border-border p-3 sm:grid-cols-2">
            {state.professionals.map((person) => {
              const checked = state.selected.includes(person.id);
              return (
                <li key={person.id}>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(next) =>
                        toggle(person.id, next === true)
                      }
                    />
                    <span className="truncate">{person.name}</span>
                  </label>
                  {checked && (
                    <input
                      type="hidden"
                      name="professionalIds"
                      value={person.id}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </fieldset>
  );
}

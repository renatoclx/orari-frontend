"use client";

import { useEffect, useState } from "react";
import { listServiceClassGroupsAction } from "@/app/(admin)/class-group-actions";
import type { ClassGroupItem } from "@/types/class-group";

type ServiceClassGroups = { canManage: boolean; classGroups: ClassGroupItem[] };

const NONE: ServiceClassGroups = { canManage: false, classGroups: [] };

/**
 * Turmas ativas do serviço e se quem está logado pode mexer nelas (ADMIN).
 * Enquanto carrega, ou se falhar, nada de turma aparece: as ações de turma são
 * um extra da tela de sessões.
 */
export function useServiceClassGroups(serviceId: string): ServiceClassGroups {
  const [loaded, setLoaded] = useState<{
    serviceId: string;
    value: ServiceClassGroups;
  }>();

  useEffect(() => {
    let current = true;
    listServiceClassGroupsAction(serviceId).then((result) => {
      if (!current) return;
      setLoaded({
        serviceId,
        value: result.ok
          ? { canManage: result.canManage, classGroups: result.classGroups }
          : NONE,
      });
    });
    return () => {
      current = false;
    };
  }, [serviceId]);

  return loaded?.serviceId === serviceId ? loaded.value : NONE;
}

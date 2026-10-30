"use client";

import { classGroupLabel } from "@/components/class-groups/class-group-rules";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ClassGroupItem } from "@/types/class-group";

// Valor do Select para "sem turma" (o Radix não aceita valor vazio no item).
const NO_CLASS = "none";

type ClassGroupSelectProps = {
  id: string;
  /** Turmas ativas que servem a este formulário (ex.: do serviço do plano). */
  classGroups: ClassGroupItem[];
  /** "" = sem turma (horário livre). */
  value: string;
  onChange: (classGroupId: string) => void;
  /** Mostra serviço e profissional no item (quando o serviço ainda não foi escolhido). */
  showService?: boolean;
};

/**
 * Escolha opcional da turma fixa: com turma, serviço e profissional são os
 * dela e os dias saem dos horários dela; "Sem turma" volta ao horário livre.
 */
export function ClassGroupSelect({
  id,
  classGroups,
  value,
  onChange,
  showService = false,
}: ClassGroupSelectProps) {
  return (
    <Select
      value={value || NO_CLASS}
      onValueChange={(next) => onChange(next === NO_CLASS ? "" : next)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_CLASS}>Sem turma (horário livre)</SelectItem>
        {classGroups.map((group) => (
          <SelectItem key={group.id} value={group.id}>
            {classGroupLabel(group)}
            {showService
              ? ` · ${group.service.name} · ${group.professional.name}`
              : ` · ${group.professional.name}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

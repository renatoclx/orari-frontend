"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { listClassGroupMembersAction } from "@/app/(admin)/class-group-actions";
import { describeClassDays } from "@/components/class-groups/class-group-rules";
import { PersonAvatar } from "@/components/shared/PersonAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassGroupMember } from "@/types/class-group";

/**
 * Alunos fixos da turma na Visualização: quem tem recorrência ou plano ativo
 * nela, com a origem e os dias. O aluno avulso aparece só nas sessões.
 */
export function ClassGroupMembersList({
  classGroupId,
}: {
  classGroupId: string;
}) {
  const [members, setMembers] = useState<ClassGroupMember[] | null>(null);

  useEffect(() => {
    let current = true;
    listClassGroupMembersAction(classGroupId).then((result) => {
      if (!current) return;
      if (result.ok) setMembers(result.members);
      else {
        setMembers([]);
        toast.error("Não foi possível carregar os alunos fixos.", {
          description: result.message,
        });
      }
    });
    return () => {
      current = false;
    };
  }, [classGroupId]);

  if (members === null) {
    return <Skeleton className="h-12 w-full" />;
  }
  if (members.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhum aluno fixo.</p>;
  }

  return (
    <ul className="max-h-60 divide-y divide-border overflow-auto rounded-control border border-border text-sm">
      {members.map((member) => (
        <li
          key={member.recurringAppointmentId}
          className="flex items-center gap-3 px-3 py-2"
        >
          <PersonAvatar
            name={member.client.name}
            photoUrl={member.client.photoUrl}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate">{member.client.name}</p>
            {/* De onde vem a vaga fixa: o plano contratado ou a recorrência. */}
            <p className="truncate text-xs text-muted-foreground">
              {member.clientPlan
                ? `Plano ${member.clientPlan.planName}`
                : "Recorrência"}
            </p>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {describeClassDays(member.days)}
          </span>
        </li>
      ))}
    </ul>
  );
}

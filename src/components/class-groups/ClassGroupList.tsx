"use client";

import { useState, useTransition } from "react";
import {
  Ban,
  CircleCheck,
  EllipsisVertical,
  Eye,
  Pencil,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { setClassGroupActiveAction } from "@/app/(admin)/class-group-actions";
import type { ClientOption } from "@/app/(admin)/appointment-actions";
import { ClassGroupEditDialog } from "@/components/class-groups/ClassGroupEditDialog";
import { EnrollClassGroupDialog } from "@/components/class-groups/EnrollClassGroupDialog";
import { UpcomingSessionsList } from "@/components/class-groups/UpcomingSessionsList";
import {
  classGroupLabel,
  describeClassDays,
  sortClassDays,
  weekDayLong,
} from "@/components/class-groups/class-group-rules";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { Hint } from "@/components/shared/Hint";
import { ListCard } from "@/components/shared/ListCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ClassGroupItem } from "@/types/class-group";
import { formatDuration } from "@/utils/format";

type ClassGroupListProps = {
  classGroups: ClassGroupItem[];
  /** Há busca ou filtro: muda a mensagem de lista vazia. */
  filtered: boolean;
  /** Rodapé fixo do card (paginação). */
  footer: React.ReactNode;
  /** Primeiros clientes, para o "Adicionar alunos". */
  clients: ClientOption[];
};

// Serviço com a bolinha da cor dele (a mesma do agendamento).
function ServiceName({ service }: { service: ClassGroupItem["service"] }) {
  return (
    <span className="inline-flex items-center gap-2">
      {service.color && (
        <span
          aria-hidden="true"
          className="size-3 shrink-0 rounded-full"
          style={{ backgroundColor: service.color }}
        />
      )}
      {service.name}
    </span>
  );
}

type RowHandlers = {
  onView: (classGroup: ClassGroupItem) => void;
  onEdit: (classGroup: ClassGroupItem) => void;
  onDeactivate: (classGroup: ClassGroupItem) => void;
  onActivate: (classGroup: ClassGroupItem) => void;
  onEnroll: (classGroup: ClassGroupItem) => void;
  /** Há uma ativação em andamento. */
  busy: boolean;
};

// Coluna Ações (screen-patterns.md): "Alterar" em destaque; Visualizar,
// Adicionar alunos e Inativar/Ativar no menu de três pontos. Sem Excluir: a
// turma é inativada.
function ClassGroupActions({
  classGroup,
  onView,
  onEdit,
  onDeactivate,
  onActivate,
  onEnroll,
  busy,
}: { classGroup: ClassGroupItem } & RowHandlers) {
  const label = classGroupLabel(classGroup);
  return (
    <div className="flex shrink-0 items-center justify-start gap-1">
      <Hint label={`Alterar ${label}`}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Alterar ${label}`}
          onClick={() => onEdit(classGroup)}
        >
          <Pencil aria-hidden="true" />
        </Button>
      </Hint>

      {/* modal={false}: o menu fecha antes do diálogo abrir, sem travar a página. */}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Hint label={`Mais ações para ${label}`}>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Mais ações para ${label}`}
            >
              <EllipsisVertical aria-hidden="true" />
            </Button>
          </Hint>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onView(classGroup)}>
            <Eye aria-hidden="true" />
            Visualizar
          </DropdownMenuItem>
          {/* Turma inativa não recebe novos encaixes. */}
          {classGroup.isActive && (
            <DropdownMenuItem onSelect={() => onEnroll(classGroup)}>
              <UserPlus aria-hidden="true" />
              Adicionar alunos
            </DropdownMenuItem>
          )}
          {classGroup.isActive ? (
            <DropdownMenuItem onSelect={() => onDeactivate(classGroup)}>
              <Ban aria-hidden="true" />
              Inativar
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={busy}
              onSelect={() => onActivate(classGroup)}
            >
              <CircleCheck aria-hidden="true" />
              Ativar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// Conteúdo do dialog de visualização.
function ClassGroupDetails({ classGroup }: { classGroup: ClassGroupItem }) {
  const rows: [string, React.ReactNode][] = [
    ["Serviço", <ServiceName key="s" service={classGroup.service} />],
    ["Duração", formatDuration(classGroup.service.duration)],
    ["Profissional", classGroup.professional.name],
    ["Vagas por sessão", classGroup.capacity],
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle>{classGroupLabel(classGroup)}</DialogTitle>
        <DialogDescription>
          Dados da turma e as próximas sessões.
        </DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="tabular-nums">{value}</dd>
          </div>
        ))}
        <dt className="text-muted-foreground">Dias e horários</dt>
        <dd>
          <ul className="space-y-0.5 tabular-nums">
            {sortClassDays(classGroup.days).map((day) => (
              <li key={`${day.weekDay}-${day.startTime}`}>
                {weekDayLong(day.weekDay)}, {day.startTime}–{day.endTime}
              </li>
            ))}
          </ul>
        </dd>
        <dt className="text-muted-foreground">Status</dt>
        <dd>
          <StatusBadge active={classGroup.isActive} />
        </dd>
      </dl>

      <section className="space-y-2 border-t border-border pt-4">
        <h3 className="text-sm font-medium">Próximas sessões</h3>
        <UpcomingSessionsList classGroupId={classGroup.id} />
      </section>
    </>
  );
}

/** Card da listagem: tabela (computador) ou cartões (celular), com as ações de cada turma. */
export function ClassGroupList({
  classGroups,
  filtered,
  footer,
  clients,
}: ClassGroupListProps) {
  // A turma fica guardada ao fechar, para o dialog não trocar de título durante
  // a animação de saída.
  const [editing, setEditing] = useState<ClassGroupItem>();
  const [editOpen, setEditOpen] = useState(false);
  const [viewing, setViewing] = useState<ClassGroupItem | null>(null);
  const [deactivating, setDeactivating] = useState<ClassGroupItem | null>(null);
  const [enrolling, setEnrolling] = useState<ClassGroupItem | null>(null);
  const [pending, startTransition] = useTransition();
  const [activating, startActivate] = useTransition();

  function edit(classGroup: ClassGroupItem) {
    setEditing(classGroup);
    setEditOpen(true);
  }

  function confirmDeactivate() {
    if (!deactivating) return;
    const target = deactivating;

    startTransition(async () => {
      const result = await setClassGroupActiveAction(target.id, false);
      if (result.ok) {
        toast.success("Turma inativada.", {
          description: classGroupLabel(target),
        });
        setDeactivating(null);
      } else {
        toast.error("Não foi possível inativar a turma.", {
          description: result.message,
        });
      }
    });
  }

  // Reativar confere de novo serviço, profissional e horários na API.
  function activate(classGroup: ClassGroupItem) {
    startActivate(async () => {
      const result = await setClassGroupActiveAction(classGroup.id, true);
      if (result.ok) {
        toast.success("Turma ativada.", {
          description: classGroupLabel(classGroup),
        });
      } else {
        toast.error("Não foi possível ativar a turma.", {
          description: result.message,
        });
      }
    });
  }

  const handlers: RowHandlers = {
    onView: setViewing,
    onEdit: edit,
    onDeactivate: setDeactivating,
    onActivate: activate,
    onEnroll: setEnrolling,
    busy: activating,
  };

  return (
    <ListCard
      columns={[
        "Nome",
        "Serviço",
        "Profissional",
        "Dias e horários",
        "Vagas",
        "Status",
        "Ações",
      ]}
      emptyMessage={
        classGroups.length === 0
          ? filtered
            ? "Nenhuma turma encontrada com estes filtros."
            : "Nenhuma turma cadastrada. Cadastre a primeira!"
          : undefined
      }
      cards={classGroups.map((classGroup) => (
        <li key={classGroup.id} className="space-y-1 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-medium">{classGroupLabel(classGroup)}</p>
            <ClassGroupActions classGroup={classGroup} {...handlers} />
          </div>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
            <dt className="text-muted-foreground">Serviço</dt>
            <dd>
              <ServiceName service={classGroup.service} />
            </dd>
            <dt className="text-muted-foreground">Profissional</dt>
            <dd>{classGroup.professional.name}</dd>
            <dt className="text-muted-foreground">Horários</dt>
            <dd className="tabular-nums">
              {describeClassDays(classGroup.days)}
            </dd>
            <dt className="text-muted-foreground">Vagas</dt>
            <dd className="tabular-nums">{classGroup.capacity}</dd>
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <StatusBadge active={classGroup.isActive} />
            </dd>
          </dl>
        </li>
      ))}
      rows={classGroups.map((classGroup) => (
        <tr key={classGroup.id} className="hover:bg-background">
          <td className="px-4 py-3 font-medium">
            <EmptyValue>{classGroup.name}</EmptyValue>
          </td>
          <td className="px-4 py-3">
            <ServiceName service={classGroup.service} />
          </td>
          <td className="px-4 py-3">{classGroup.professional.name}</td>
          <td className="px-4 py-3 tabular-nums">
            {describeClassDays(classGroup.days)}
          </td>
          <td className="px-4 py-3 tabular-nums">{classGroup.capacity}</td>
          <td className="px-4 py-3">
            <StatusBadge active={classGroup.isActive} />
          </td>
          <td className="px-4 py-2">
            <ClassGroupActions classGroup={classGroup} {...handlers} />
          </td>
        </tr>
      ))}
      footer={footer}
    >
      <EnrollClassGroupDialog
        classGroup={enrolling}
        clients={clients}
        onClose={() => setEnrolling(null)}
      />

      <ClassGroupEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        classGroup={editing}
      />

      <Dialog
        open={viewing !== null}
        onOpenChange={(open) => !open && setViewing(null)}
      >
        <DialogContent>
          {viewing && <ClassGroupDetails classGroup={viewing} />}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>
              <X aria-hidden="true" />
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title="Inativar turma?"
        description={`A turma ${deactivating ? classGroupLabel(deactivating) : ""} deixará de receber novos alunos. As sessões já marcadas continuam. Você poderá ativá-la novamente.`}
        confirmLabel="Inativar"
        icon={Ban}
        pendingLabel="Inativando…"
        pending={pending}
        onConfirm={confirmDeactivate}
      />
    </ListCard>
  );
}

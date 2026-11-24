"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarOff, LockOpen, X } from "lucide-react";
import { toast } from "sonner";
import {
  createAgendaBlockAction,
  deleteAgendaBlockAction,
  listAgendaBlocksAction,
} from "@/app/(admin)/agenda-block-actions";
import {
  agendaBlockErrors,
  agendaBlockLabel,
  type AgendaBlockErrors,
} from "@/components/agenda-blocks/agenda-block";
import { useCan } from "@/components/layout/Access";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { Hint } from "@/components/shared/Hint";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { AgendaBlock, AgendaBlockInput } from "@/types/agenda-block";
import { isDateString, toDateString } from "@/utils/time";

type AgendaBlockShortcutProps = {
  /** Fuso da empresa: datas e horários do bloqueio são no relógio dela. */
  timeZone: string;
  /** "bar": na barra lateral (dica à esquerda); "header": no celular. */
  placement: "bar" | "header";
};

// "aaaa-mm-dd" → Date local (é o que o calendário compara).
function parseDay(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Atalho "Bloquear horários" (screens/agendamentos.md e layout.md): um dialog
 * para bloquear um intervalo de um dia e, embaixo, os bloqueios de hoje em
 * diante, com Desbloquear. Bloquear exige a ação Cria de Agendamentos;
 * desbloquear, a Exclui ("remove").
 */
export function AgendaBlockShortcut({
  timeZone,
  placement,
}: AgendaBlockShortcutProps) {
  const canDelete = useCan("appointments", "remove");
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AgendaBlockInput>({
    date: "",
    startTime: "",
    endTime: "",
  });
  // Recomeça o calendário ao abrir e depois de bloquear.
  const [formKey, setFormKey] = useState(0);
  const [errors, setErrors] = useState<AgendaBlockErrors>({});
  const [blocks, setBlocks] = useState<AgendaBlock[] | null>(null);
  const [loadError, setLoadError] = useState<string>();
  const [confirmMessage, setConfirmMessage] = useState<string>();
  const [unblocking, setUnblocking] = useState<AgendaBlock | null>(null);
  const [pending, startTransition] = useTransition();

  const today = toDateString(new Date(), timeZone);

  async function loadBlocks() {
    const result = await listAgendaBlocksAction();
    if (result.ok) {
      setBlocks(result.blocks);
      setLoadError(undefined);
    } else {
      setLoadError(result.message);
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) return;
    // Começa no dia aberto na agenda (?date=), se não for passado; senão, hoje.
    const shown = searchParams.get("date");
    setForm({
      date: shown && isDateString(shown) && shown >= today ? shown : today,
      startTime: "",
      endTime: "",
    });
    setErrors({});
    setFormKey((key) => key + 1);
    setBlocks(null);
    void loadBlocks();
  }

  function update(field: keyof AgendaBlockInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((c) => ({ ...c, [field]: undefined }));
  }

  function block(confirmed = false) {
    startTransition(async () => {
      const result = await createAgendaBlockAction(form, confirmed);
      if (result.ok) {
        toast.success("Horário bloqueado.", {
          description: agendaBlockLabel(
            {
              startAt: `${form.date}T${form.startTime}:00.000Z`,
              endAt: `${form.date}T${form.endTime}:00.000Z`,
            },
            // Os horários do formulário já estão no relógio da empresa.
            "UTC",
          ),
        });
        setConfirmMessage(undefined);
        setForm((current) => ({ ...current, startTime: "", endTime: "" }));
        await loadBlocks();
        return;
      }
      // Há agendamentos no horário: confirma antes de bloquear.
      if ("needsConfirmation" in result) {
        setConfirmMessage(result.message);
        return;
      }
      setConfirmMessage(undefined);
      if (result.field) setErrors({ [result.field]: result.message });
      toast.error("Não foi possível bloquear o horário.", {
        description: result.message,
      });
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = agendaBlockErrors(form, new Date(), timeZone);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    block();
  }

  function unblock(target: AgendaBlock) {
    startTransition(async () => {
      const result = await deleteAgendaBlockAction(target.id);
      setUnblocking(null);
      if (!result.ok) {
        toast.error("Não foi possível desbloquear.", {
          description: result.message,
        });
        return;
      }
      toast.success("Horário desbloqueado.", {
        description: agendaBlockLabel(target, timeZone),
      });
      await loadBlocks();
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Hint
          label="Bloquear horários da agenda"
          side={placement === "bar" ? "left" : "bottom"}
        >
          <button
            type="button"
            aria-label="Bloquear horários"
            className="rounded-control p-2 text-muted-foreground hover:bg-background hover:text-foreground"
          >
            <CalendarOff className="size-5" aria-hidden="true" />
          </button>
        </Hint>
      </DialogTrigger>

      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bloquear horários</DialogTitle>
          <DialogDescription>
            Apenas encaixes serão permitidos em horários bloqueados.
          </DialogDescription>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          <FormField id="block-date" label="Data" required error={errors.date}>
            <DatePicker
              key={formKey}
              id="block-date"
              name="date"
              initialValue={form.date}
              minDate={parseDay(today)}
              onValueChange={(next) => update("date", next)}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField
              id="block-start"
              label="Início"
              required
              error={errors.startTime}
            >
              <Input
                id="block-start"
                type="time"
                step={900}
                value={form.startTime}
                onChange={(event) => update("startTime", event.target.value)}
                aria-invalid={errors.startTime ? true : undefined}
                aria-describedby={
                  errors.startTime ? "block-start-error" : undefined
                }
              />
            </FormField>
            <FormField
              id="block-end"
              label="Fim"
              required
              error={errors.endTime}
            >
              <Input
                id="block-end"
                type="time"
                step={900}
                value={form.endTime}
                onChange={(event) => update("endTime", event.target.value)}
                aria-invalid={errors.endTime ? true : undefined}
                aria-describedby={
                  errors.endTime ? "block-end-error" : undefined
                }
              />
            </FormField>
          </div>
          <Button type="submit" disabled={pending} className="w-full">
            <CalendarOff aria-hidden="true" />
            {pending ? "Bloqueando…" : "Bloquear"}
          </Button>
        </form>

        <section aria-labelledby="blocked-title" className="space-y-2">
          <h3 id="blocked-title" className="text-sm font-semibold">
            Bloqueados
          </h3>
          {loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : blocks === null ? (
            <p className="text-sm text-muted-foreground">Carregando…</p>
          ) : blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum horário bloqueado.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-card border border-border">
              {blocks.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-3 py-2"
                >
                  <div className="min-w-0 text-sm">
                    <p className="font-medium">
                      {agendaBlockLabel(item, timeZone)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Bloqueado por {item.createdBy.name}
                    </p>
                  </div>
                  {canDelete && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => setUnblocking(item)}
                    >
                      <LockOpen aria-hidden="true" />
                      Desbloquear
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              <X aria-hidden="true" />
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>

        {/* Já há agendamentos no horário: eles continuam marcados. */}
        <ConfirmDialog
          open={confirmMessage !== undefined}
          onOpenChange={(next) => !next && setConfirmMessage(undefined)}
          title="Bloquear mesmo assim?"
          description={confirmMessage}
          confirmLabel="Bloquear"
          pendingLabel="Bloqueando…"
          pending={pending}
          icon={CalendarOff}
          onConfirm={() => block(true)}
        />

        <ConfirmDialog
          open={unblocking !== null}
          onOpenChange={(next) => !next && setUnblocking(null)}
          title="Desbloquear horário?"
          description={
            unblocking
              ? `${agendaBlockLabel(unblocking, timeZone)}. O horário volta a ficar livre na agenda e no app do cliente.`
              : ""
          }
          confirmLabel="Desbloquear"
          pendingLabel="Desbloqueando…"
          pending={pending}
          icon={LockOpen}
          onConfirm={() => unblocking && unblock(unblocking)}
        />
      </DialogContent>
    </Dialog>
  );
}

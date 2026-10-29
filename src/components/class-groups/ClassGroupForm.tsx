"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { createClassGroupAction } from "@/app/(admin)/class-group-actions";
import { ClassGroupDaysField } from "@/components/class-groups/ClassGroupDaysField";
import {
  CAPACITY_MAX,
  CAPACITY_MIN,
  CLASS_NAME_MAX,
  hasErrors,
  validateClassGroupForm,
  type ClassGroupFormErrors,
  type ClassSlotDraft,
} from "@/components/class-groups/class-group-rules";
import { Combobox } from "@/components/shared/Combobox";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatDuration } from "@/utils/format";

type ClassGroupFormProps = {
  /** Serviços ativos que aceitam turma. */
  services: { id: string; name: string; duration: number }[];
  professionals: { id: string; name: string }[];
};

// Ids dos campos, na ordem da tela: o foco vai para o primeiro inválido.
const FIELD_IDS = [
  ["name", "class-group-name"],
  ["service", "class-group-service"],
  ["professional", "class-group-professional"],
  ["capacity", "class-group-capacity"],
  ["days", "class-group-days"],
  ["slots", "class-group-days"],
] as const;

/** Cadastro de turma fixa: serviço, profissional, vagas e os horários da semana. */
export function ClassGroupForm({
  services,
  professionals,
}: ClassGroupFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [capacity, setCapacity] = useState("");
  const [slots, setSlots] = useState<ClassSlotDraft[]>([]);
  const [errors, setErrors] = useState<ClassGroupFormErrors>({});
  const [pending, startTransition] = useTransition();
  const nextKey = useRef(0);

  const service = services.find((item) => item.id === serviceId);
  const duration = service?.duration ?? 0;

  function clear(field: keyof ClassGroupFormErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const found = validateClassGroupForm({
      name,
      serviceId,
      professionalId,
      capacity,
      slots,
      duration,
    });
    setErrors(found);
    const firstInvalid = FIELD_IDS.find(([field]) => found[field]);
    if (firstInvalid || hasErrors(found)) {
      document.getElementById(firstInvalid?.[1] ?? "")?.focus();
      return;
    }

    startTransition(async () => {
      const result = await createClassGroupAction({
        name: name.trim() || undefined,
        serviceId,
        professionalId,
        capacity: Number(capacity),
        days: slots.map(({ weekDay, startTime }) => ({ weekDay, startTime })),
      });

      if (result.ok) {
        toast.success("Turma cadastrada.", {
          description: name.trim() || service?.name,
        });
        router.push("/turmas");
        return;
      }
      // Ex.: horário fora do funcionamento ou sobre outra turma do profissional.
      toast.error("Não foi possível cadastrar a turma.", {
        description: result.message,
      });
    });
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card"
    >
      {/* relative: os inputs escondidos do Radix (Select num form) são absolutos;
          presos aqui, não aumentam a altura da página. */}
      <div className="relative min-h-0 flex-1 space-y-4 overflow-auto p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField id="class-group-name" label="Nome" error={errors.name}>
            <Input
              id="class-group-name"
              value={name}
              maxLength={CLASS_NAME_MAX}
              autoComplete="off"
              placeholder="Ex.: Pilates manhã"
              aria-invalid={errors.name ? true : undefined}
              onChange={(event) => {
                setName(event.target.value);
                clear("name");
              }}
            />
          </FormField>

          <FormField
            id="class-group-service"
            label="Serviço"
            required
            error={errors.service}
          >
            <Combobox
              id="class-group-service"
              options={services.map((item) => ({
                value: item.id,
                label: `${item.name} · ${formatDuration(item.duration)}`,
              }))}
              value={serviceId}
              onValueChange={(next) => {
                setServiceId(next);
                clear("service");
                // A duração muda o fim e a sobreposição dos horários.
                clear("slots");
              }}
              placeholder="Selecione o serviço…"
              searchPlaceholder="Buscar serviço…"
              emptyMessage="Nenhum serviço aceita turma."
            />
          </FormField>

          <FormField
            id="class-group-professional"
            label="Profissional"
            required
            error={errors.professional}
          >
            <Select
              value={professionalId || undefined}
              onValueChange={(next) => {
                setProfessionalId(next);
                clear("professional");
              }}
            >
              <SelectTrigger id="class-group-professional" className="w-full">
                <SelectValue placeholder="Selecione o profissional…" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            id="class-group-capacity"
            label="Vagas por sessão"
            required
            error={errors.capacity}
          >
            <Input
              id="class-group-capacity"
              type="number"
              inputMode="numeric"
              min={CAPACITY_MIN}
              max={CAPACITY_MAX}
              value={capacity}
              placeholder={`De ${CAPACITY_MIN} a ${CAPACITY_MAX}`}
              aria-invalid={errors.capacity ? true : undefined}
              onChange={(event) => {
                setCapacity(event.target.value.replace(/\D/g, ""));
                clear("capacity");
              }}
            />
          </FormField>
        </div>

        {services.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhum serviço ativo aceita turma. Marque “Aceita turma” no serviço,
            em{" "}
            <Link href="/servicos" className="underline">
              Serviços
            </Link>
            .
          </p>
        )}

        <FormField
          id="class-group-days"
          label="Dias e horários"
          required
          error={errors.days}
        >
          <ClassGroupDaysField
            id="class-group-days"
            slots={slots}
            onChange={(next) => {
              setSlots(next);
              clear("days");
              clear("slots");
            }}
            errors={errors.slots ?? {}}
            duration={duration}
            newKey={() => `slot-${nextKey.current++}`}
          />
        </FormField>
      </div>

      <FormFooter
        note={
          service
            ? `Cada sessão dura ${formatDuration(service.duration)}. Serviço, profissional e horários não mudam depois do cadastro.`
            : "Campos marcados com * são obrigatórios."
        }
      >
        <Button asChild variant="outline" disabled={pending}>
          <Link href="/turmas">
            <X aria-hidden="true" />
            Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={pending}>
          <Plus aria-hidden="true" />
          {pending ? "Cadastrando…" : "Cadastrar"}
        </Button>
      </FormFooter>
    </form>
  );
}

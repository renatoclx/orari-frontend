"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { createEntryAction } from "@/app/(admin)/anamnesis-actions";
import { AnswerField } from "@/components/anamnesis/records/AnswerField";
import {
  changedAnswers,
  draftFromValue,
  emptyDraft,
  type AnswerDraft,
} from "@/components/anamnesis/records/answer-form";
import {
  entryFieldOrder,
  EVOLUTION_MAX,
  validateEntryForm,
  type EntryFormErrors,
  type EntryFormValues,
} from "@/components/anamnesis/records/entry-validation";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { FormSection } from "@/components/shared/FormSection";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { AnamnesisQuestion, AnswerValue } from "@/types/anamnesis";

type EntryFormProps = {
  clientId: string;
  anamnesisId: string;
  /** Perguntas da própria ficha (a versão em que ela nasceu), em ordem. */
  questions: AnamnesisQuestion[];
  /** Resposta atual de cada pergunta (pelo id), para preencher e comparar. */
  current: Record<string, AnswerValue>;
  /** Agendamentos do cliente, já com o texto da opção. */
  appointments: { id: string; label: string }[];
  /** Hoje no fuso da empresa e data do registro inicial ("aaaa-mm-dd"). */
  today: string;
  initialDate: string;
};

// O Radix Select não aceita valor vazio: "NONE" é "sem agendamento".
const NO_APPOINTMENT = "NONE";

/**
 * Novo acompanhamento: a anotação da evolução (texto grande, obrigatória) e,
 * se preciso, a alteração de respostas da ficha. Só as respostas que mudaram
 * vão para a API. O rascunho fica só em memória (dado de saúde: nada de
 * localStorage nem URL).
 */
export function EntryForm({
  clientId,
  anamnesisId,
  questions,
  current,
  appointments,
  today,
  initialDate,
}: EntryFormProps) {
  const router = useRouter();
  const backHref = `/clientes/${clientId}/anamnese/${anamnesisId}`;
  const [values, setValues] = useState<EntryFormValues>({
    evolution: "",
    consultationDate: today,
    appointmentId: "",
  });
  const [drafts, setDrafts] = useState<Record<string, AnswerDraft>>(() =>
    Object.fromEntries(
      questions.map((question) => [
        question.id,
        question.id in current
          ? draftFromValue(question, current[question.id])
          : emptyDraft(),
      ]),
    ),
  );
  const [errors, setErrors] = useState<EntryFormErrors>({});
  const [answerErrors, setAnswerErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  function set<K extends keyof EntryFormValues>(
    field: K,
    value: EntryFormValues[K],
  ) {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateEntryForm(values, today, initialDate);
    const changed = changedAnswers(questions, drafts, current);
    setErrors(found);
    setAnswerErrors(changed.errors);

    const firstField = entryFieldOrder.find((field) => found[field]);
    if (firstField) {
      document.getElementById(`entry-${firstField}`)?.focus();
      return;
    }
    const firstBad = questions.find((question) => changed.errors[question.id]);
    if (firstBad) {
      document.getElementById(`entry-a-${firstBad.id}`)?.focus();
      return;
    }

    startTransition(async () => {
      const result = await createEntryAction(clientId, anamnesisId, {
        evolution: values.evolution.trim(),
        consultationDate: values.consultationDate,
        ...(values.appointmentId && { appointmentId: values.appointmentId }),
        ...(changed.answers.length > 0 && { answers: changed.answers }),
      });
      if (result.ok) {
        toast.success("Acompanhamento registrado.");
        router.push(backHref);
        return;
      }
      if (result.field) {
        setErrors({ [result.field]: result.message });
        document.getElementById(`entry-${result.field}`)?.focus();
      }
      toast.error("Não foi possível registrar o acompanhamento.", {
        description: result.message,
      });
    });
  }

  const length = values.evolution.length;

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card"
    >
      {/* relative: os inputs escondidos do Radix ficam presos aqui. */}
      <div className="relative min-h-0 flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <FormField
            id="entry-evolution"
            label="Evolução do atendimento"
            required
            error={errors.evolution}
          >
            <Textarea
              id="entry-evolution"
              rows={8}
              className="min-h-48"
              value={values.evolution}
              onChange={(event) => set("evolution", event.target.value)}
              placeholder="Anote como foi o atendimento e a evolução do cliente"
              aria-invalid={errors.evolution ? true : undefined}
              autoFocus
            />
            <p
              className={`text-right text-xs tabular-nums ${
                length > EVOLUTION_MAX
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {length.toLocaleString("pt-BR")} de{" "}
              {EVOLUTION_MAX.toLocaleString("pt-BR")}
            </p>
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="entry-consultationDate"
              label="Data da consulta"
              required
              error={errors.consultationDate}
            >
              <DatePicker
                id="entry-consultationDate"
                name="consultationDate"
                maxDate={new Date(`${today}T12:00:00`)}
                initialValue={values.consultationDate}
                onValueChange={(date) => set("consultationDate", date)}
              />
            </FormField>
            <FormField id="entry-appointment" label="Agendamento relacionado">
              <Select
                value={values.appointmentId || NO_APPOINTMENT}
                onValueChange={(next) =>
                  set("appointmentId", next === NO_APPOINTMENT ? "" : next)
                }
              >
                <SelectTrigger id="entry-appointment" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_APPOINTMENT}>Nenhum</SelectItem>
                  {appointments.map((appointment) => (
                    <SelectItem key={appointment.id} value={appointment.id}>
                      {appointment.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <FormSection
            title="Atualizar respostas da ficha"
            description="Opcional. Altere só o que mudou; as respostas atuais já vêm preenchidas."
          >
            <div className="space-y-5 pt-3">
              {questions.map((question) => (
                <AnswerField
                  key={question.id}
                  id={`entry-a-${question.id}`}
                  question={question}
                  value={drafts[question.id] ?? emptyDraft()}
                  onChange={(next) => {
                    setDrafts((previous) => ({
                      ...previous,
                      [question.id]: next,
                    }));
                    setAnswerErrors((previous) => ({
                      ...previous,
                      [question.id]: "",
                    }));
                  }}
                  error={answerErrors[question.id]}
                />
              ))}
            </div>
          </FormSection>
        </div>
      </div>

      <FormFooter
        note={
          <>
            <span className="text-destructive">*</span> Campos obrigatórios
          </>
        }
      >
        <Button asChild variant="outline">
          <Link href={backHref}>
            <X aria-hidden="true" />
            Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={pending}>
          <Save aria-hidden="true" />
          {pending ? "Salvando…" : "Registrar acompanhamento"}
        </Button>
      </FormFooter>
    </form>
  );
}

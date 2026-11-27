"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createAnamnesisAction } from "@/app/(admin)/anamnesis-actions";
import { AnswerField } from "@/components/anamnesis/records/AnswerField";
import {
  buildNewAnswers,
  emptyDraft,
  type AnswerDraft,
} from "@/components/anamnesis/records/answer-form";
import { validateConsultationDate } from "@/components/anamnesis/records/entry-validation";
import { DatePicker } from "@/components/shared/DatePicker";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TemplateQuestion } from "@/types/anamnesis";

type NewAnamnesisFormProps = {
  client: { id: string; name: string };
  /** Modelos ativos que o cliente ainda não usou, com as perguntas da versão vigente. */
  templates: {
    id: string;
    name: string;
    questions: TemplateQuestion[];
    responsibilityTerm: string | null;
  }[];
  /** Atualizar ficha: o modelo já escolhido e as respostas trazidas da antiga. */
  initial?: { templateId: string; drafts: Record<string, AnswerDraft> };
  /** Hoje no fuso da empresa ("aaaa-mm-dd"). */
  today: string;
};

/**
 * Nova ficha do cliente: escolha do modelo, data da consulta e as respostas
 * (registro inicial). O rascunho fica só em memória (dado de saúde: nada de
 * localStorage nem URL); trocar o modelo descarta as respostas, pois as
 * perguntas mudam.
 */
export function NewAnamnesisForm({
  client,
  templates,
  initial,
  today,
}: NewAnamnesisFormProps) {
  const router = useRouter();
  // Só um modelo disponível: já vem escolhido (ou o da ficha que se atualiza).
  const [templateId, setTemplateId] = useState(
    initial?.templateId ?? (templates.length === 1 ? templates[0].id : ""),
  );
  const [consultationDate, setConsultationDate] = useState(today);
  const [drafts, setDrafts] = useState<Record<string, AnswerDraft>>(
    initial?.drafts ?? {},
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dateError, setDateError] = useState<string>();
  const [pending, startTransition] = useTransition();

  const template = templates.find((item) => item.id === templateId);
  const questions = template
    ? [...template.questions].sort((a, b) => a.position - b.position)
    : [];
  const backHref = `/clientes/${client.id}?aba=anamnese`;

  function chooseTemplate(next: string) {
    setTemplateId(next);
    setDrafts({});
    setErrors({});
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!template) {
      document.getElementById("anamnesis-template")?.focus();
      return;
    }
    const date = validateConsultationDate(consultationDate, today);
    const built = buildNewAnswers(questions, drafts);
    setDateError(date ?? undefined);
    setErrors(built.errors);

    // Foco no primeiro erro, na ordem da tela (a data vem antes das perguntas).
    if (date) {
      document.getElementById("anamnesis-date")?.focus();
      return;
    }
    const firstBad = questions.find((question) => built.errors[question.id]);
    if (firstBad) {
      document.getElementById(`new-a-${firstBad.id}`)?.focus();
      return;
    }

    startTransition(async () => {
      const result = await createAnamnesisAction({
        clientId: client.id,
        templateId: template.id,
        consultationDate,
        answers: built.answers,
      });
      if (result.ok) {
        toast.success("Ficha criada.", { description: client.name });
        router.push(`/clientes/${client.id}/anamnese/${result.id}`);
        return;
      }
      toast.error("Não foi possível criar a ficha.", {
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
      {/* relative: os inputs escondidos do Radix ficam presos aqui. */}
      <div className="relative min-h-0 flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="anamnesis-template" label="Modelo de ficha" required>
              <Select
                value={templateId || undefined}
                onValueChange={chooseTemplate}
              >
                <SelectTrigger id="anamnesis-template" className="w-full">
                  <SelectValue placeholder="Selecione o modelo" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Trocar o modelo descarta as respostas já digitadas.
              </p>
            </FormField>
            <FormField
              id="anamnesis-date"
              label="Data da consulta"
              required
              error={dateError}
            >
              <DatePicker
                id="anamnesis-date"
                name="consultationDate"
                maxDate={new Date(`${today}T12:00:00`)}
                initialValue={consultationDate}
                onValueChange={(next) => {
                  setConsultationDate(next);
                  setDateError(undefined);
                }}
              />
            </FormField>
          </div>

          {template && (
            <section aria-label="Perguntas da ficha" className="space-y-5">
              {questions.map((question) => (
                <AnswerField
                  // O modelo na chave: outro modelo, campos novos e limpos.
                  key={`${template.id}-${question.id}`}
                  id={`new-a-${question.id}`}
                  question={question}
                  value={drafts[question.id] ?? emptyDraft()}
                  showRequired
                  onChange={(next) => {
                    setDrafts((previous) => ({
                      ...previous,
                      [question.id]: next,
                    }));
                    setErrors((previous) => ({
                      ...previous,
                      [question.id]: "",
                    }));
                  }}
                  error={errors[question.id]}
                />
              ))}
            </section>
          )}

          {/* Só leitura: o profissional pode ler o termo com o cliente antes de
              imprimir a ficha para assinar. */}
          {template?.responsibilityTerm && (
            <section className="space-y-2 rounded-control border border-border bg-muted px-4 py-3">
              <h2 className="text-sm font-semibold">
                Termo de responsabilidade
              </h2>
              <p className="text-justify text-sm whitespace-pre-line text-muted-foreground">
                {template.responsibilityTerm}
              </p>
            </section>
          )}
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
        <Button type="submit" disabled={pending || !template}>
          <Plus aria-hidden="true" />
          {pending ? "Criando…" : "Criar ficha"}
        </Button>
      </FormFooter>
    </form>
  );
}

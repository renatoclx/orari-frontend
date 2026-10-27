"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Info, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  createTemplateAction,
  updateTemplateAction,
} from "@/app/(admin)/anamnesis-template-actions";
import { QuestionsEditor } from "@/components/anamnesis/templates/QuestionsEditor";
import {
  draftFromTemplate,
  emptyQuestion,
  hasErrors,
  validateTemplateForm,
  type TemplateFormErrors,
  type TemplateFormValues,
} from "@/components/anamnesis/templates/template-validation";
import { FormField } from "@/components/shared/FormField";
import { FormFooter } from "@/components/shared/FormFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TemplateItem } from "@/types/anamnesis";

const BASE_PATH = "/anamnese/modelos";

type TemplateFormProps = {
  /** Presente na alteração; sem isso, é o cadastro. */
  template?: TemplateItem;
};

// Chaves das linhas do editor: as iniciais ("i…") nascem na primeira renderização
// e as novas ("n…") vêm de um contador; a mesma chave sempre aponta a mesma linha.
function initialValues(template?: TemplateItem): TemplateFormValues {
  let seq = 0;
  const key = () => `i${seq++}`;
  return {
    name: template?.name ?? "",
    description: template?.description ?? "",
    questions: template
      ? draftFromTemplate(template, key)
      : [emptyQuestion(key())],
  };
}

/**
 * Cadastro e alteração de modelo de ficha (página): dados e o editor de
 * perguntas. Na alteração, só vão para a API as perguntas que mudaram (e cada
 * mudança cria uma nova versão do modelo).
 */
export function TemplateForm({ template }: TemplateFormProps) {
  const router = useRouter();
  const editing = template !== undefined;
  const [values, setValues] = useState(() => initialValues(template));
  const [errors, setErrors] = useState<TemplateFormErrors>({});
  const [pending, startTransition] = useTransition();
  const nextKey = useRef(0);
  const newKey = () => `n${nextKey.current++}`;

  function set<K extends keyof TemplateFormValues>(
    field: K,
    value: TemplateFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  // Ao editar uma pergunta, o erro dela some (e o das removidas).
  function setQuestions(questions: TemplateFormValues["questions"]) {
    const before = new Map(values.questions.map((item) => [item.key, item]));
    setValues((current) => ({ ...current, questions }));
    setErrors((current) => ({
      ...current,
      questions: undefined,
      items: current.items
        ? Object.fromEntries(
            Object.entries(current.items).filter(([key]) => {
              const now = questions.find((question) => question.key === key);
              return now !== undefined && now === before.get(key);
            }),
          )
        : undefined,
    }));
  }

  // Foco no primeiro campo com erro, na ordem da tela.
  function focusFirst(found: TemplateFormErrors) {
    if (found.name) return document.getElementById("template-name")?.focus();
    if (found.description)
      return document.getElementById("template-description")?.focus();
    if (found.questions)
      return document.getElementById("add-question")?.focus();
    const first = values.questions.find(
      (question) => found.items?.[question.key],
    );
    if (!first) return;
    const fields = found.items![first.key];
    const target = fields.label
      ? `q-${first.key}-label`
      : fields.options
        ? `q-${first.key}-option-${first.options[0]?.key}`
        : fields.detailLabel
          ? `q-${first.key}-detail`
          : `q-${first.key}-help`;
    document.getElementById(target)?.focus();
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateTemplateForm(values, Boolean(template?.description));
    setErrors(found);
    if (hasErrors(found)) {
      focusFirst(found);
      return;
    }

    startTransition(async () => {
      const result = template
        ? await updateTemplateAction(template.id, values)
        : await createTemplateAction(values);

      if (result.ok) {
        toast.success(editing ? "Modelo atualizado." : "Modelo cadastrado.", {
          description: values.name.trim(),
        });
        router.push(BASE_PATH);
        return;
      }
      if (result.field === "name") {
        setErrors({ name: result.message });
        document.getElementById("template-name")?.focus();
      }
      toast.error(
        editing
          ? "Não foi possível atualizar o modelo."
          : "Não foi possível cadastrar o modelo.",
        { description: result.message },
      );
    });
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card"
    >
      {/* relative: os inputs escondidos do Radix (Switch e Select num form) são
          absolutos; presos aqui, não aumentam a altura da página. */}
      <div className="relative min-h-0 flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-3xl space-y-8">
          <section className="space-y-4">
            <h2 className="font-semibold">Dados do modelo</h2>
            <FormField
              id="template-name"
              label="Nome"
              required
              error={errors.name}
            >
              <Input
                id="template-name"
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
                autoComplete="off"
                placeholder="Ex.: Ficha de fisioterapia"
                aria-invalid={errors.name ? true : undefined}
                autoFocus={!editing}
              />
            </FormField>
            <FormField
              id="template-description"
              label="Descrição"
              error={errors.description}
            >
              <Textarea
                id="template-description"
                rows={2}
                value={values.description}
                onChange={(event) => set("description", event.target.value)}
                placeholder="Para que serve este modelo"
                aria-invalid={errors.description ? true : undefined}
              />
            </FormField>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="font-semibold">Perguntas</h2>
              <p className="text-sm text-muted-foreground">
                Arraste pela alça para mudar a ordem. A numeração é a da ficha.
              </p>
            </div>
            {editing && (
              <p
                role="note"
                className="flex items-start gap-2 rounded-control border border-border bg-muted px-3 py-2 text-sm"
              >
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Mudar as perguntas cria a versão{" "}
                {template.currentVersion.version + 1} do modelo e vale para as
                próximas fichas; as já preenchidas não mudam. Renomear não cria
                versão.
              </p>
            )}
            <QuestionsEditor
              value={values.questions}
              onChange={setQuestions}
              errors={errors.items}
              listError={errors.questions}
              newKey={newKey}
            />
          </section>
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
          <Link href={BASE_PATH}>
            <X aria-hidden="true" />
            Cancelar
          </Link>
        </Button>
        <Button type="submit" disabled={pending}>
          {editing ? <Save aria-hidden="true" /> : <Plus aria-hidden="true" />}
          {editing
            ? pending
              ? "Salvando…"
              : "Salvar alterações"
            : pending
              ? "Cadastrando…"
              : "Cadastrar"}
        </Button>
      </FormFooter>
    </form>
  );
}

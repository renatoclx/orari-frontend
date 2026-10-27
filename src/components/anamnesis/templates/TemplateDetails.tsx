import { questionTypeLabels } from "@/components/anamnesis/templates/question-types";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Badge } from "@/components/ui/badge";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TemplateItem } from "@/types/anamnesis";

/** Conteúdo do dialog de visualização: o modelo e as perguntas da versão vigente. */
export function TemplateDetails({ template }: { template: TemplateItem }) {
  const { version, questions } = template.currentVersion;
  return (
    <>
      <DialogHeader>
        <DialogTitle>{template.name}</DialogTitle>
        <DialogDescription>
          {template.description ?? "Sem descrição."}
        </DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Versão atual</dt>
        <dd>{version}</dd>
        <dt className="text-muted-foreground">Status</dt>
        <dd>
          <StatusBadge active={template.isActive} />
        </dd>
      </dl>

      <ol className="max-h-80 space-y-2 overflow-y-auto rounded-control border border-border p-3 text-sm">
        {questions.map((question) => (
          <li key={question.id} className="space-y-0.5">
            <p className="font-medium">
              {question.position}. {question.label}
              {question.isRequired && (
                <span className="ml-0.5 text-destructive" aria-hidden="true">
                  *
                </span>
              )}
            </p>
            <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">
                {questionTypeLabels[question.type]}
              </Badge>
              {question.isRequired && <span>Obrigatória</span>}
            </p>
            {question.helpText && (
              <p className="text-xs text-muted-foreground">
                {question.helpText}
              </p>
            )}
            {question.options.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Opções: {question.options.join(", ")}
              </p>
            )}
            {question.detailLabel && (
              <p className="text-xs text-muted-foreground">
                Detalhe se “sim”: {question.detailLabel}
              </p>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}

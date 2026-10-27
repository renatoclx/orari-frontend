import { formatAnswer } from "@/components/anamnesis/records/answer-format";
import { EmptyValue } from "@/components/shared/EmptyValue";
import type { AnamnesisDetail } from "@/types/anamnesis";
import { formatDateOnly } from "@/utils/format";

type CurrentAnswersProps = {
  detail: AnamnesisDetail;
};

/**
 * Situação atual da ficha: a resposta mais recente de cada pergunta, na ordem
 * da ficha. As perguntas são as da versão em que ela nasceu, não as do modelo
 * de hoje.
 */
export function CurrentAnswers({ detail }: CurrentAnswersProps) {
  const initialEntryId = detail.entries[0]?.id;
  const questions = [...detail.version.questions].sort(
    (a, b) => a.position - b.position,
  );

  return (
    <dl className="space-y-4">
      {questions.map((question) => {
        const current = detail.current.find(
          (item) => item.questionId === question.id,
        );
        return (
          <div key={question.id}>
            <dt className="text-sm text-muted-foreground">
              {question.position}. {question.label}
            </dt>
            <dd className="mt-0.5 whitespace-pre-wrap">
              <EmptyValue>
                {current && formatAnswer(question, current.value)}
              </EmptyValue>
              {/* Respondida de novo num acompanhamento: mostra quando. */}
              {current && current.entryId !== initialEntryId && (
                <span className="ml-2 text-xs text-muted-foreground">
                  atualizada em {formatDateOnly(current.consultationDate)}
                </span>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

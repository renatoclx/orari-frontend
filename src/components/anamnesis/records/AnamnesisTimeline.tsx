import { CalendarClock } from "lucide-react";
import { formatAnswer } from "@/components/anamnesis/records/answer-format";
import { EmptyValue } from "@/components/shared/EmptyValue";
import { Badge } from "@/components/ui/badge";
import type { AnamnesisDetail } from "@/types/anamnesis";
import { formatDateOnly } from "@/utils/format";

type AnamnesisTimelineProps = {
  detail: AnamnesisDetail;
  /** Texto de cada agendamento vinculado (pelo id); nulo se não pôde ser lido. */
  appointments: Record<string, string | null>;
};

/** Histórico da ficha, do registro mais recente para o mais antigo. */
export function AnamnesisTimeline({
  detail,
  appointments,
}: AnamnesisTimelineProps) {
  const questions = new Map(
    detail.version.questions.map((question) => [question.id, question]),
  );
  const entries = [...detail.entries].reverse();

  return (
    <ol className="space-y-4">
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="rounded-control border border-border p-3 md:p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={entry.kind === "INITIAL" ? "secondary" : "default"}>
              {entry.kind === "INITIAL" ? "Inicial" : "Acompanhamento"}
            </Badge>
            <span className="font-medium tabular-nums">
              {formatDateOnly(entry.consultationDate)}
            </span>
            <span className="text-sm text-muted-foreground">
              por {entry.authorProfessional?.name ?? entry.authorUser.name}
            </span>
          </div>

          {entry.evolution && (
            <p className="mt-3 whitespace-pre-wrap">{entry.evolution}</p>
          )}
          {entry.appointmentId && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarClock className="size-4 shrink-0" aria-hidden="true" />
              {appointments[entry.appointmentId] ?? "Agendamento indisponível"}
            </p>
          )}

          {entry.answers.length > 0 && (
            <dl className="mt-3 space-y-2 border-t border-border pt-3">
              {entry.answers
                .flatMap((answer) => {
                  const question = questions.get(answer.questionId);
                  return question ? [{ answer, question }] : [];
                })
                // A API não garante a ordem das respostas: segue a das perguntas.
                .sort((a, b) => a.question.position - b.question.position)
                .map(({ answer, question }) => {
                  return (
                    <div key={answer.questionId}>
                      <dt className="text-sm text-muted-foreground">
                        {question.position}. {question.label}
                      </dt>
                      <dd className="whitespace-pre-wrap">
                        <EmptyValue>
                          {formatAnswer(question, answer.value)}
                        </EmptyValue>
                      </dd>
                    </div>
                  );
                })}
            </dl>
          )}
        </li>
      ))}
    </ol>
  );
}

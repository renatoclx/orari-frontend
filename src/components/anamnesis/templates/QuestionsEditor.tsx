"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { QuestionCard } from "@/components/anamnesis/templates/QuestionCard";
import {
  emptyQuestion,
  MAX_QUESTIONS,
  type QuestionDraft,
  type QuestionErrors,
} from "@/components/anamnesis/templates/template-validation";
import { Button } from "@/components/ui/button";

type QuestionsEditorProps = {
  value: QuestionDraft[];
  onChange: (questions: QuestionDraft[]) => void;
  /** Erro de cada pergunta, pela chave. */
  errors?: Record<string, QuestionErrors>;
  /** Erro da lista inteira (nenhuma pergunta). */
  listError?: string;
  newKey: () => string;
};

// Avisos do arrastar para leitores de tela, em português (o padrão do dnd-kit é inglês).
const instructions = {
  draggable:
    "Para reordenar, pressione espaço, mova com as setas e pressione espaço de novo para soltar. Esc cancela.",
};

/**
 * Lista de perguntas com reordenação por arrastar e soltar (dnd-kit). O envio
 * usa a ordem final da lista; a posição de cada pergunta é a numeração da ficha.
 */
export function QuestionsEditor({
  value,
  onChange,
  errors = {},
  listError,
  newKey,
}: QuestionsEditorProps) {
  const sensors = useSensors(
    // A distância mínima evita arrastar sem querer ao clicar na alça.
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const position = (id: string | number) =>
    value.findIndex((question) => question.key === id) + 1;

  const announcements: Announcements = {
    onDragStart: ({ active }) => `Pergunta ${position(active.id)} levantada.`,
    onDragOver: ({ active, over }) =>
      over
        ? `Pergunta ${position(active.id)} sobre a posição ${position(over.id)}.`
        : undefined,
    onDragEnd: ({ active, over }) =>
      `Pergunta ${position(active.id)} solta na posição ${position(over?.id ?? active.id)}.`,
    onDragCancel: ({ active }) =>
      `Reordenação cancelada. A pergunta ${position(active.id)} voltou ao lugar.`,
  };

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const from = value.findIndex((question) => question.key === active.id);
    const to = value.findIndex((question) => question.key === over.id);
    onChange(arrayMove(value, from, to));
  }

  function add() {
    const key = newKey();
    onChange([...value, emptyQuestion(key)]);
    // O campo novo só existe depois da renderização.
    requestAnimationFrame(() =>
      document.getElementById(`q-${key}-label`)?.focus(),
    );
  }

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        accessibility={{
          announcements,
          screenReaderInstructions: instructions,
        }}
      >
        <SortableContext
          items={value.map((question) => question.key)}
          strategy={verticalListSortingStrategy}
        >
          <ol className="space-y-3">
            {value.map((question, index) => (
              <QuestionCard
                key={question.key}
                question={question}
                position={index + 1}
                errors={errors[question.key]}
                newKey={newKey}
                onChange={(next) =>
                  onChange(
                    value.map((item) => (item.key === next.key ? next : item)),
                  )
                }
                onRemove={() =>
                  onChange(value.filter((item) => item.key !== question.key))
                }
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      {listError && (
        <p
          id="questions-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {listError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          id="add-question"
          type="button"
          variant="outline"
          disabled={value.length >= MAX_QUESTIONS}
          onClick={add}
        >
          <Plus aria-hidden="true" />
          Adicionar pergunta
        </Button>
        <span className="text-sm text-muted-foreground tabular-nums">
          {value.length} de {MAX_QUESTIONS} perguntas
        </span>
      </div>
    </div>
  );
}

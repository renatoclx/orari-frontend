"use client";

import { useState, useTransition } from "react";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import { saveAutoMessagesAction } from "@/app/(admin)/auto-message-actions";
import { AutoMessageSection } from "@/components/auto-messages/AutoMessageSection";
import {
  autoMessageErrors,
  autoMessagesHaveErrors,
  sameAutoMessages,
  type AutoMessageErrors,
} from "@/components/auto-messages/auto-messages";
import { FormFooter } from "@/components/shared/FormFooter";
import { Button } from "@/components/ui/button";
import type { AutoMessage, AutoMessageKind } from "@/types/auto-message";

type AutoMessagesFormProps = {
  messages: AutoMessage[];
  /** Sem a ação Edita no plano: só leitura. */
  editable: boolean;
  placeName: string;
  /** Aviso do topo (portal desligado, quem recebe). */
  notice: React.ReactNode;
};

/** As seis situações da tela Mensagens → Automáticas (screens/mensagens.md). */
export function AutoMessagesForm({
  messages,
  editable,
  placeName,
  notice,
}: AutoMessagesFormProps) {
  const [draft, setDraft] = useState(messages);
  // Os erros só aparecem depois da primeira tentativa de salvar.
  const [showErrors, setShowErrors] = useState(false);
  const [pending, startTransition] = useTransition();
  const changed = !sameAutoMessages(draft, messages);

  const errorsOf = (message: AutoMessage): AutoMessageErrors =>
    showErrors ? autoMessageErrors(message) : {};

  function change(kind: AutoMessageKind, patch: Partial<AutoMessage>) {
    setDraft((current) =>
      current.map((message) =>
        message.kind === kind ? { ...message, ...patch } : message,
      ),
    );
  }

  function discard() {
    setDraft(messages);
    setShowErrors(false);
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShowErrors(true);
    if (autoMessagesHaveErrors(draft)) {
      toast.error("Corrija os campos destacados.");
      return;
    }
    startTransition(async () => {
      const result = await saveAutoMessagesAction(draft);
      if (result.ok) toast.success("Mensagens automáticas salvas.");
      else
        toast.error("Não foi possível salvar as mensagens.", {
          description: result.message,
        });
    });
  }

  return (
    // O formulário é o card da página: o conteúdo rola e o rodapé fica fixo.
    <form
      noValidate
      onSubmit={submit}
      className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card"
    >
      <div className="min-h-0 flex-1 divide-y divide-border overflow-auto">
        <div className="p-4 md:p-6">{notice}</div>
        {draft.map((message) => (
          <AutoMessageSection
            key={message.kind}
            message={message}
            errors={errorsOf(message)}
            editable={editable}
            placeName={placeName}
            onChange={(patch) => change(message.kind, patch)}
          />
        ))}
      </div>

      {editable && (
        <FormFooter>
          <Button
            type="button"
            variant="outline"
            disabled={pending || !changed}
            onClick={discard}
          >
            <X aria-hidden="true" />
            Descartar alterações
          </Button>
          <Button type="submit" disabled={pending || !changed}>
            <Save aria-hidden="true" />
            {pending ? "Salvando…" : "Salvar alterações"}
          </Button>
        </FormFooter>
      )}
    </form>
  );
}

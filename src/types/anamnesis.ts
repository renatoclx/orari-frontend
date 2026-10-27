// Espelha as respostas de /anamnesis-templates do backend (modelos de ficha).

/** Tipos de pergunta (enum AnamnesisQuestionType). */
export type QuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "YES_NO"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "NUMBER"
  | "DATE"
  | "SCALE";

/** Pergunta de uma versão do modelo. A ordem é `position` (a partir de 1). */
export type TemplateQuestion = {
  id: string;
  position: number;
  label: string;
  helpText: string | null;
  type: QuestionType;
  isRequired: boolean;
  /** Só nas escolhas única e múltipla; vazio nos demais tipos. */
  options: string[];
  /** Texto pedido quando a resposta é "sim" (só em sim ou não). */
  detailLabel: string | null;
};

export type TemplateItem = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  /** Versão vigente: as fichas novas nascem presas a ela. */
  currentVersion: {
    id: string;
    version: number;
    questions: TemplateQuestion[];
  };
};

/** Pergunta no corpo de POST e PATCH: sem `id` nem `position` (vale a ordem da lista). */
export type TemplateQuestionInput = {
  label: string;
  type: QuestionType;
  isRequired: boolean;
  helpText?: string;
  options?: string[];
  detailLabel?: string;
};

/** Corpo de POST /anamnesis-templates. */
export type TemplateInput = {
  name: string;
  description?: string;
  questions: TemplateQuestionInput[];
};

/** Corpo de PATCH: só o que mudar. `questions` cria uma nova versão. */
export type TemplateUpdateInput = Partial<TemplateInput> & {
  isActive?: boolean;
};

// ---- Fichas dos clientes (GET /anamnesis?clientId=)

/** Ficha na listagem do cliente (resumo; o conteúdo vem em GET /anamnesis/:id). */
export type AnamnesisListItem = {
  id: string;
  createdAt: string;
  template: { id: string; name: string };
  /** Versão do modelo em que a ficha nasceu (não muda). */
  templateVersion: number;
  /** Todos os registros, o inicial incluído. */
  entriesCount: number;
  /** Data pura (`…T00:00:00.000Z`): exibir em UTC. */
  lastConsultationDate: string;
};

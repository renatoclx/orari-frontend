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

// ---- Fichas preenchidas (GET /anamnesis?clientId=)

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

// ---- Ficha completa (GET /anamnesis/:id)

/** Pergunta da ficha: a mesma forma do modelo, mas da versão em que a ficha nasceu. */
export type AnamnesisQuestion = TemplateQuestion;

/**
 * Valor guardado de uma resposta, que depende do tipo da pergunta (texto,
 * número, lista, `{ answer, detail? }` no sim ou não). Chega como `unknown`
 * e é interpretado por `formatAnswer`, conferindo o formato.
 */
export type AnswerValue = unknown;

export type AnamnesisAnswer = { questionId: string; value: AnswerValue };

export type AnamnesisEntry = {
  id: string;
  kind: "INITIAL" | "FOLLOW_UP";
  /** Data pura (`…T00:00:00.000Z`): exibir em UTC. */
  consultationDate: string;
  appointmentId: string | null;
  /** Texto do acompanhamento; nulo no registro inicial. */
  evolution: string | null;
  authorUser: { id: string; name: string };
  /** Nulo quando quem registrou não tem vínculo com profissional. */
  authorProfessional: { id: string; name: string } | null;
  createdAt: string;
  /** No registro inicial, todas as respostas; no acompanhamento, só as alteradas. */
  answers: AnamnesisAnswer[];
};

export type AnamnesisDetail = {
  id: string;
  createdAt: string;
  client: { id: string; name: string };
  template: { id: string; name: string };
  version: { id: string; version: number; questions: AnamnesisQuestion[] };
  /** Resposta mais recente de cada pergunta já respondida. */
  current: Array<
    AnamnesisAnswer & { entryId: string; consultationDate: string }
  >;
  /** Do registro inicial ao último acompanhamento. */
  entries: AnamnesisEntry[];
};

/** Corpo de POST /anamnesis/:id/entries (acompanhamento). */
export type EntryInput = {
  /** Obrigatória, até 10.000 caracteres. */
  evolution: string;
  /** "aaaa-mm-dd"; padrão hoje, nunca futura nem anterior ao registro inicial. */
  consultationDate?: string;
  /** Agendamento do mesmo cliente (opcional). */
  appointmentId?: string;
  /** Só as perguntas cuja resposta mudou. */
  answers?: AnamnesisAnswer[];
};

/** Corpo de POST /anamnesis (nova ficha, com o registro inicial). */
export type AnamnesisInput = {
  clientId: string;
  templateId: string;
  /** "aaaa-mm-dd"; padrão hoje, nunca futura. */
  consultationDate?: string;
  /** Pergunta opcional sem resposta fica de fora (nunca `null`). */
  answers: AnamnesisAnswer[];
};

/** Cliente com ficha na tela "Fichas preenchidas" (GET /anamnesis/clients). */
export type AnamnesisClientItem = {
  clientId: string;
  clientName: string;
  /** Cliente inativo continua com as fichas legíveis. */
  isActive: boolean;
  anamnesisCount: number;
};

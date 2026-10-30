/** Manual em PDF da tela de Ajuda; o arquivo fica em `public/manuais/`. */
export type Manual = {
  title: string;
  /** Uma linha sobre o que o manual cobre. */
  description: string;
  /** Caminho público do PDF. */
  file: string;
};

// Os PDFs são gerados em docs/manual-usuario (README) e copiados para
// public/manuais. Um manual novo é uma linha aqui. Por enquanto, só o ADMIN
// acessa a tela.
export const MANUALS: Manual[] = [
  {
    title: "Manual do administrador",
    description:
      "Primeiros passos, agenda, pessoas, serviços, recorrências, pacotes e financeiro.",
    file: "/manuais/manual-administrador.pdf",
  },
  {
    title: "Manual da Anamnese",
    description:
      "Modelos de ficha, primeira ficha, acompanhamentos, impressão e auditoria.",
    file: "/manuais/manual-anamnese.pdf",
  },
  {
    title: "Manual de Turmas",
    description:
      "Cadastro de turmas, alunos, vagas na agenda, cancelamentos e reposições.",
    file: "/manuais/manual-turmas.pdf",
  },
];

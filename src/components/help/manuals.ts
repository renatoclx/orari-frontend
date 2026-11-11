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
      "Primeiros passos, agenda, pessoas, serviços, recorrências, pacotes, comandas e contas a receber.",
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
  {
    title: "Manual do Portal do cliente",
    description:
      "Ligar o portal, regras, busca no app, link de acesso e confirmar clientes.",
    file: "/manuais/manual-portal.pdf",
  },
  {
    title: "Manual do app do cliente",
    description:
      "Para enviar aos clientes: instalar, entrar, agendar, cancelar e ativar os avisos.",
    file: "/manuais/manual-app.pdf",
  },
  {
    title: "Manual de Mensagens",
    description:
      "Mensagens automáticas, os dados do cliente no texto e o envio a todos.",
    file: "/manuais/manual-mensagens.pdf",
  },
  {
    title: "Manual de Relatórios e Dashboard",
    description:
      "O Dashboard e os sete relatórios: o que cada número quer dizer, filtros e impressão.",
    file: "/manuais/manual-relatorios.pdf",
  },
  {
    title: "Manual de Comissões",
    description:
      "Comissão no serviço, acompanhamento, adiantamentos, fechamento e recibo.",
    file: "/manuais/manual-comissoes.pdf",
  },
  {
    title: "Manual de Contas a pagar",
    description:
      "Fornecedores, categorias, contas parceladas ou repetidas, pagamento e comissões.",
    file: "/manuais/manual-contas-a-pagar.pdf",
  },
];

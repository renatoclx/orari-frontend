import type { Metadata } from "next";
import {
  LegalDocument,
  type LegalSection,
} from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Termos de uso | Orari",
};

// RASCUNHO (2026-11-17) para revisão do responsável, de preferência com um
// advogado. Os trechos [A DEFINIR] dependem de dados da empresa e de decisões.
const SECTIONS: LegalSection[] = [
  {
    title: "Quem somos e o que é o Orari",
    body: [
      'O Orari é um sistema on-line de agendamento e gestão para negócios que atendem com hora marcada (estética, barbearia, pilates, clínicas e afins), mantido por [A DEFINIR: razão social e CNPJ], aqui chamado de "Orari".',
      'Estes termos valem para a empresa que contrata o Orari ("cliente") e para as pessoas que ela cadastra como usuárias. Ao criar a conta, quem se cadastra declara ter poderes para aceitar estes termos em nome do negócio.',
    ],
  },
  {
    title: "Cadastro e acesso",
    body: [
      "O cliente informa dados verdadeiros (nome do negócio, CPF ou CNPJ, nome, e-mail e celular) e os mantém atualizados.",
      "Cada usuário é responsável por guardar a própria senha. Acessos feitos com a senha de um usuário são considerados feitos por ele.",
      "O Orari pode suspender contas com indícios de fraude, uso abusivo ou violação destes termos.",
    ],
  },
  {
    title: "Teste grátis",
    body: [
      "Toda conta nova tem 7 dias de teste grátis, sem cartão, com as funções do plano escolhido.",
      "Ao fim do teste, sem contratação, a conta fica somente para consulta: os dados continuam disponíveis para leitura, mas não é possível cadastrar ou alterar nada, e o agendamento pelo app do cliente fica indisponível.",
    ],
  },
  {
    title: "Planos, pagamento e atraso",
    body: [
      "Os planos, valores e o que cada um inclui estão publicados no site do Orari. O valor contratado fica registrado na assinatura e não muda com reajustes da tabela durante o ciclo pago.",
      "A cobrança pode ser mensal, semestral ou anual, paga antecipadamente pelos meios informados pelo Orari.",
      "Depois do vencimento, há 5 dias de tolerância com o sistema funcionando normalmente. Passado esse prazo sem pagamento, a conta fica somente para consulta até a regularização.",
      "Ofertas e descontos de lançamento valem pelo prazo e nas condições anunciados.",
    ],
  },
  {
    title: "Cancelamento",
    body: [
      "O cliente pode cancelar quando quiser, pelo contato do Orari. O acesso continua até o fim do período já pago; não há devolução proporcional de período em uso, salvo exigência legal.",
      "Depois do cancelamento, os dados ficam disponíveis para consulta e exportação por [A DEFINIR: prazo, ex.: 60 dias] e então são excluídos, exceto o que a lei exigir guardar.",
    ],
  },
  {
    title: "Uso permitido",
    body: [
      "O Orari só pode ser usado para a gestão do próprio negócio do cliente, de acordo com a lei. Não é permitido:",
      "- enviar mensagens indesejadas (spam) ou conteúdo ilegal pelo sistema;",
      "- tentar acessar dados de outros clientes ou burlar limites e travas do sistema;",
      "- revender ou sublicenciar o acesso sem autorização.",
    ],
  },
  {
    title: "Dados dos clientes do negócio",
    body: [
      "Os dados que o cliente cadastra sobre os próprios clientes (inclusive fichas de anamnese, que são dados de saúde) pertencem ao cliente, que é o controlador desses dados pela LGPD. O Orari os trata como operador, só para prestar o serviço, conforme a Política de Privacidade.",
      "O cliente é responsável por ter base legal para cadastrar esses dados e por atender aos pedidos dos titulares.",
    ],
  },
  {
    title: "Disponibilidade e responsabilidade",
    body: [
      "O Orari se esforça para manter o sistema disponível e faz cópias de segurança diárias, mas pode haver interrupções para manutenção ou por falhas de terceiros (internet, hospedagem).",
      "O Orari não responde por decisões do negócio tomadas com base nas informações do sistema, nem por prejuízos indiretos. Em qualquer caso, a responsabilidade fica limitada ao valor pago nos últimos 12 meses.",
    ],
  },
  {
    title: "Mudanças nestes termos",
    body: [
      "Estes termos podem mudar. Mudanças relevantes são avisadas com antecedência dentro do sistema ou por e-mail. Continuar usando o Orari depois da mudança significa aceitar a nova versão.",
    ],
  },
  {
    title: "Foro e contato",
    body: [
      "Fica eleito o foro de [A DEFINIR: cidade/UF] para resolver questões destes termos, salvo regra legal diferente para o consumidor.",
      "Contato: [A DEFINIR: e-mail e WhatsApp do Orari].",
    ],
  },
];

/** Termos de uso (rascunho): público, linkado no cadastro. */
export default function TermsPage() {
  return (
    <LegalDocument
      title="Termos de uso do Orari"
      updatedAt="17 de novembro de 2026"
      draft
      sections={SECTIONS}
    />
  );
}

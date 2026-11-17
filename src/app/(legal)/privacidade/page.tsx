import type { Metadata } from "next";
import {
  LegalDocument,
  type LegalSection,
} from "@/components/legal/LegalDocument";

export const metadata: Metadata = {
  title: "Política de privacidade | Orari",
};

// RASCUNHO (2026-11-17), baseado na LGPD (Lei 13.709/2018), para revisão do
// responsável, de preferência com um advogado. [A DEFINIR] = dado pendente.
const SECTIONS: LegalSection[] = [
  {
    title: "Quem trata os dados",
    body: [
      "O Orari ([A DEFINIR: razão social e CNPJ]) trata dados pessoais de dois jeitos:",
      "- como controlador, dos dados de quem contrata e usa o sistema (o negócio e seus usuários);",
      "- como operador, dos dados que cada negócio cadastra sobre os próprios clientes, seguindo as instruções do negócio, que é o controlador desses dados.",
    ],
  },
  {
    title: "Que dados coletamos",
    body: [
      "- Do cadastro: nome do negócio, CPF ou CNPJ, nome, e-mail, celular e senha (guardada só como hash, nunca em texto).",
      "- Do uso: registros de acesso (data, hora e IP), exigidos pelo Marco Civil da Internet, e registros de auditoria de ações sensíveis.",
      "- Dados que o negócio cadastra: clientes, agendamentos, pagamentos e, quando o negócio usa, fichas de anamnese (dados de saúde, sensíveis pela LGPD).",
      "- Do app do cliente: nome, celular e o que o cliente informa ao agendar.",
    ],
  },
  {
    title: "Para que usamos",
    body: [
      "- Prestar o serviço contratado (agenda, cadastros, financeiro, mensagens e avisos).",
      "- Cobrança e comunicação sobre a conta (teste, vencimentos, avisos importantes).",
      "- Segurança: evitar fraudes, acessos indevidos e abusos.",
      "- Cumprir obrigações legais.",
      "Não vendemos dados pessoais e não os usamos para publicidade de terceiros.",
    ],
  },
  {
    title: "Bases legais",
    body: [
      "Execução do contrato (prestar o serviço), cumprimento de obrigação legal (registros de acesso, dados fiscais), legítimo interesse (segurança e melhoria do serviço) e, nos dados de saúde, a tutela da saúde ou o consentimento obtido pelo negócio, que é quem responde por essa coleta.",
    ],
  },
  {
    title: "Com quem compartilhamos",
    body: [
      "Só com fornecedores necessários para o serviço funcionar, que tratam os dados em nosso nome: hospedagem dos servidores ([A DEFINIR: provedor, ex.: KingHost]), envio de avisos no celular (serviços de notificação do navegador) e, quando houver, meios de pagamento e envio de mensagens.",
      "Também quando a lei ou uma ordem judicial exigir.",
    ],
  },
  {
    title: "Segurança",
    body: [
      "Conexão protegida (HTTPS), senhas com hash, acesso aos dados limitado por empresa e por perfil, fichas de anamnese criptografadas, registro de quem acessa dados de saúde e cópias de segurança diárias.",
    ],
  },
  {
    title: "Por quanto tempo guardamos",
    body: [
      "Enquanto a conta estiver ativa. Depois do cancelamento, por [A DEFINIR: prazo, ex.: 60 dias] para consulta e exportação, e então excluímos, exceto o que a lei exige guardar (como registros de acesso, por 6 meses, e dados fiscais, pelo prazo legal).",
    ],
  },
  {
    title: "Seus direitos",
    body: [
      "Você pode pedir confirmação de que tratamos seus dados, acesso, correção, portabilidade, anonimização ou exclusão (quando cabível) e informações sobre compartilhamento, pelo contato abaixo.",
      "Se você é cliente de um negócio que usa o Orari, fale primeiro com o próprio negócio: ele é o controlador dos seus dados. Podemos ajudá-lo a atender o pedido.",
    ],
  },
  {
    title: "Cookies",
    body: [
      "No sistema usamos só cookies necessários: os da sessão (para manter você conectado) e preferências como o tema e o menu recolhido. O site institucional tem a própria política de cookies.",
    ],
  },
  {
    title: "Contato e encarregado",
    body: [
      "Encarregado de dados (DPO): [A DEFINIR: nome e e-mail].",
      "Esta política pode mudar; mudanças relevantes são avisadas no sistema.",
    ],
  },
];

/** Política de privacidade (rascunho): pública, linkada no cadastro. */
export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Política de privacidade do Orari"
      updatedAt="17 de novembro de 2026"
      draft
      sections={SECTIONS}
    />
  );
}

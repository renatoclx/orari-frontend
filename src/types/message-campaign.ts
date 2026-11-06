// Espelham /message-campaigns do backend (Mensagens → Enviar; screens/mensagens.md).

export type CampaignAudience = {
  /** Clientes ativos com conta no app. */
  clients: number;
  /** Desses, quantos desligaram as novidades e promoções (não recebem). */
  promotionsOff: number;
  /** Ainda não houve envio hoje (uma por dia). */
  canSendToday: boolean;
};

export type MessageCampaign = {
  id: string;
  title: string;
  body: string;
  /** Quantos receberam na caixa de Avisos. */
  recipients: number;
  createdAt: string;
  createdBy: { name: string };
};

export type MessageCampaignPage = {
  items: MessageCampaign[];
  total: number;
  page: number;
  limit: number;
};

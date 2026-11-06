import "server-only";

import { apiFetch } from "@/services/api";
import type {
  CampaignAudience,
  MessageCampaign,
  MessageCampaignPage,
} from "@/types/message-campaign";

// Mensagens → Enviar (backend: /message-campaigns; screens/mensagens.md).

export function getCampaignAudience(): Promise<CampaignAudience> {
  return apiFetch<CampaignAudience>("/message-campaigns/audience");
}

export function listCampaigns(limit = 20): Promise<MessageCampaignPage> {
  return apiFetch<MessageCampaignPage>(`/message-campaigns?limit=${limit}`);
}

/** Envia a todos os clientes com o app; devolve quantos receberam. */
export function sendCampaign(data: {
  title: string;
  body: string;
}): Promise<Omit<MessageCampaign, "createdBy">> {
  return apiFetch("/message-campaigns", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

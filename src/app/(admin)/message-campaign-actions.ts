"use server";

import { revalidatePath } from "next/cache";
import { campaignErrors } from "@/components/auto-messages/campaign";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { sendCampaign } from "@/services/message-campaign.service";

/**
 * Envia a mensagem da clínica a todos os clientes com o app
 * (screens/mensagens.md). Confere de novo o que o formulário já conferiu.
 */
export async function sendCampaignAction(fields: {
  title: string;
  body: string;
}): Promise<{ ok: true; recipients: number } | ActionFailure> {
  const errors = campaignErrors(fields);
  if (errors.title || errors.body) {
    return { ok: false, message: "Corrija os campos destacados." };
  }
  try {
    const { recipients } = await sendCampaign({
      title: fields.title.trim(),
      body: fields.body.trim(),
    });
    revalidatePath("/mensagens/enviar");
    return { ok: true, recipients };
  } catch (error) {
    return failureFrom(error);
  }
}

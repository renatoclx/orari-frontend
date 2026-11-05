// Regras puras do link de acesso ao portal (screens/pessoas.md, "Acesso ao portal").

/** Mensagem pronta para a clínica enviar pelo WhatsApp dela. */
export function accessMessage(
  clientName: string,
  companyName: string,
  url: string,
): string {
  const firstName = clientName.trim().split(/\s+/)[0] ?? clientName;
  return (
    `Olá, ${firstName}! Este é o seu acesso ao portal da ${companyName}, ` +
    `para ver seus horários e agendar: ${url}\n` +
    "O link vale por 24 horas e só pode ser usado uma vez. Depois de entrar, " +
    "adicione o portal à tela inicial do celular."
  );
}

/**
 * Link do WhatsApp (wa.me) que abre a conversa com o cliente e a mensagem
 * pronta, no app da própria clínica. O telefone vai com o código do Brasil.
 * Sem telefone válido, abre só a mensagem (a clínica escolhe o contato).
 */
export function whatsAppLink(
  phone: string | null | undefined,
  message: string,
): string {
  const digits = (phone ?? "").replace(/\D/g, "");
  const number = /^\d{10,11}$/.test(digits) ? `55${digits}` : "";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Mensagem para o profissional quando a geração do PDF falha. 401 e 403 têm
 * texto próprio; nos demais, vale o texto da API (já em português).
 */
export function pdfErrorMessage(status: number, apiMessage?: string): string {
  if (status === 401) return "Sua sessão expirou. Entre novamente.";
  if (status === 403) return "Você não tem acesso às fichas de anamnese.";
  if (status === 404) return "Ficha não encontrada.";
  return apiMessage || "Não foi possível gerar o PDF. Tente novamente.";
}

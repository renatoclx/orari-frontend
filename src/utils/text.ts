/** Texto sem acentos e em minúsculas, para comparar e filtrar nomes. */
export function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

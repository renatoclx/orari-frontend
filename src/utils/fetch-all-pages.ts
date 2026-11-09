import type { Paginated } from "@/types/api";

// Máximo da API por página.
export const MAX_PAGE_SIZE = 100;
// Trava de segurança: 50 páginas de 100 já passam de qualquer relatório real.
const MAX_PAGES = 50;

/**
 * Junta todas as páginas de uma listagem (versões de impressão, que mostram a
 * lista inteira). `load` recebe a página e o tamanho máximo.
 */
export async function fetchAllPages<T>(
  load: (page: number, limit: number) => Promise<Paginated<T>>,
): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const result = await load(page, MAX_PAGE_SIZE);
    items.push(...result.items);
    if (items.length >= result.total || result.items.length === 0) break;
  }
  return items;
}

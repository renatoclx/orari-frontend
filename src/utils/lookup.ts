import type { Paginated } from "@/types/api";
import type { CurrentUser } from "@/types/auth";
import { canAccess } from "@/utils/access";

/**
 * Lista de apoio de OUTRA funcionalidade (ex.: fornecedores numa tela de
 * contas a pagar). Se a empresa não a tem, vem vazia: a API recusaria a busca
 * (403) e a tela inteira cairia em erro de servidor.
 */
export function lookupIfAllowed<T>(
  access: CurrentUser["access"] | undefined,
  feature: string,
  load: () => Promise<Paginated<T>>,
): Promise<Paginated<T>> {
  return canAccess(access, feature)
    ? load()
    : Promise.resolve({ items: [], total: 0, page: 1, limit: 0 });
}

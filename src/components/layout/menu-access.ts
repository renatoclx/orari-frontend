import type { CurrentUser } from "@/types/auth";
import { canAccess } from "@/utils/access";

type Gated = { feature?: string };
type Group = { children: Gated[] };

/**
 * Tira do menu o que a empresa não tem liberado (Visualiza). Item sem
 * `feature` (ex.: Ajuda) sempre fica; grupo sem nenhum subitem visível some.
 */
export function filterMenuByAccess<T extends Gated | Group>(
  entries: T[],
  access: CurrentUser["access"] | undefined,
): T[] {
  return entries
    .map((entry) => {
      if (!("children" in entry)) return entry;
      return {
        ...entry,
        children: entry.children.filter(
          (child) => !child.feature || canAccess(access, child.feature),
        ),
      };
    })
    .filter((entry) => {
      if ("children" in entry) return entry.children.length > 0;
      return !entry.feature || canAccess(access, entry.feature);
    });
}

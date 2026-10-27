import "server-only";

import { apiFetch } from "@/services/api";
import type { Paginated } from "@/types/api";
import type {
  TemplateInput,
  TemplateItem,
  TemplateUpdateInput,
} from "@/types/anamnesis";

type ListTemplatesParams = {
  /** Busca parcial pelo nome, sem diferenciar acentos nem maiúsculas. */
  name?: string;
  isActive?: boolean;
  page: number;
  limit: number;
};

/** Modelos ativos e inativos (o status vem de `isActive`). */
export function listTemplates(
  params: ListTemplatesParams,
): Promise<Paginated<TemplateItem>> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });
  const name = params.name?.trim();
  if (name) query.set("name", name);
  if (params.isActive !== undefined) {
    query.set("isActive", String(params.isActive));
  }
  return apiFetch<Paginated<TemplateItem>>(`/anamnesis-templates?${query}`);
}

export function getTemplate(id: string): Promise<TemplateItem> {
  return apiFetch<TemplateItem>(
    `/anamnesis-templates/${encodeURIComponent(id)}`,
  );
}

/** Cadastro; nome repetido na empresa responde 409. */
export function createTemplate(input: TemplateInput): Promise<TemplateItem> {
  return apiFetch<TemplateItem>("/anamnesis-templates", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** Alteração parcial. Enviar `questions` cria uma nova versão do modelo. */
export function updateTemplate(
  id: string,
  input: TemplateUpdateInput,
): Promise<TemplateItem> {
  return apiFetch<TemplateItem>(
    `/anamnesis-templates/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

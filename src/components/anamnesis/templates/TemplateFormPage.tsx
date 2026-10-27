import { notFound } from "next/navigation";
import { TemplateForm } from "@/components/anamnesis/templates/TemplateForm";
import { requireAnamnesisAdmin } from "@/lib/anamnesis-guard";
import { ApiError } from "@/services/api";
import { getTemplate } from "@/services/anamnesis-template.service";

type TemplateFormPageProps = {
  /** Na alteração, o modelo; sem ele, é o cadastro. */
  id?: string;
};

// Cadastro e alteração de modelo (só ADMIN): na alteração, busca o modelo com as
// perguntas da versão vigente e entrega ao formulário.
export async function TemplateFormPage({ id }: TemplateFormPageProps) {
  await requireAnamnesisAdmin();
  const template = id
    ? await getTemplate(id).catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 404) notFound();
        throw error;
      })
    : undefined;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {template ? "Alterar modelo de ficha" : "Novo modelo de ficha"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {template
            ? `Atualize ${template.name}. Alterar as perguntas vale para as próximas fichas; as já preenchidas não mudam.`
            : "Monte as perguntas da ficha. Você pode arrastar para mudar a ordem."}
        </p>
      </div>

      <TemplateForm template={template} />
    </div>
  );
}

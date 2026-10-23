"use server";

import { revalidatePath } from "next/cache";
import {
  validateCompanyForm,
  type CompanyFormErrors,
  type CompanyFormValues,
} from "@/components/companies/company-validation";
import { failureFrom, type ActionFailure } from "@/lib/action-result";
import { getCurrentUser } from "@/services/auth.service";
import { createCompany, updateCompany } from "@/services/company.service";
import { normalizeDocument } from "@/utils/document";

// Gestão de empresas pelo SUPER_ADMIN (screens/empresas.md). As ações da própria
// empresa (nome fantasia, logo e horários) ficam em company-actions.ts.

/** Campo do formulário a que um erro pode se referir. */
export type CompanyField = keyof CompanyFormValues;

/** `created`: a empresa que o cadastro acabou de criar (a lista abre o cadastro do administrador). */
export type CompanyActionResult =
  | { ok: true; created?: { id: string; name: string } }
  | ActionFailure<CompanyField>;

const PATH = "/empresas";

// Primeiro erro da validação, no formato de falha da action (vai para o campo).
function firstError(
  errors: CompanyFormErrors,
): ActionFailure<CompanyField> | null {
  const field = (Object.keys(errors) as CompanyField[])[0];
  return field ? { ok: false, message: errors[field] ?? "", field } : null;
}

// A API recusa o acesso a quem não é SUPER_ADMIN; conferir aqui evita chamá-la.
async function ensureSuperAdmin(): Promise<ActionFailure<CompanyField> | null> {
  const { type } = await getCurrentUser();
  return type === "SUPER_ADMIN"
    ? null
    : { ok: false, message: "Só o super administrador gerencia empresas." };
}

// Campos opcionais vazios não vão no cadastro; na alteração, `null` os remove.
function toCreateInput(values: CompanyFormValues) {
  const document = normalizeDocument(values.document);
  const fantasyName = values.fantasyName.trim();
  return {
    corporateReason: values.corporateReason.trim(),
    ...(fantasyName && { fantasyName }),
    document,
    // CPF não tem data de fundação.
    ...(values.foundationDate &&
      document.length === 14 && { foundationDate: values.foundationDate }),
    subdomain: values.subdomain,
    timezone: values.timezone,
  };
}

/** Cadastro: documento ou subdomínio repetido (409) volta como erro do formulário. */
export async function createCompanyAction(
  values: CompanyFormValues,
): Promise<CompanyActionResult> {
  const denied = await ensureSuperAdmin();
  if (denied) return denied;
  const invalid = firstError(validateCompanyForm(values));
  if (invalid) return invalid;

  try {
    const company = await createCompany(toCreateInput(values));
    revalidatePath(PATH);
    return {
      ok: true,
      created: {
        id: company.id,
        name: company.fantasyName ?? company.corporateReason,
      },
    };
  } catch (error) {
    // A API não diz qual dos dois repetiu: a mensagem vai no formulário.
    return failureFrom(error, "document" as const);
  }
}

/** Alteração dos dados cadastrais. */
export async function updateCompanyAction(
  id: string,
  values: CompanyFormValues,
): Promise<CompanyActionResult> {
  const denied = await ensureSuperAdmin();
  if (denied) return denied;
  const invalid = firstError(validateCompanyForm(values));
  if (invalid) return invalid;

  const input = toCreateInput(values);
  try {
    await updateCompany(id, {
      ...input,
      // Vazio remove o opcional (o cadastro simplesmente não o envia).
      fantasyName: input.fantasyName ?? null,
      foundationDate: input.foundationDate ?? null,
    });
  } catch (error) {
    return failureFrom(error, "document" as const);
  }
  // O nome da própria empresa aparece no header de todas as telas.
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Inativação e reativação (a API não exclui empresas). */
export async function setCompanyActiveAction(
  id: string,
  isActive: boolean,
): Promise<CompanyActionResult> {
  const denied = await ensureSuperAdmin();
  if (denied) return denied;

  try {
    await updateCompany(id, { isActive });
  } catch (error) {
    return failureFrom(error);
  }
  revalidatePath(PATH);
  return { ok: true };
}

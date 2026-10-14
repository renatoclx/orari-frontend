import "server-only";

export type CepAddress = {
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  /** Sigla do estado (UF), ex.: "SP". */
  stateAcronym: string;
};

export type CepLookup =
  | { status: "found"; address: CepAddress }
  | { status: "not-found" }
  | { status: "unavailable" };

// ViaCEP: API pública e gratuita de consulta de CEP, sem chave.
const VIACEP_URL = "https://viacep.com.br/ws";

type ViaCepResponse = {
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean | string;
};

/**
 * Busca os dados de um CEP (8 dígitos, sem máscara). Campos que a API não
 * conhece vêm vazios (ex.: o CEP geral de uma cidade não tem rua).
 */
export async function lookupCep(cep: string): Promise<CepLookup> {
  if (!/^\d{8}$/.test(cep)) return { status: "not-found" };

  try {
    const response = await fetch(`${VIACEP_URL}/${cep}/json/`, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return { status: "unavailable" };

    const data = (await response.json()) as ViaCepResponse;
    if (data.erro) return { status: "not-found" };

    return {
      status: "found",
      address: {
        street: data.logradouro?.trim() ?? "",
        complement: data.complemento?.trim() ?? "",
        neighborhood: data.bairro?.trim() ?? "",
        city: data.localidade?.trim() ?? "",
        stateAcronym: data.uf?.trim().toUpperCase() ?? "",
      },
    };
  } catch {
    return { status: "unavailable" };
  }
}

/** Campos validados no cliente e de novo no servidor (preço em centavos). */
export type ServiceFormValues = {
  name: string;
  /** Minutos, só dígitos. */
  duration: string;
  /** Centavos, só dígitos (vazio = sem preço). */
  price: string;
};

/** Campos que podem ter erro: os do formulário e a comissão (só o ADMIN). */
export type ServiceErrorField = keyof ServiceFormValues | "commission";

export type ServiceFormErrors = Partial<Record<ServiceErrorField, string>>;

// Ordem em que os campos aparecem: o foco vai para o primeiro inválido.
export const serviceFieldOrder: ServiceErrorField[] = [
  "name",
  "duration",
  "price",
  "commission",
];

// Decimal(10,2) do banco: até 99.999.999,99, ou 9.999.999.999 centavos.
const MAX_PRICE_CENTS = 9_999_999_999;

/** Obrigatórios (screens/servicos.md): nome e duração. O preço é opcional. */
export function validateServiceForm(
  values: ServiceFormValues,
): ServiceFormErrors {
  const errors: ServiceFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Informe o nome.";
  }

  if (!values.duration || Number(values.duration) < 1) {
    errors.duration = "Informe a duração em minutos.";
  }

  if (values.price && Number(values.price) > MAX_PRICE_CENTS) {
    errors.price = "Informe um preço menor.";
  }

  return errors;
}

/** A comissão como o formulário a envia (só para o ADMIN). */
export type CommissionFormValues = {
  /** "" (sem comissão), "PERCENT" ou "FIXED". */
  type: string;
  /** Percentual digitado (aceita vírgula), quando PERCENT. */
  percent: string;
  /** Centavos, só dígitos, quando FIXED. */
  cents: string;
};

/**
 * Lê e confere a comissão (mesma regra da API): percentual de 0,01 a 100 com
 * até 2 casas; valor fixo maior que zero. Sem tipo, tira a comissão.
 */
export function parseCommission(
  values: CommissionFormValues,
):
  | {
      ok: true;
      commissionType: "PERCENT" | "FIXED" | null;
      commissionValue: number | null;
    }
  | { ok: false; error: string } {
  if (values.type === "PERCENT") {
    const text = values.percent.trim().replace(",", ".");
    const value = Number(text);
    if (!text || !/^\d+(\.\d{1,2})?$/.test(text) || value <= 0 || value > 100) {
      return { ok: false, error: "Informe um percentual de 0,01 a 100." };
    }
    return { ok: true, commissionType: "PERCENT", commissionValue: value };
  }
  if (values.type === "FIXED") {
    const cents = Number(values.cents);
    if (!values.cents || cents <= 0) {
      return { ok: false, error: "Informe o valor da comissão." };
    }
    if (cents > MAX_PRICE_CENTS) {
      return { ok: false, error: "Informe um valor menor." };
    }
    return { ok: true, commissionType: "FIXED", commissionValue: cents / 100 };
  }
  return { ok: true, commissionType: null, commissionValue: null };
}

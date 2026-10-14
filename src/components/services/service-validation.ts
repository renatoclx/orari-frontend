export type ServiceFormValues = {
  name: string;
  /** Minutos, só dígitos. */
  duration: string;
  /** Centavos, só dígitos (vazio = sem preço). */
  price: string;
};

export type ServiceFormErrors = Partial<
  Record<keyof ServiceFormValues, string>
>;

// Ordem em que os campos aparecem: o foco vai para o primeiro inválido.
export const serviceFieldOrder: (keyof ServiceFormValues)[] = [
  "name",
  "duration",
  "price",
];

// Decimal(10,2) do banco: até 99.999.999,99, ou 9.999.999.999 centavos.
const MAX_PRICE_CENTS = 9_999_999_999;

/** Obrigatórios (screens.md): nome e duração. O preço é opcional. */
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

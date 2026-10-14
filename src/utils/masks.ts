// Máscaras de exibição. Os valores são enviados à API sem máscara (apenas
// dígitos), então cada máscara aceita qualquer texto e devolve o formatado.

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** "11987654321" → "(11) 98765-4321"; "1133224455" → "(11) 3322-4455" */
export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  const area = digits.slice(0, 2);
  const rest = digits.slice(2);
  // Celular tem 9 dígitos depois do DDD; fixo, 8.
  const split = rest.length > 8 ? 5 : 4;
  if (rest.length <= split) return `(${area}) ${rest}`;
  return `(${area}) ${rest.slice(0, split)}-${rest.slice(split)}`;
}

/** "12345678909" → "123.456.789-09" */
export function maskCpf(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

/** "17500000" → "17500-000" */
export function maskCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
}

/** "5000" (centavos) → "R$ 50,00"; "123456" → "R$ 1.234,56"; "" → "" */
export function maskCurrency(value: string): string {
  // Até 10 dígitos: o campo do banco é Decimal(10,2).
  const digits = onlyDigits(value).slice(0, 10).replace(/^0+/, "");
  if (!digits) return "";

  const padded = digits.padStart(3, "0");
  const integer = padded.slice(0, -2).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `R$ ${integer},${padded.slice(-2)}`;
}

/** Número inteiro de minutos, até 4 dígitos, sem zeros à esquerda. */
export function maskMinutes(value: string): string {
  return onlyDigits(value).slice(0, 4).replace(/^0+/, "");
}

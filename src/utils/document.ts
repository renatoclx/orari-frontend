// CPF e CNPJ como o backend os valida (document.validator.ts): o mesmo cálculo,
// para o formulário avisar antes de enviar. Quem decide de verdade é a API.

/** Tira máscara e espaços e passa para maiúsculas ("12.abc.345/0001-DE" → "12ABC3450001DE"). */
export function normalizeDocument(value: string): string {
  return value.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
}

// Cada caractere vale `código - 48`: os dígitos valem o próprio número e as
// letras do CNPJ alfanumérico, A=17 … Z=42.
function checkDigit(
  chars: string,
  weights: number[],
  toDigit: (rest: number) => number,
): number {
  const sum = weights.reduce(
    (total, weight, index) => total + (chars.charCodeAt(index) - 48) * weight,
    0,
  );
  return toDigit(sum % 11);
}

// 11111111111 passa no cálculo, mas não é um documento.
const isRepeatedSequence = (value: string) => /^(.)\1+$/.test(value);

/** CPF: 11 dígitos, sem máscara, com os dois dígitos verificadores corretos. */
export function isValidCpf(value: string): boolean {
  if (!/^\d{11}$/.test(value) || isRepeatedSequence(value)) return false;

  const toDigit = (rest: number) => ((rest * 10) % 11) % 10;
  const weights = (start: number) =>
    Array.from({ length: start - 1 }, (_, index) => start - index);

  const first = checkDigit(value.slice(0, 9), weights(10), toDigit);
  const second = checkDigit(value.slice(0, 10), weights(11), toDigit);
  return value.endsWith(`${first}${second}`);
}

const CNPJ_FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_SECOND_WEIGHTS = [6, ...CNPJ_FIRST_WEIGHTS];

/**
 * CNPJ: 14 caracteres, sem máscara, em maiúsculas. Numérico ou alfanumérico (12
 * caracteres [0-9A-Z] e 2 dígitos verificadores numéricos).
 */
export function isValidCnpj(value: string): boolean {
  if (!/^[0-9A-Z]{12}\d{2}$/.test(value) || isRepeatedSequence(value)) {
    return false;
  }

  const toDigit = (rest: number) => (rest < 2 ? 0 : 11 - rest);
  const first = checkDigit(value.slice(0, 12), CNPJ_FIRST_WEIGHTS, toDigit);
  const second = checkDigit(value.slice(0, 13), CNPJ_SECOND_WEIGHTS, toDigit);
  return value.endsWith(`${first}${second}`);
}

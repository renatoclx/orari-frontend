// Máscaras de exibição. Os valores são enviados à API sem máscara (apenas
// dígitos), então cada máscara aceita qualquer texto e devolve o formatado.

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Campo que aceita telefone ou e-mail: enquanto só houver números e símbolos de
 * telefone, aplica a máscara; com letra ou "@", deixa o texto como está.
 */
export function maskPhoneOrEmail(value: string): string {
  return /^[\d\s()+\-.]*$/.test(value) ? maskPhone(value) : value;
}

/**
 * Só os dígitos do telefone brasileiro, a partir do DDD: tira o código do país
 * (55) de quem cola ou preenche "+55 31 99000-1111". Um número brasileiro tem no
 * máximo 11 dígitos; com 12 ou 13 e começando em 55, o 55 é o país (o DDD 55
 * também existe, mas "55" + DDD + número sempre passa de 11). Com o "+" no
 * início, o 55 sai de qualquer jeito.
 */
export function phoneDigits(value: string): string {
  const digits = onlyDigits(value);
  const explicit = value.trim().startsWith("+");
  if (digits.startsWith("55") && (explicit || digits.length >= 12)) {
    return digits.slice(2);
  }
  return digits;
}

/** "11987654321" → "(11) 98765-4321"; "1133224455" → "(11) 3322-4455" */
export function maskPhone(value: string): string {
  const digits = phoneDigits(value).slice(0, 11);
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

/**
 * CPF até 11 dígitos; com mais, CNPJ (fornecedor):
 * "11222333000181" → "11.222.333/0001-81".
 */
export function maskCpfOrCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length <= 11) return maskCpf(digits);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3/$4")
    .replace(/^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/, "$1.$2.$3/$4-$5");
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

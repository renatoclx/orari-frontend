// Sem "server-only": o proxy também usa este arquivo.

/** Cabeçalho que o Caddy preenche com o IP de quem fez a requisição. */
export const FORWARDED_FOR_HEADER = "x-forwarded-for";

// IPv4 (quatro números de 0 a 255) e IPv6 (hexadecimais e dois-pontos, com o
// formato misto ::ffff:1.2.3.4). Conferência de formato, não de existência.
const IPV4 =
  /^(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)$/;
const IPV6 = /^[0-9a-f:.]{2,45}$/i;

/**
 * IP do usuário a partir do `x-forwarded-for`. O Caddy coloca o IP real da
 * conexão no cabeçalho; aqui vale só o primeiro valor, e só se tiver cara de
 * IP: lixo ou um valor forjado não vira cabeçalho para a API. Sem valor
 * válido, devolve `undefined` e nada é enviado.
 */
export function clientIpFrom(
  forwardedFor: string | null | undefined,
): string | undefined {
  const first = forwardedFor?.split(",")[0]?.trim();
  if (!first) return undefined;

  if (IPV4.test(first)) return first;
  // IPv6 sempre tem dois-pontos; sem eles, um texto de hexadecimais ("abc")
  // passaria na conferência acima.
  if (first.includes(":") && IPV6.test(first)) return first;
  return undefined;
}

/** Cabeçalho `X-Forwarded-For` para a API, ou nada quando não há IP. */
export function forwardedForHeader(
  clientIp: string | undefined,
): Record<string, string> {
  return clientIp ? { "X-Forwarded-For": clientIp } : {};
}

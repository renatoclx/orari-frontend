const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * O valor é um UUID? Os ids chegam da URL e de Server Actions (entrada de
 * quem usa a tela) e entram no caminho da API: conferir o formato antes evita
 * caminhos forjados (`..%2F`) e dá 404 em vez de erro do servidor.
 */
export const isUuid = (value: string): boolean => UUID.test(value);

/** "12345678909" → "123.456.789-09" */
export function formatCpf(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
}

/** "11987654321" → "(11) 98765-4321"; "1133224455" → "(11) 3322-4455" */
export function formatPhone(phone: string): string {
  return phone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, "($1) $2-$3");
}

/**
 * "1990-03-15T00:00:00.000Z" → "15/03/1990"
 *
 * Para datas sem horário (ex.: nascimento): formatar em UTC evita que o fuso
 * de São Paulo jogue a data para o dia anterior.
 */
export function formatDateOnly(isoDate: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(isoDate),
  );
}

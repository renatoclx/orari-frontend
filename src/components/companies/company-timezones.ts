// Fusos oferecidos no cadastro da empresa: os do Brasil. O padrão é Brasília
// (America/Sao_Paulo), usado pela maioria. A API aceita qualquer fuso IANA; esta
// lista curta evita erro de digitação.

export const DEFAULT_TIMEZONE = "America/Sao_Paulo";

export const COMPANY_TIMEZONES: { value: string; label: string }[] = [
  { value: "America/Sao_Paulo", label: "Brasília (America/Sao_Paulo)" },
  { value: "America/Noronha", label: "Fernando de Noronha (America/Noronha)" },
  { value: "America/Manaus", label: "Manaus (America/Manaus)" },
  { value: "America/Cuiaba", label: "Cuiabá (America/Cuiaba)" },
  {
    value: "America/Campo_Grande",
    label: "Campo Grande (America/Campo_Grande)",
  },
  { value: "America/Porto_Velho", label: "Porto Velho (America/Porto_Velho)" },
  { value: "America/Boa_Vista", label: "Boa Vista (America/Boa_Vista)" },
  { value: "America/Rio_Branco", label: "Rio Branco (America/Rio_Branco)" },
];

/**
 * Lista do select: a de sempre e, se a empresa já tem outro fuso (cadastrado
 * pela API), ele também aparece, para a alteração não o perder.
 */
export function timezoneOptions(current?: string) {
  if (!current || COMPANY_TIMEZONES.some((zone) => zone.value === current)) {
    return COMPANY_TIMEZONES;
  }
  return [...COMPANY_TIMEZONES, { value: current, label: current }];
}

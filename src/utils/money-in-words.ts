// Valor por extenso em reais (recibo de comissão): "dezoito reais e cinquenta
// centavos". Vai até milhões, o que cobre o Decimal(10,2) do banco.

const UNITS = [
  "zero",
  "um",
  "dois",
  "três",
  "quatro",
  "cinco",
  "seis",
  "sete",
  "oito",
  "nove",
  "dez",
  "onze",
  "doze",
  "treze",
  "catorze",
  "quinze",
  "dezesseis",
  "dezessete",
  "dezoito",
  "dezenove",
];
const TENS = [
  "",
  "",
  "vinte",
  "trinta",
  "quarenta",
  "cinquenta",
  "sessenta",
  "setenta",
  "oitenta",
  "noventa",
];
const HUNDREDS = [
  "",
  "cento",
  "duzentos",
  "trezentos",
  "quatrocentos",
  "quinhentos",
  "seiscentos",
  "setecentos",
  "oitocentos",
  "novecentos",
];

// De 0 a 999 (sem o "zero" quando faz parte de um número maior).
function belowThousand(value: number): string {
  if (value === 100) return "cem";
  const parts: string[] = [];
  const hundreds = Math.floor(value / 100);
  const rest = value % 100;
  if (hundreds > 0) parts.push(HUNDREDS[hundreds]);
  if (rest > 0) {
    if (rest < 20) parts.push(UNITS[rest]);
    else {
      const unit = rest % 10;
      parts.push(
        unit > 0
          ? `${TENS[Math.floor(rest / 10)]} e ${UNITS[unit]}`
          : TENS[Math.floor(rest / 10)],
      );
    }
  }
  return parts.join(" e ");
}

// Número inteiro por extenso ("mil e duzentos", "dois milhões e cem mil").
function integerInWords(value: number): string {
  if (value === 0) return "zero";
  const millions = Math.floor(value / 1_000_000);
  const thousands = Math.floor((value % 1_000_000) / 1000);
  const rest = value % 1000;
  const groups: string[] = [];
  if (millions > 0) {
    groups.push(
      millions === 1 ? "um milhão" : `${belowThousand(millions)} milhões`,
    );
  }
  if (thousands > 0) {
    groups.push(thousands === 1 ? "mil" : `${belowThousand(thousands)} mil`);
  }
  if (rest > 0) groups.push(belowThousand(rest));
  // O último grupo leva "e" quando é menor que cem ou uma centena redonda.
  if (groups.length > 1 && (rest < 100 || rest % 100 === 0) && rest > 0) {
    const last = groups.pop()!;
    return `${groups.join(", ")} e ${last}`;
  }
  return groups.join(" ");
}

/** "18.5" ou 18.5 → "dezoito reais e cinquenta centavos". */
export function moneyInWords(value: string | number): string {
  const cents = Math.round(Number(value) * 100);
  const reais = Math.floor(cents / 100);
  const centavos = cents % 100;
  const parts: string[] = [];
  if (reais > 0) {
    const words = integerInWords(reais);
    // "um milhão de reais", "dois milhões de reais".
    const of = reais % 1_000_000 === 0 ? " de" : "";
    parts.push(`${words}${of} ${reais === 1 ? "real" : "reais"}`);
  }
  if (centavos > 0) {
    parts.push(
      `${integerInWords(centavos)} ${centavos === 1 ? "centavo" : "centavos"}`,
    );
  }
  return parts.length > 0 ? parts.join(" e ") : "zero real";
}

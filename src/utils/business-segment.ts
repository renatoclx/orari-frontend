import type { BusinessSegment } from "@/types/portal";

// Ramos do estabelecimento na busca do app, na ordem em que aparecem na tela
// ("Outros" por último). Os códigos são os da API (BusinessSegment).
export const BUSINESS_SEGMENTS: { value: BusinessSegment; label: string }[] = [
  { value: "BARBERSHOP", label: "Barbearia" },
  { value: "BEAUTY_SALON", label: "Salão de beleza" },
  { value: "AESTHETICS", label: "Estética" },
  { value: "NAIL_SALON", label: "Esmalteria" },
  { value: "EYEBROW_DESIGN", label: "Design de sobrancelhas" },
  { value: "PHYSIOTHERAPY", label: "Fisioterapia" },
  { value: "PILATES", label: "Pilates" },
  { value: "PSYCHOLOGY", label: "Psicologia" },
  { value: "NUTRITION", label: "Nutrição" },
  { value: "DENTISTRY", label: "Odontologia" },
  { value: "OTHER", label: "Outros" },
];

/** "Estética", "Esmalteria"… */
export function segmentLabel(segment: BusinessSegment): string {
  return (
    BUSINESS_SEGMENTS.find((item) => item.value === segment)?.label ?? "Outros"
  );
}

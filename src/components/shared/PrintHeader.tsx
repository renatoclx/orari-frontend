import { formatDateOnly } from "@/utils/format";
import { toDateString, toTimeString } from "@/utils/time";

type PrintHeaderProps = {
  title: string;
  companyName: string;
  timeZone: string;
  /** Linhas de contexto (período, profissional, filtros). */
  details: string[];
};

/** Cabeçalho da folha impressa: empresa, relatório, filtros e quando foi gerado. */
export function PrintHeader({
  title,
  companyName,
  timeZone,
  details,
}: PrintHeaderProps) {
  const now = new Date();
  const generatedAt = `${formatDateOnly(`${toDateString(now, timeZone)}T00:00:00Z`)} às ${toTimeString(now.toISOString(), timeZone)}`;

  return (
    <header className="space-y-1 border-b border-border pb-3">
      <p className="text-sm text-muted-foreground">{companyName}</p>
      <h1 className="text-2xl font-semibold">{title}</h1>
      {details.map((detail) => (
        <p key={detail} className="text-sm">
          {detail}
        </p>
      ))}
      <p className="text-xs text-muted-foreground">Gerado em {generatedAt}</p>
    </header>
  );
}

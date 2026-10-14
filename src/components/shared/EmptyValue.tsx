// Quando não existe a informação, as tabelas mostram "--"
// (screen-patterns.md, "Tabelas").
const EMPTY = "--";

export function EmptyValue({ children }: { children?: React.ReactNode }) {
  return children ? (
    <>{children}</>
  ) : (
    <span className="text-muted-foreground">{EMPTY}</span>
  );
}

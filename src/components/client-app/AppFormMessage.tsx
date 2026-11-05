import { CircleAlert, Info } from "lucide-react";

// Aviso dentro da tela do app (o app não usa os toasts da clínica: eles ficam
// fora da área escura). `info` para avisos neutros, `error` para recusas.
export function AppFormMessage({
  tone = "error",
  children,
}: {
  tone?: "error" | "info";
  children: React.ReactNode;
}) {
  const Icon = tone === "error" ? CircleAlert : Info;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-control border px-3 py-2 text-sm ${
        tone === "error"
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-primary/30 bg-primary/10 text-foreground"
      }`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}

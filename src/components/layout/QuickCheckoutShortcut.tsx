import Link from "next/link";
import { ReceiptText } from "lucide-react";
import { Hint } from "@/components/shared/Hint";

// Atalho das comandas do dia (screens/layout.md, "Barra de ações lateral"):
// leva direto às comandas do dia, de onde se recebe no balcão.
export function QuickCheckoutShortcut() {
  return (
    <Hint label="Comandas do dia" side="left">
      <Link
        href="/financeiro/comandas"
        aria-label="Comandas do dia"
        className="rounded-control p-2 text-muted-foreground hover:bg-background hover:text-foreground"
      >
        <ReceiptText className="size-5" aria-hidden="true" />
      </Link>
    </Hint>
  );
}

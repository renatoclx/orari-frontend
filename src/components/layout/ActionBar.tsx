import { CalendarShortcut } from "@/components/layout/CalendarShortcut";
import { QuickClientShortcut } from "@/components/layout/QuickClientShortcut";
import { QuickServiceShortcut } from "@/components/layout/QuickServiceShortcut";

// Barra de atalhos fixa na borda direita, presente em todas as telas
// administrativas a partir do tablet. No celular, os atalhos ficam no header,
// para a barra não cobrir o conteúdo. Novos atalhos entram nos dois lugares.
export function ActionBar() {
  return (
    <div className="fixed top-1/2 right-0 z-30 hidden -translate-y-1/2 md:block">
      <div className="flex w-12 flex-col items-center gap-1 rounded-l-overlay border border-r-0 border-border bg-card py-1.5 shadow-lg">
        <CalendarShortcut placement="bar" />
        <QuickClientShortcut />
        <QuickServiceShortcut />
      </div>
    </div>
  );
}

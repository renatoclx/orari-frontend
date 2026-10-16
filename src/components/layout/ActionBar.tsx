import { CalendarShortcut } from "@/components/layout/CalendarShortcut";
import { QuickClientShortcut } from "@/components/layout/QuickClientShortcut";
import { QuickRecurrenceShortcut } from "@/components/layout/QuickRecurrenceShortcut";
import { QuickServiceShortcut } from "@/components/layout/QuickServiceShortcut";

// Barra de atalhos fixa na borda direita, presente em todas as telas
// administrativas a partir do tablet. No celular ela some e só o calendário
// aparece, no header (screens/layout.md).
export function ActionBar() {
  return (
    <div className="fixed top-1/2 right-0 z-30 hidden -translate-y-1/2 md:block">
      <div className="flex w-12 flex-col items-center gap-1 rounded-l-overlay border border-r-0 border-border bg-card py-1.5 shadow-lg">
        <CalendarShortcut placement="bar" />
        <QuickClientShortcut />
        <QuickServiceShortcut />
        <QuickRecurrenceShortcut />
      </div>
    </div>
  );
}

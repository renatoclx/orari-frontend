import { Info } from "lucide-react";
import { saveNotificationPreferencesAction } from "@/app/(admin)/notification-actions";
import { getNotificationPreferences } from "@/services/notification.service";
import { PreferenceSwitches } from "./PreferenceSwitches";

/**
 * Portal do cliente → Avisos no celular (screens/notificacoes.md): o que também
 * vira aviso no celular, por categoria. A caixa (o sino) recebe tudo; só o aviso
 * no celular tem interruptor. Cada usuário vê as categorias dele.
 */
export async function NotificationPreferencesPage() {
  const { preferences } = await getNotificationPreferences();
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Avisos no celular</h1>
        <p className="text-sm text-muted-foreground">
          Escolha o que, além de chegar ao sino, também vira aviso no celular.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col rounded-card border border-border bg-card">
        <div className="relative min-h-0 flex-1 space-y-6 overflow-auto p-4 md:p-6">
          <PreferenceSwitches
            preferences={preferences}
            save={saveNotificationPreferencesAction}
          />
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />O
            aviso no celular chega aos aparelhos em que o app do Orari está
            instalado e com os avisos ativados. No computador, o aviso na tela
            do painel ainda não está disponível: o sino e a lista de
            notificações continuam funcionando.
          </p>
        </div>
      </div>
    </div>
  );
}

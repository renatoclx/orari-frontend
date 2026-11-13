"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import type { NotificationPreference } from "@/types/notification";
import { CATEGORY_HINT, CATEGORY_LABEL } from "./notification-format";

/**
 * Um interruptor por categoria do que também vira aviso no celular (a caixa
 * recebe tudo). Muda na hora e desfaz se a API recusar; `save` é a Server Action
 * de quem usa (painel ou app).
 */
export function PreferenceSwitches({
  preferences,
  save,
}: {
  preferences: NotificationPreference[];
  save: (
    preferences: NotificationPreference[],
  ) => Promise<{ ok: true } | { ok: false; message: string }>;
}) {
  const [prefs, setPrefs] = useState(preferences);
  const [error, setError] = useState<string>();

  function change(category: NotificationPreference["category"], push: boolean) {
    const previous = prefs;
    const next = prefs.map((item) =>
      item.category === category ? { ...item, push } : item,
    );
    setPrefs(next);
    setError(undefined);
    void save(next).then((result) => {
      if (!result.ok) {
        setPrefs(previous);
        setError(result.message);
      }
    });
  }

  return (
    <div className="space-y-4">
      {prefs.map(({ category, push }) => (
        <label
          key={category}
          className="flex items-center justify-between gap-4"
        >
          <span className="space-y-0.5">
            <span className="block font-medium">
              {CATEGORY_LABEL[category]}
            </span>
            <span className="block text-sm text-muted-foreground">
              {CATEGORY_HINT[category]}
            </span>
          </span>
          <Switch
            checked={push}
            onCheckedChange={(next) => change(category, next)}
          />
        </label>
      ))}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

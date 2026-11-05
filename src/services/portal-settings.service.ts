import "server-only";

import { apiFetch } from "@/services/api";
import type { PortalAccessLink, PortalSettings } from "@/types/portal";

// Lado da clínica no portal do cliente (screens/configuracoes.md e pessoas.md).

export function getPortalSettings(): Promise<PortalSettings> {
  return apiFetch<PortalSettings>("/portal-settings");
}

export function savePortalSettings(
  settings: PortalSettings,
): Promise<PortalSettings> {
  return apiFetch<PortalSettings>("/portal-settings", {
    method: "PUT",
    body: JSON.stringify(settings),
  });
}

/** Link de uso único (24 h) para o cliente entrar no portal. */
export function createPortalAccessLink(
  personId: string,
): Promise<PortalAccessLink> {
  return apiFetch<PortalAccessLink>(
    `/people/${encodeURIComponent(personId)}/portal-access`,
    { method: "POST" },
  );
}

/** Confirma o cliente que entrou sozinho pelo app (tira o limite de 2 agendamentos). */
export function confirmPortalClient(personId: string): Promise<void> {
  return apiFetch<void>(
    `/people/${encodeURIComponent(personId)}/portal-confirm`,
    { method: "PATCH" },
  );
}

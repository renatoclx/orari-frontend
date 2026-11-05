import "server-only";

import { appFetch } from "@/services/app-api";
import type { AppPlan, AppProfile, AppRecurrence } from "@/types/client-app";

// Meus dados, pacotes e recorrências do app do cliente (backend: /portal-account).

export function getProfile(): Promise<AppProfile> {
  return appFetch<AppProfile>("/portal-account/profile");
}

/** Salva o cadastro todo; a API copia para o cadastro em cada clínica. */
export function saveProfile(data: {
  name: string;
  phone: string;
  email: string | null;
  document: string | null;
  birthDate: string | null;
  profession: string | null;
  address: {
    cep: string;
    street: string;
    number: string;
    complement: string | null;
    neighborhood: string | null;
    cityId: string;
  } | null;
  currentPassword?: string;
}): Promise<AppProfile> {
  return appFetch<AppProfile>("/portal-account/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/** A cidade pelo nome e pela UF que o CEP devolve. */
export function findCity(
  name: string,
  state: string,
): Promise<{ id: string; name: string; state: string }> {
  const query = new URLSearchParams({ name, state });
  return appFetch(`/portal-account/city?${query}`);
}

export function uploadProfilePhoto(photo: Blob): Promise<{ photoUrl: string }> {
  const body = new FormData();
  body.set("photo", photo, "foto.jpg");
  return appFetch("/portal-account/photo", { method: "POST", body });
}

export function removeProfilePhoto(): Promise<void> {
  return appFetch<void>("/portal-account/photo", { method: "DELETE" });
}

export function listPlans(): Promise<AppPlan[]> {
  return appFetch<AppPlan[]>("/portal-account/plans");
}

export function listRecurrences(): Promise<AppRecurrence[]> {
  return appFetch<AppRecurrence[]>("/portal-account/recurrences");
}

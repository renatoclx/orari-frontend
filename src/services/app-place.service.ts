import "server-only";

import { appFetch } from "@/services/app-api";
import type {
  AppPlace,
  DirectoryPlace,
  PlaceService,
  PlaceShowcase,
} from "@/types/client-app";

// Estabelecimentos no app do cliente: busca, vitrine e entrar sozinho
// (backend: /portal-directory, /portal/:slug, /portal-account/places).

export function searchDirectory(q: string): Promise<DirectoryPlace[]> {
  return appFetch<DirectoryPlace[]>(
    `/portal-directory?q=${encodeURIComponent(q)}`,
    { authenticated: false },
  );
}

export function getPlace(slug: string): Promise<PlaceShowcase> {
  return appFetch<PlaceShowcase>(`/portal/${encodeURIComponent(slug)}`, {
    authenticated: false,
  });
}

export function listPlaceServices(slug: string): Promise<PlaceService[]> {
  return appFetch<PlaceService[]>(
    `/portal/${encodeURIComponent(slug)}/services`,
    { authenticated: false },
  );
}

/** Entra sozinho: cria um cadastro novo, não confirmado, na clínica. */
export function joinPlace(
  slug: string,
): Promise<{ place: AppPlace; joined: boolean }> {
  return appFetch(`/portal-account/places/${encodeURIComponent(slug)}`, {
    method: "POST",
  });
}

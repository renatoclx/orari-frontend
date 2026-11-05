import "server-only";

import { appFetch } from "@/services/app-api";
import type {
  AccessLinkCheck,
  AccessLinkResult,
  AppAccount,
  AppAppointment,
  AppSession,
} from "@/types/client-app";

// Conta do cliente no app (backend: /portal-account; screens/app-cliente.md).

export function registerAccount(data: {
  name: string;
  phone: string;
  password: string;
  passwordConfirmation: string;
}): Promise<AppSession> {
  return appFetch<AppSession>("/portal-account/register", {
    method: "POST",
    body: JSON.stringify(data),
    authenticated: false,
  });
}

export function loginAccount(data: {
  phone: string;
  password: string;
}): Promise<AppSession> {
  return appFetch<AppSession>("/portal-account/login", {
    method: "POST",
    body: JSON.stringify(data),
    authenticated: false,
  });
}

export function logoutAccount(): Promise<void> {
  return appFetch<void>("/portal-account/logout", { method: "POST" });
}

export function getAccount(): Promise<AppAccount> {
  return appFetch<AppAccount>("/portal-account");
}

export function listAccountAppointments(): Promise<{
  upcoming: AppAppointment[];
  past: AppAppointment[];
}> {
  return appFetch("/portal-account/appointments");
}

/** Confere o link de acesso sem usá-lo. */
export function checkAccessLink(token: string): Promise<AccessLinkCheck> {
  return appFetch<AccessLinkCheck>("/portal-account/link/check", {
    method: "POST",
    body: JSON.stringify({ token }),
    authenticated: false,
  });
}

/** Usa o link: com a conta entrada, liga o cadastro; sem ela, abre a sessão. */
export function redeemAccessLink(data: {
  token: string;
  phone?: string;
  password?: string;
  passwordConfirmation?: string;
}): Promise<AccessLinkResult> {
  return appFetch<AccessLinkResult>("/portal-account/link", {
    method: "POST",
    body: JSON.stringify(data),
    authenticated: "optional",
  });
}

/** Troca a senha conferindo a atual; os outros aparelhos saem. */
export function changeAccountPassword(data: {
  currentPassword: string;
  newPassword: string;
  newPasswordConfirmation: string;
}): Promise<void> {
  return appFetch<void>("/portal-account/password", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

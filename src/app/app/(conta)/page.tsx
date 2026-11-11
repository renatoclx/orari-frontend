import type { Metadata } from "next";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { AppTips } from "@/components/client-app/AppTips";
import { FeaturedAppointmentCard } from "@/components/client-app/FeaturedAppointmentCard";
import { PushInvite } from "@/components/client-app/PushInvite";
import { RecentPlaces } from "@/components/client-app/RecentPlaces";
import { SearchShortcut } from "@/components/client-app/SearchShortcut";
import {
  DEFAULT_TIME_ZONE,
  firstName,
  greetingDate,
} from "@/components/client-app/client-app";
import {
  featuredAppointment,
  recentPlaces,
} from "@/components/client-app/home-feed";
import {
  getAccount,
  listAccountAppointments,
} from "@/services/app-account.service";
import { ApiError } from "@/services/api";
import { getPushInfo } from "@/services/app-push.service";

export const metadata: Metadata = { title: "Início" };

/**
 * Início do app (screens/app-cliente.md): saudação com a data, o convite para
 * ativar os avisos (enquanto não estão ativados neste aparelho), o atalho de
 * busca, o próximo agendamento (ou o último), as dicas do app e os últimos
 * acessos.
 */
export default async function AppHomePage({ searchParams }: PageProps<"/app">) {
  const { bemVindo, agendado } = await searchParams;
  const [{ account, places }, { upcoming, past }, pushInfo] = await Promise.all(
    [
      getAccount(),
      listAccountAppointments(),
      // Os avisos são um extra do Início: se a API falhar só nessa parte, a
      // tela abre sem o convite (a sessão vencida continua indo para Entrar).
      getPushInfo().catch((error: unknown) => {
        if (error instanceof ApiError) return null;
        throw error;
      }),
    ],
  );
  const publicKey = pushInfo?.publicKey ?? null;
  const featured = featuredAppointment(upcoming, past);
  // A data da saudação no fuso do primeiro estabelecimento (todos no Brasil).
  const timeZone = places[0]?.timezone ?? DEFAULT_TIME_ZONE;

  return (
    <>
      <header>
        <h1 className="text-2xl font-semibold">
          Olá <span className="text-primary">{firstName(account.name)}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          {greetingDate(new Date(), timeZone)}
        </p>
      </header>

      {/* A busca logo abaixo da saudação: o atalho mais usado do Início. */}
      <SearchShortcut />

      {agendado && (
        <AppFormMessage tone="info">
          Agendamento confirmado. Ele aparece abaixo, em Próximo agendamento.
        </AppFormMessage>
      )}

      {bemVindo && (
        <AppFormMessage tone="info">
          Conta criada. Boas-vindas ao Orari!
        </AppFormMessage>
      )}

      {featured && <FeaturedAppointmentCard featured={featured} />}

      {/* Sem as chaves no servidor, os avisos estão desligados: sem convite. */}
      {publicKey && <PushInvite publicKey={publicKey} />}

      <AppTips />

      <RecentPlaces places={recentPlaces(places, [...upcoming, ...past])} />
    </>
  );
}

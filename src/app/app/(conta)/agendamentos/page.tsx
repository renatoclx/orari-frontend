import type { Metadata } from "next";
import Link from "next/link";
import { CalendarX } from "lucide-react";
import { AppointmentCard } from "@/components/client-app/AppointmentCard";
import { PlaceFilter } from "@/components/client-app/PlaceFilter";
import { filterByPlace } from "@/components/client-app/appointments-list";
import {
  getAccount,
  listAccountAppointments,
} from "@/services/app-account.service";

export const metadata: Metadata = { title: "Agendamentos" };

const TABS = [
  { id: "proximos", label: "Próximos" },
  { id: "anteriores", label: "Anteriores" },
] as const;

/**
 * Agendamentos de todos os estabelecimentos (screens/app-cliente.md): os
 * próximos (com cancelar, no prazo da clínica) e os anteriores, com o filtro
 * por estabelecimento, como no AppBarber.
 */
export default async function AppAppointmentsPage({
  searchParams,
}: PageProps<"/app/agendamentos">) {
  const { aba, local } = await searchParams;
  const tab = aba === "anteriores" ? "anteriores" : "proximos";
  const [{ places }, { upcoming, past }] = await Promise.all([
    getAccount(),
    listAccountAppointments(),
  ]);
  const place = places.some((item) => item.slug === local)
    ? (local as string)
    : undefined;
  const items = filterByPlace(tab === "proximos" ? upcoming : past, place);

  return (
    <>
      <h1 className="text-2xl font-semibold">Agendamentos</h1>
      {places.length > 1 && (
        <PlaceFilter places={places} value={place} tab={tab} />
      )}

      <nav
        aria-label="Próximos ou anteriores"
        className="flex rounded-control bg-card p-1"
      >
        {TABS.map(({ id, label }) => {
          const params = new URLSearchParams({ aba: id });
          if (place) params.set("local", place);
          return (
            <Link
              key={id}
              href={`/app/agendamentos?${params}`}
              aria-current={tab === id ? "page" : undefined}
              className={`flex-1 rounded-control py-2 text-center text-sm font-medium ${
                tab === id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item) => (
            <AppointmentCard
              key={item.id}
              item={item}
              upcoming={tab === "proximos"}
            />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <CalendarX
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
          <p className="font-semibold">Nenhum agendamento</p>
          <p className="text-sm text-muted-foreground">
            {tab === "proximos"
              ? "Você não tem agendamentos marcados."
              : "Nenhum atendimento anterior."}
          </p>
        </div>
      )}
    </>
  );
}

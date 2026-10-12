const appointments = [
  {
    id: "1",
    start: "09:00",
    end: "09:45",
    client: "Ana Souza",
    service: "Corte feminino",
    professional: "Carla",
    price: "R$ 45,00",
    status: "Confirmado",
    serviceColor: "#8b5cf6",
  },
  {
    id: "2",
    start: "10:00",
    end: "11:00",
    client: "Marcos Oliveira",
    service: "Pilates",
    professional: "Juliana",
    price: "R$ 120,00",
    status: "Agendado",
    serviceColor: "#10b981",
  },
];

export default function Home() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Agenda</h1>
      <p className="mt-1 text-sm text-muted">Segunda-feira, 12 de outubro</p>

      <ul className="mt-6 space-y-3">
        {appointments.map((appointment) => (
          <li key={appointment.id}>
            <article className="flex gap-4 rounded-card border border-border bg-surface p-4">
              {/* Cor do serviço vem do cadastro (backend), não de um token. */}
              <div
                className="w-1 shrink-0 rounded-full"
                style={{ backgroundColor: appointment.serviceColor }}
                aria-hidden="true"
              />

              <div className="w-14 shrink-0 tabular-nums">
                <time
                  dateTime={appointment.start}
                  className="block font-semibold"
                >
                  {appointment.start}
                </time>
                <time
                  dateTime={appointment.end}
                  className="block text-sm text-muted"
                >
                  {appointment.end}
                </time>
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="truncate font-semibold">{appointment.client}</h2>
                <p className="truncate text-sm text-muted">
                  {appointment.service} com {appointment.professional}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-sm font-medium tabular-nums">
                  {appointment.price}
                </p>
                <p className="text-sm text-muted">{appointment.status}</p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}

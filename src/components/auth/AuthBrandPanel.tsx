import { CircleCheck, Clock } from "lucide-react";

// Decorativo: uma prévia estática da agenda para dar contexto à tela de login.
const previewAppointments = [
  {
    time: "09:00",
    client: "Ana Souza",
    service: "Corte",
    color: "#8b5cf6",
    status: "confirmed",
  },
  {
    time: "10:00",
    client: "Marcos Oliveira",
    service: "Pilates",
    color: "#10b981",
    status: "inProgress",
  },
  {
    time: "11:30",
    client: "Paula Mendes",
    service: "Drenagem",
    color: "#f59e0b",
    status: "scheduled",
  },
  {
    time: "14:00",
    client: "Dhebora Lima",
    service: "Sobrancelha",
    color: "#ec4899",
    status: "confirmed",
  },
];

// Conteúdo ilustrativo do painel da marca (não são dados reais).
const weekDays = [
  { label: "S", day: 12, busy: true, today: true },
  { label: "T", day: 13, busy: true },
  { label: "Q", day: 14, busy: false },
  { label: "Q", day: 15, busy: true },
  { label: "S", day: 16, busy: true },
];

const professionals = ["CA", "JU", "KE"];

// Estilo dos cartões que flutuam sobre a grade ilustrativa.
const floatingCard =
  "absolute rounded-card border border-sidebar-border bg-sidebar p-3 shadow-2xl";

// Agendamentos de fundo, encaixados nas células da grade (coluna, linha, duração).
const GRID_COLUMN = 176;
const GRID_ROW = 48;
const backgroundBlocks = [
  { column: 0, row: 2, rows: 2, color: "#8b5cf6" },
  { column: 0, row: 7, rows: 1, color: "#10b981" },
  { column: 0, row: 14, rows: 2, color: "#f59e0b" },
  { column: 1, row: 1, rows: 1, color: "#ec4899" },
  { column: 1, row: 4, rows: 2, color: "#10b981" },
  { column: 1, row: 16, rows: 1, color: "#8b5cf6" },
  { column: 2, row: 0, rows: 2, color: "#f59e0b" },
  { column: 3, row: 2, rows: 1, color: "#10b981" },
  { column: 3, row: 16, rows: 1, color: "#ec4899" },
  { column: 4, row: 3, rows: 2, color: "#ec4899" },
  { column: 4, row: 9, rows: 1, color: "#f59e0b" },
  { column: 4, row: 14, rows: 1, color: "#10b981" },
];

export function AuthBrandPanel() {
  return (
    <aside
      aria-hidden="true"
      className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden rounded-card px-12 text-sidebar-foreground lg:flex"
      style={{
        // Degradê a partir do cyan da logo, escurecendo em direção à base.
        background:
          "linear-gradient(160deg, color-mix(in srgb, var(--brand) 45%, var(--sidebar)) 0%, color-mix(in srgb, var(--brand) 20%, var(--sidebar)) 55%, var(--sidebar) 100%)",
      }}
    >
      {/* Grade de horários da agenda, com alguns agendamentos bem sutis. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, var(--sidebar-border) 1px, transparent 1px), linear-gradient(to right, var(--sidebar-border) 1px, transparent 1px)",
          backgroundSize: `100% ${GRID_ROW}px, ${GRID_COLUMN}px 100%`,
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      >
        {backgroundBlocks.map((block) => (
          <div
            key={`${block.column}-${block.row}`}
            className="absolute rounded-control border-l-2"
            style={{
              left: block.column * GRID_COLUMN + 6,
              top: block.row * GRID_ROW + 5,
              width: GRID_COLUMN - 12,
              height: block.rows * GRID_ROW - 9,
              borderLeftColor: `color-mix(in srgb, ${block.color} 45%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${block.color} 12%, transparent)`,
            }}
          />
        ))}
      </div>

      <div className="relative mt-16 w-full max-w-sm">
        {/* Faixa da semana */}
        <div className={`${floatingCard} -top-20 -left-24 w-56`}>
          <p className="mb-2 text-xs text-sidebar-muted">Outubro</p>
          <div className="flex justify-between">
            {weekDays.map((weekDay) => (
              <div
                key={weekDay.day}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-[10px] text-sidebar-muted">
                  {weekDay.label}
                </span>
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-xs tabular-nums ${
                    weekDay.today
                      ? "bg-primary font-semibold text-primary-foreground"
                      : ""
                  }`}
                >
                  {weekDay.day}
                </span>
                <span
                  className={`size-1 rounded-full ${weekDay.busy ? "bg-brand" : "bg-transparent"}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Próximo horário livre */}
        <div className={`${floatingCard} -top-24 -right-16 w-52`}>
          <div className="flex items-center gap-2 text-xs text-sidebar-muted">
            <Clock className="size-3.5" />
            Próximo horário livre
          </div>
          <p className="mt-1 text-sm font-medium">
            <span className="tabular-nums">14:30</span> com Juliana
          </p>
          <div className="mt-2 flex -space-x-1.5">
            {professionals.map((initials) => (
              <span
                key={initials}
                className="flex size-7 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-[10px] font-medium"
              >
                {initials}
              </span>
            ))}
          </div>
        </div>

        {/* Cartão principal: agendamentos do dia */}
        <div className="relative rounded-card border border-sidebar-border bg-sidebar p-4 shadow-2xl">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-sm font-semibold">Hoje</p>
            <p className="text-xs text-sidebar-muted">
              {previewAppointments.length} agendamentos
            </p>
          </div>
          <ul className="space-y-2">
            {previewAppointments.map((appointment) => (
              <li
                key={appointment.time}
                className="flex items-center gap-3 rounded-control border-l-[3px] px-3 py-2"
                style={{
                  borderLeftColor: appointment.color,
                  backgroundColor: `color-mix(in srgb, ${appointment.color} 18%, transparent)`,
                }}
              >
                <span className="text-xs text-sidebar-muted tabular-nums">
                  {appointment.time}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {appointment.client}
                  </span>
                  <span className="block text-xs text-sidebar-muted">
                    {appointment.service}
                  </span>
                </span>
                {appointment.status === "confirmed" && (
                  <CircleCheck className="size-4 shrink-0 text-sidebar-muted" />
                )}
                {appointment.status === "inProgress" && (
                  <span
                    className="size-2 shrink-0 rounded-full motion-safe:animate-pulse"
                    style={{ backgroundColor: appointment.color }}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Ocupação do dia */}
        <div className={`${floatingCard} -bottom-14 -left-20 w-48`}>
          <p className="text-xs text-sidebar-muted">Confirmados hoje</p>
          <p className="mt-1 text-sm font-medium tabular-nums">9 de 12</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sidebar-accent">
            <div className="h-full w-3/4 rounded-full bg-brand" />
          </div>
        </div>

        {/* Aviso de confirmação */}
        <div
          className={`${floatingCard} -right-12 -bottom-10 flex w-52 items-center gap-3`}
        >
          <CircleCheck className="size-5 shrink-0 text-brand" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Ana Souza confirmou</p>
            <p className="text-xs text-sidebar-muted">Hoje às 09:00</p>
          </div>
        </div>
      </div>

      <div className="relative mt-28 max-w-md text-center">
        <h2 className="text-3xl font-semibold">Cada horário no lugar certo.</h2>
        <p className="mt-3 text-sidebar-muted">
          Agendamentos, clientes e pagamentos da sua empresa em um só lugar.
        </p>
      </div>
    </aside>
  );
}

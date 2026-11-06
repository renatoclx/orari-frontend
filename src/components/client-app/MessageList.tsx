import Image from "next/image";
import Link from "next/link";
import { PlaceAvatar } from "@/components/client-app/PlaceAvatar";
import { DEFAULT_TIME_ZONE } from "@/components/client-app/client-app";
import { messageWhen } from "@/components/client-app/push-support";
import type { AppMessage } from "@/types/client-app";

// O caminho da própria tela Avisos: tocar num aviso que leva a ela não faz nada.
const MESSAGES_PATH = "/app/menu/avisos";

/** Conteúdo de um aviso: quem enviou, quando, o texto e o selo de novo. */
function MessageBody({ message, now }: { message: AppMessage; now: Date }) {
  const sender = message.place?.name ?? "Orari";
  return (
    <>
      {message.place ? (
        <PlaceAvatar
          name={message.place.name}
          logoUrl={message.place.logoUrl}
        />
      ) : (
        // Aviso do próprio Orari (o de teste): o símbolo no lugar da logo.
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary">
          <Image
            src="/app-assets/symbol.svg"
            alt=""
            width={20}
            height={20}
            unoptimized
          />
        </span>
      )}
      <span className="min-w-0 flex-1 space-y-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate font-semibold">{message.title}</span>
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {/* Todos os estabelecimentos estão no Brasil: o fuso padrão serve. */}
            {messageWhen(message.createdAt, now, DEFAULT_TIME_ZONE)}
          </span>
        </span>
        <span className="block text-sm">{message.body}</span>
        {message.title !== sender && (
          <span className="block text-xs text-muted-foreground">{sender}</span>
        )}
      </span>
      {!message.readAt && (
        <span className="mt-2 size-2.5 shrink-0 rounded-full bg-primary">
          <span className="sr-only">Novo</span>
        </span>
      )}
    </>
  );
}

/** A caixa de Avisos (screens/app-cliente.md, "Avisos"), dos mais novos aos mais antigos. */
export function MessageList({ messages }: { messages: AppMessage[] }) {
  const now = new Date();
  const rowClass =
    "flex items-start gap-3 rounded-card border border-border bg-card p-4";
  return (
    <ul className="space-y-3">
      {messages.map((message) => (
        <li key={message.id}>
          {message.url && message.url !== MESSAGES_PATH ? (
            <Link href={message.url} className={`${rowClass} hover:bg-accent`}>
              <MessageBody message={message} now={now} />
            </Link>
          ) : (
            <div className={rowClass}>
              <MessageBody message={message} now={now} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

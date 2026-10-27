"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FilePlus2 } from "lucide-react";
import { listClientAnamnesesAction } from "@/app/(admin)/anamnesis-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnamnesisClientItem, AnamnesisListItem } from "@/types/anamnesis";
import { formatDateOnly } from "@/utils/format";

type ClientAnamnesesDialogProps = {
  /** Cliente cujas fichas são mostradas; `null` com o dialog fechado. */
  client: AnamnesisClientItem | null;
  onOpenChange: (open: boolean) => void;
};

/**
 * Fichas respondidas de um cliente, cada uma com o link para abri-la (é na
 * ficha que se registra o acompanhamento). As fichas são buscadas ao abrir (a
 * listagem só traz a contagem).
 */
export function ClientAnamnesesDialog({
  client,
  onOpenChange,
}: ClientAnamnesesDialogProps) {
  return (
    <Dialog open={client !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        {/* A key refaz a busca a cada cliente e descarta o resultado anterior. */}
        {client && <ClientAnamneses key={client.clientId} client={client} />}
      </DialogContent>
    </Dialog>
  );
}

type Loaded =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; items: AnamnesisListItem[] };

function ClientAnamneses({ client }: { client: AnamnesisClientItem }) {
  const [loaded, setLoaded] = useState<Loaded>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    listClientAnamnesesAction(client.clientId).then((result) => {
      if (cancelled) return;
      setLoaded(
        result.ok
          ? { status: "done", items: result.items }
          : { status: "error", message: result.message },
      );
    });
    return () => {
      cancelled = true;
    };
  }, [client.clientId]);

  return (
    <>
      <DialogHeader>
        <DialogTitle>Fichas de {client.clientName}</DialogTitle>
        <DialogDescription>
          Escolha uma ficha para ver as respostas e a evolução.
        </DialogDescription>
      </DialogHeader>

      {loaded.status === "loading" && (
        <div className="space-y-2" aria-busy="true">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      )}
      {loaded.status === "error" && (
        <p role="alert" className="text-sm text-destructive">
          {loaded.message}
        </p>
      )}
      {loaded.status === "done" && (
        <ul className="divide-y divide-border rounded-control border border-border">
          {loaded.items.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{item.template.name}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  v{item.templateVersion} · {Math.max(0, item.entriesCount - 1)}{" "}
                  acompanhamento(s) · última consulta em{" "}
                  {formatDateOnly(item.lastConsultationDate)}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/clientes/${client.clientId}/anamnese/${item.id}`}>
                  Abrir
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {/* Cliente inativo não recebe fichas novas. */}
      {client.isActive && (
        <DialogFooter>
          <Button asChild variant="outline">
            <Link href={`/anamnese/fichas/nova?clienteId=${client.clientId}`}>
              <FilePlus2 aria-hidden="true" />
              Nova ficha
            </Link>
          </Button>
        </DialogFooter>
      )}
    </>
  );
}

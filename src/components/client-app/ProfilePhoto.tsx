"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Camera, Trash2 } from "lucide-react";
import { appPhotoAction, appRemovePhotoAction } from "@/app/app/actions";
import { AppFormMessage } from "@/components/client-app/AppFormMessage";
import { resizePhoto } from "@/components/client-app/resize-photo";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/utils/format";

/**
 * Foto de Meus dados (screens/app-cliente.md). No celular, o campo de arquivo
 * oferece tirar a foto na hora ou escolher da galeria. A foto é reduzida aqui
 * antes de ir ao servidor, e vale na hora (não espera o Salvar).
 */
export function ProfilePhoto({
  name,
  photoUrl,
}: {
  name: string;
  photoUrl: string | null;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();

  function send(file: File) {
    setError(undefined);
    startTransition(async () => {
      try {
        const data = new FormData();
        data.set("photo", await resizePhoto(file), "foto.jpg");
        const result = await appPhotoAction(data);
        if (!result.ok) setError(result.message);
      } catch {
        setError("Não foi possível ler a foto. Tente outra.");
      }
    });
  }

  function remove() {
    setError(undefined);
    startTransition(async () => {
      const result = await appRemovePhotoAction();
      if (!result.ok) setError(result.message);
    });
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt="Sua foto"
          width={112}
          height={112}
          unoptimized
          className="size-28 rounded-full bg-card object-cover"
        />
      ) : (
        <span
          aria-hidden="true"
          className="grid size-28 place-items-center rounded-full bg-primary/20 text-3xl font-bold text-primary"
        >
          {getInitials(name)}
        </span>
      )}
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-label="Escolher foto"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) send(file);
          event.target.value = "";
        }}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() => input.current?.click()}
        >
          <Camera aria-hidden="true" />
          {pending ? "Enviando…" : photoUrl ? "Trocar foto" : "Adicionar foto"}
        </Button>
        {photoUrl && (
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={remove}
            aria-label="Remover a foto"
          >
            <Trash2 aria-hidden="true" />
            Remover
          </Button>
        )}
      </div>
      {error && <AppFormMessage>{error}</AppFormMessage>}
    </div>
  );
}

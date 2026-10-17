"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImageIcon, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

// Regras do backend: JPEG ou PNG, até 2 MB.
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_BYTES = 2 * 1024 * 1024;

/** O que mudou na logo: arquivo novo, remoção da atual ou nada. */
export type LogoChange = { file?: File; removed: boolean };

type LogoUploadProps = {
  /** Logo cadastrada (ex.: "/uploads/companies/x.png"). */
  currentUrl: string | null;
  onChange: (change: LogoChange) => void;
};

// Logo da empresa: prévia retangular (logos não são quadradas) e botões de
// escolher e remover. O arquivo é enviado pelo formulário, ao salvar.
export function LogoUpload({ currentUrl, onChange }: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>();
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string>();

  const shownUrl = preview ?? (removed ? undefined : (currentUrl ?? undefined));

  // Libera a URL temporária da prévia anterior ao trocar ou sair da tela.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Use uma imagem JPEG ou PNG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("A logo deve ter até 2 MB.");
      return;
    }
    setError(undefined);
    setPreview(URL.createObjectURL(file));
    setRemoved(false);
    onChange({ file, removed: false });
  }

  // Tira a escolhida e, se houver, a cadastrada (removida ao salvar).
  function remove() {
    setPreview(undefined);
    setRemoved(Boolean(currentUrl));
    onChange({ removed: Boolean(currentUrl) });
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex h-20 w-40 items-center justify-center overflow-hidden rounded-control border border-border bg-background">
        {shownUrl ? (
          <Image
            src={shownUrl}
            alt="Logo da empresa"
            width={160}
            height={80}
            unoptimized
            className="max-h-full w-auto object-contain"
          />
        ) : (
          <ImageIcon
            className="size-8 text-muted-foreground"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="space-y-2">
        <input
          ref={inputRef}
          id="company-logo"
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFile}
          className="hidden"
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
          >
            <Upload aria-hidden="true" />
            {shownUrl ? "Trocar logo" : "Selecionar logo"}
          </Button>
          {shownUrl && (
            <Button type="button" variant="ghost" onClick={remove}>
              <Trash2 aria-hidden="true" />
              Remover
            </Button>
          )}
        </div>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Opcional. JPEG ou PNG, até 2 MB. Aparece no topo da tela.
          </p>
        )}
      </div>
    </div>
  );
}

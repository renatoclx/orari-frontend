"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Upload } from "lucide-react";
import { CameraCaptureDialog } from "@/components/shared/CameraCaptureDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Regras do backend (business-rules.md): JPEG ou PNG, até 2 MB.
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];
const MAX_BYTES = 2 * 1024 * 1024;

type PhotoUploadProps = {
  /** Nome do campo de arquivo no formulário. */
  name?: string;
};

// Foto da pessoa: uma div circular que mostra a imagem escolhida ou tirada na
// câmera do dispositivo. Opcional. O envio é feito depois do cadastro (a API
// recebe a foto numa rota própria).
export function PhotoUpload({ name = "photo" }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState<string>();
  const [cameraOpen, setCameraOpen] = useState(false);

  // Libera a URL temporária da imagem anterior ao trocar ou sair da tela.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function clear() {
    if (inputRef.current) inputRef.current.value = "";
    setPreview(undefined);
  }

  // Valida o arquivo (escolhido ou tirado na câmera) e mostra a prévia.
  function acceptFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      clear();
      setError("Use uma imagem JPEG ou PNG.");
      return;
    }
    if (file.size > MAX_BYTES) {
      clear();
      setError("A foto deve ter até 2 MB.");
      return;
    }

    setError(undefined);
    setPreview(URL.createObjectURL(file));
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) acceptFile(file);
  }

  // A foto tirada vai para o campo de arquivo, como se tivesse sido escolhida:
  // o formulário a envia da mesma forma.
  function handleCapture(file: File) {
    const transfer = new DataTransfer();
    transfer.items.add(file);
    if (inputRef.current) inputRef.current.files = transfer.files;
    acceptFile(file);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={preview ? "Trocar foto" : "Selecionar foto"}
        className="rounded-full"
      >
        <Avatar className="size-24 border border-border">
          {preview && <AvatarImage src={preview} alt="Foto selecionada" />}
          <AvatarFallback>
            <Camera
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
          </AvatarFallback>
        </Avatar>
      </button>

      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleChange}
        className="hidden"
      />

      <div className="flex flex-wrap justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          <Upload aria-hidden="true" />
          {preview ? "Trocar foto" : "Selecionar foto"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => setCameraOpen(true)}
        >
          <Camera aria-hidden="true" />
          Tirar foto
        </Button>
        {preview && (
          <Button type="button" variant="ghost" onClick={clear}>
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
          Opcional. JPEG ou PNG, até 2 MB.
        </p>
      )}

      <CameraCaptureDialog
        open={cameraOpen}
        onOpenChange={setCameraOpen}
        onCapture={handleCapture}
      />
    </div>
  );
}

"use client";

import { Camera, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CameraCaptureDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Recebe a foto tirada, em JPEG e já recortada em quadrado. */
  onCapture: (file: File) => void;
};

// Lado máximo da foto gerada: mantém o arquivo bem abaixo do limite de 2 MB.
const MAX_SIDE = 960;

// Traduz o erro do navegador para uma orientação ao usuário.
function cameraErrorMessage(error: unknown): string {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return "Permita o acesso à câmera no navegador para tirar a foto.";
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") {
    return "Nenhuma câmera encontrada neste dispositivo.";
  }
  return "Não foi possível acessar a câmera.";
}

// Câmera ao vivo para tirar a foto da pessoa, no computador ou no celular.
export function CameraCaptureDialog({
  open,
  onOpenChange,
  onCapture,
}: CameraCaptureDialogProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream>();
  const [error, setError] = useState<string>();
  const [ready, setReady] = useState(false);

  // Só consulta o navegador com o diálogo aberto (no servidor, nunca roda).
  const supported = open && !!navigator.mediaDevices?.getUserMedia;
  const message =
    open && !supported ? "Este navegador não permite usar a câmera." : error;

  // Liga a câmera ao abrir e a desliga ao fechar (a luz da câmera apaga).
  useEffect(() => {
    if (!open || !supported) return;

    let cancelled = false;
    let active: MediaStream | undefined;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((media) => {
        if (cancelled) {
          media.getTracks().forEach((track) => track.stop());
          return;
        }
        active = media;
        setStream(media);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(cameraErrorMessage(reason));
      });

    return () => {
      cancelled = true;
      active?.getTracks().forEach((track) => track.stop());
      // Estado limpo para a próxima abertura.
      setStream(undefined);
      setReady(false);
      setError(undefined);
    };
  }, [open, supported]);

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    // Recorte quadrado central: a foto é exibida num círculo.
    const side = Math.min(video.videoWidth, video.videoHeight);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = Math.min(side, MAX_SIDE);
    canvas
      .getContext("2d")
      ?.drawImage(
        video,
        (video.videoWidth - side) / 2,
        (video.videoHeight - side) / 2,
        side,
        side,
        0,
        0,
        canvas.width,
        canvas.height,
      );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("Não foi possível capturar a foto. Tente novamente.");
          return;
        }
        onCapture(new File([blob], "foto.jpg", { type: "image/jpeg" }));
        onOpenChange(false);
      },
      "image/jpeg",
      0.9,
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tirar foto</DialogTitle>
          <DialogDescription>
            Posicione-se no quadro e clique em Capturar.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mx-auto aspect-square w-full max-w-xs overflow-hidden rounded-card bg-muted">
          {message ? (
            <p
              role="alert"
              className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-destructive"
            >
              {message}
            </p>
          ) : (
            <video
              ref={(node) => {
                videoRef.current = node;
                if (node && node.srcObject !== (stream ?? null)) {
                  node.srcObject = stream ?? null;
                }
              }}
              autoPlay
              playsInline
              muted
              onLoadedData={() => setReady(true)}
              // Sem espelhar: o que aparece aqui é exatamente a foto salva.
              className="size-full object-cover"
            />
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            <X aria-hidden="true" />
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={capture}
            disabled={!ready || !!message}
          >
            <Camera aria-hidden="true" />
            Capturar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

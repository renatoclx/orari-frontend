// Reduz a foto no próprio celular antes de enviar: a câmera do iPhone passa
// fácil dos 2 MB do limite. Mesmo lado maior da câmera da clínica (960 px).
const MAX_SIDE = 960;
const QUALITY = 0.85;

/** Medidas para caber em `maxSide` mantendo a proporção (nunca aumenta). */
export function fitInside(
  width: number,
  height: number,
  maxSide = MAX_SIDE,
): { width: number; height: number } {
  const scale = Math.min(1, maxSide / Math.max(width, height));
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

/** A foto como JPEG reduzido, pronta para enviar (só no navegador). */
export async function resizePhoto(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const { width, height } = fitInside(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error("Não foi possível ler a foto.")),
      "image/jpeg",
      QUALITY,
    ),
  );
}

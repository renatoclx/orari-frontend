/** Campo de texto de um FormData, sem espaços nas pontas ("" se não houver). */
export function formText(data: FormData, key: string): string {
  const value = data.get(key);
  return typeof value === "string" ? value.trim() : "";
}

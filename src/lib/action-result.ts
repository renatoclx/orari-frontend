import { ApiError } from "@/services/api";

/** Falha de uma Server Action, pronta para a tela mostrar. */
export type ActionFailure<Field extends string = string> = {
  ok: false;
  message: string;
  /** Campo do formulário a que o erro se refere, quando houver. */
  field?: Field;
};

/**
 * Transforma o erro de uma chamada à API em falha de ação. Erros inesperados
 * (e o redirect do Next, que também é lançado como erro) são relançados.
 *
 * `conflictField`: campo que recebe a mensagem quando a API responde 409
 * (ex.: documento ou nome já existente).
 */
export function failureFrom<Field extends string>(
  error: unknown,
  conflictField?: Field,
): ActionFailure<Field> {
  if (!(error instanceof ApiError)) throw error;

  return {
    ok: false,
    message: error.message,
    ...(error.status === 409 && conflictField && { field: conflictField }),
  };
}

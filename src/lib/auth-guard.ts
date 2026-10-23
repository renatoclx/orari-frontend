// Sem "server-only": o proxy usa este arquivo.

/**
 * A proteção das rotas vale sempre em produção. `AUTH_GUARD=off` só desliga em
 * desenvolvimento: se a variável escapar para o servidor, as rotas continuam
 * pedindo login.
 */
export function isAuthGuardEnabled(env: {
  AUTH_GUARD?: string;
  NODE_ENV?: string;
}): boolean {
  if (env.NODE_ENV === "production") return true;
  return env.AUTH_GUARD !== "off";
}

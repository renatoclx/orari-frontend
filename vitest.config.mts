import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Testes das funções puras (utils, validações, cálculos). Ficam ao lado do
// código, como no backend: `arquivo.spec.ts`.
export default defineConfig({
  resolve: {
    alias: {
      // Mesmo atalho do tsconfig (`@/` = `src/`).
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // `server-only` quebra de propósito fora do servidor do Next; nos testes
      // ele vira um módulo vazio, para os services poderem ser importados.
      "server-only": fileURLToPath(
        new URL("./vitest.server-only.stub.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.spec.ts", "src/types/**"],
    },
  },
});

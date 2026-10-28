import { defineConfig } from "@playwright/test";

// Testes de fumaça (ponta a ponta): abrem as telas num navegador de verdade e
// conferem o que os testes de função não enxergam (layout, modais, dicas).
//
// Rodam contra o app JÁ NO AR (`npm run dev` + a API, com os dados de uma
// empresa de demonstração); não sobem servidor. Use um login de ADMIN:
//   E2E_EMAIL=... E2E_PASSWORD=... npm run test:e2e
// O Chrome é o do computador (`channel: "chrome"`), então não baixa navegador.
const email = process.env.E2E_EMAIL;
const password = process.env.E2E_PASSWORD;
if (!email || !password) {
  throw new Error(
    "Defina E2E_EMAIL e E2E_PASSWORD (um ADMIN da empresa de demonstração).",
  );
}

export default defineConfig({
  testDir: "./e2e",
  // `.e2e.ts` para o Vitest (`*.spec.ts`) não pegar estes arquivos.
  testMatch: ["**/*.e2e.ts", "**/auth.setup.ts"],
  // O login tem limite de tentativas: um processo só, e o login uma vez só.
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    channel: "chrome",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "setup", testMatch: "**/auth.setup.ts" },
    {
      // iPhone 13 Pro com as barras do Safari: 390 x 664 de área útil.
      name: "celular",
      testMatch: "**/*.e2e.ts",
      dependencies: ["setup"],
      use: {
        storageState: ".auth/user.json",
        viewport: { width: 390, height: 664 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2,
      },
    },
    {
      name: "computador",
      testMatch: "**/*.e2e.ts",
      dependencies: ["setup"],
      use: {
        storageState: ".auth/user.json",
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});

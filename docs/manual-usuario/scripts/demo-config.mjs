// Clínica de demonstração usada nas imagens do manual (dados fictícios).
export const DEMO = {
  email: "helena@bemestar.demo",
  password: process.env.DEMO_PASSWORD ?? "Demo#Manual2026",
  today: "2026-10-23",
};

// Empresa das imagens do manual de turmas (manual-turmas.html), com dados de demonstração.
export const AURORA = {
  email: "marina@studioaurora.demo",
  password: process.env.AURORA_PASSWORD ?? "Aurora#2026",
};

// Cliente fictícia das imagens do manual do app (manual-app.html). A conta é
// criada pelo cap-9-app.mjs e apagada depois das capturas (README, passo 8).
export const AURORA_APP = {
  name: "Ana Demo",
  phone: "31990009999",
  password: process.env.AURORA_APP_PASSWORD ?? "AnaDemo#2026",
};

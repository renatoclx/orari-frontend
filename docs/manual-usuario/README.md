# Manual do usuário (PDF)

Gera `manual-usuario.pdf` (A4, pt-BR) a partir de `manual.html` + `manual.css`,
com capturas de tela de uma clínica fictícia ("Clínica Bem-Estar").
`images/` e o PDF não vão para o git (`.gitignore`): são regenerados.

## Regenerar

1. Banco local de desenvolvimento, API (3333) e frontend (`npm run dev`, 3000) no ar.
2. Dados fictícios: `demo/demo-1.mjs`, `demo-2.mjs`, `demo-3.mjs` (nessa ordem;
   usam `lib-api.mjs`, `lib-demo.mjs` e `avatars.mjs`).
3. Chrome com depuração remota: `google-chrome --headless=new --remote-debugging-port=9333`.
4. Capturas: `node scripts/cap-1-inicio.mjs` … `cap-5-financeiro.mjs` (gravam em `images/`).
5. PDF: `node build.mjs` (precisa de `google-chrome`, `pdftotext` e `pdfinfo`).

O sumário é numerado pelo `build.mjs` em duas passadas. Textos: `manual.html`.

## O que muda e por quê

<!-- Uma ou duas frases. Qual problema resolve? -->

## Como foi verificado

<!-- O que você viu na tela, com a API real. Celular (390 px), tema escuro, estados vazio/erro. -->

## Depende do backend?

- [ ] Não
- [ ] Sim: PR/branch do backend: ______ (mergear e publicar o backend **antes** deste)

## Checklist (ver "Definição de pronto" em `docs/frontend-rules.md`)

- [ ] `npm run lint`, `npx tsc --noEmit` e `npm test` passam
- [ ] `npm run test:e2e` passa (obrigatório se mexeu em layout, diálogo ou botão)
- [ ] Celular (390 px): sem rolagem lateral; modais cabem; botões na regra do celular
- [ ] Tema escuro conferido
- [ ] Rota ou diálogo novo incluído em `e2e/smoke.e2e.ts`
- [ ] `docs/screens/<tela>.md` atualizado (e a skill `orari-ui`, se mudou um padrão)
- [ ] Manual do usuário revisto, se uma tela que ele mostra mudou

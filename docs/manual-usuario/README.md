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
6. Manual de Turmas (`manual-turmas.pdf`): usa o "Studio Aurora" (login em
   `scripts/demo-config.mjs`, `AURORA`). Capturas com `node scripts/cap-7-turmas.mjs`
   (só abre telas; não grava nada), `scripts/cap-8-encaixe-turma.mjs` (imagem 103, também sem gravar) e PDF com `node build.mjs manual-turmas`.
7. Tela **Ajuda** do sistema: depois de regerar um PDF, copie-o para
   `public/manuais/` (`manual-usuario.pdf` vai como `manual-administrador.pdf`;
   os outros com o mesmo nome) e faça o commit. A lista da tela fica em
   `src/components/help/manuals.ts`.

8. Manuais do Portal do cliente, do app do cliente e de Mensagens
   (`manual-portal.pdf`, `manual-app.pdf`, `manual-mensagens.pdf`), no "Studio Aurora":
   - ligue "Aparecer na busca" do Aurora (com um segmento) só durante as capturas;
   - `node scripts/cap-9-app.mjs conta`: **grava** a conta da cliente fictícia
     "Ana Demo" (`AURORA_APP`, telefone de teste 31990009999), a entrada no Aurora
     e um agendamento; ponha avisos de exemplo na caixa dela (`client_messages`) e
     rode `node scripts/cap-9-app.mjs avisos`;
   - `node scripts/cap-10-portal-mensagens.mjs`: telas da clínica (gera um link de
     acesso da Ana; a mensagem de Enviar não é enviada);
   - depois, **apague tudo o que é da Ana** (conta, sessões, avisos, o cadastro no
     Aurora com contato, link e agendamento) e volte a busca do Aurora como estava;
   - PDFs: `node build.mjs manual-portal`, `manual-app` e `manual-mensagens`.

O sumário é numerado pelo `build.mjs` em duas passadas. Textos: `manual.html`.

9. Manuais de Relatórios e Dashboard, de Comissões e de Contas a pagar
   (`manual-relatorios.pdf`, `manual-comissoes.pdf`, `manual-contas-a-pagar.pdf`):
   - **Relatórios** e as imagens 28, 29 e 33 do manual do administrador:
     `node scripts/cap-11-relatorios.mjs`, na Clínica Bem-Estar, período de
     outubro de 2026. **Só leitura** (abre telas e fecha os diálogos sem salvar).
   - **Comissões e Contas a pagar**: `node scripts/cap-12-comissoes-contas.mjs`, no
     Studio Aurora. Antes: comissões **em aberto** de um profissional (o roteiro usa
     a Camila Rocha), fornecedores com nomes de demonstração (CNPJ e categoria
     principal) e clientes com nomes fictícios em todas as telas. O roteiro
     **grava um fechamento** (para a "Comissão fechada", o recibo e a conta
     gerada); depois, apague o fechamento, a conta paga dele e o que foi criado
     para as capturas, e volte os nomes como estavam.
   - O recorte do menu ⋮ (`f08-mais-acoes.png`) sai pelo Playwright, com clique
     real: pelo CDP o menu abre no canto da tela.
   - PDFs: `node build.mjs manual-relatorios`, `manual-comissoes` e
     `manual-contas-a-pagar`; copie-os para `public/manuais/`.

10. Avisos, sino e Primeiros passos (imagens `n01`, `n02`, `m01`, `m04`, `m05`, `a06`,
    `a07`, `a14` e `pro-13` a `pro-15`, nos manuais do administrador, de Mensagens, do
    app do cliente e do app do profissional): `node scripts/cap-13-avisos.mjs`, com
    `DATABASE_URL` do banco local e a conta de um cliente de teste em
    `CLIENT_PHONE` e `CLIENT_PASSWORD`. Usa o Playwright (Studio Aurora e Clínica
    Nova Teste). **Insere avisos de exemplo** (e esconde os existentes durante a
    captura) e **apaga/restaura tudo** ao terminar; não grava agendamento nem mensagem.
    A tela de entrar do app (`a01` e `pro-01`) é uma captura simples de `/app/entrar`.

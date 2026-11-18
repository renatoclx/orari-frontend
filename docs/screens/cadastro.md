# Cadastro sozinho

A empresa cria a própria conta pela landing e começa um **teste grátis de 7 dias**, sem cartão. As regras estão no backend (`docs/business-rules/empresa-e-acesso.md`, "Cadastro sozinho").

## Acesso

- Rota pública `/cadastro` (mesmo layout do login: formulário à esquerda, painel da marca à direita). Com sessão, vai para o sistema, como o login.
- O plano chega da landing: `/cadastro?plano=essencial`, `?plano=plus` ou `?plano=clinical` (sem ele, o Plus).
- No login, abaixo do botão: "Ainda não usa o Orari? **Teste grátis por 7 dias**".

## Formulário

- **Plano do teste**: três botões de escolha (`aria-pressed`) com o nome, o mensal e uma linha do que inclui; embaixo, "7 dias grátis, sem cartão".
- **Nome do negócio**, **CPF ou CNPJ** (máscara; dígitos conferidos na tela), **Seu nome**, **E-mail** e **Celular (WhatsApp)** lado a lado, **Senha** (8 a 72 caracteres, com mostrar/esconder) e o **aceite** dos termos de uso e da política de privacidade (links abrem em nova aba). Todos obrigatórios.
- Botão **Começar o teste grátis** (`Rocket`, "Criando sua conta…" enquanto envia) e "Já tem conta? Entrar".
- Erros: cada campo com a sua mensagem; e-mail ou documento já usados aparecem no próprio campo (409 da API); muitos cadastros da mesma conexão (429) aparecem num aviso geral.
- Com sucesso, a Server Action grava a sessão e abre o **Dashboard** com as boas-vindas "Sua conta está pronta: o teste grátis de 7 dias começou." e os **primeiros passos** abertos.

## O que nasce

- A empresa (o nome vira a razão social e o subdomínio), com os **acessos e limites do plano**, o celular e o e-mail como contato principal, e o usuário **ADMIN**.
- A **assinatura em teste**: o plano escolhido, mensal, no valor da tabela, com o fim do teste em hoje + 6 (7 dias contando hoje). A faixa do teste aparece no topo (`layout.md`, "Aviso da assinatura"), e a empresa aparece no Painel e em Assinaturas do SUPER_ADMIN.

## Termos e privacidade

- Páginas públicas `/termos` e `/privacidade` (layout próprio, largura de leitura), com o aviso "Rascunho em revisão" enquanto os textos não forem revisados. Os trechos `[A DEFINIR]` dependem de dados do Orari (razão social, CNPJ, contato, foro, prazo de guarda dos dados após o cancelamento).

## Pendências

- Confirmação do e-mail e "esqueci a senha" dependem de um serviço de envio de e-mail (decidido em 2026-11-17: lançar sem).
- Os botões da landing devem apontar para `https://app.orariapp.com.br/cadastro?plano=<plano>`.

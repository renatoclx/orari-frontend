# App do cliente

App que o **cliente** usa para agendar nos seus estabelecimentos (rota `/app`). Sempre **escuro**, feito para o celular (no computador, uma coluna centralizada), na direção do AppBarber. A sessão é própria, separada da clínica (`frontend-auth.md`, "App do cliente").

> Feitas: 7b1 (entrar, criar conta, link de acesso, Início e Menu) e a instalação no celular com o splash (antecipada da 7b5). Próximas: Buscar e página do estabelecimento (7b2), Agendar (7b3), Agendamentos e o resto do Menu (7b4).

## Telas abertas (sem entrar)

### Entrar (`/app/entrar`)

- **Telefone** (com máscara) e **Senha**; botão **Entrar**.
- Erro: "Telefone ou senha incorretos." (a mesma mensagem com ou sem conta).
- Link **Criar conta** e a dica: "Esqueceu a senha? Peça ao estabelecimento um novo link de acesso: com ele, você cria uma senha nova."
- Avisos: "Sua sessão terminou. Entre de novo." (`?expirou=1`) e "Você saiu do app." (`?saiu=1`).
- Já entrado: vai para o Início.

### Criar conta (`/app/criar-conta`)

- **Nome**, **Telefone (com DDD)**, **Senha (mínimo de 8 caracteres)** e **Confirmar a senha**; botão **Criar conta**.
- Erros no campo (nome, telefone com 10 ou 11 dígitos, senha de 8 a 72, confirmação igual). Telefone já usado: a mensagem da API ("Já existe uma conta com este telefone…").
- A conta nasce sem estabelecimentos. Depois de criar, Início com "Conta criada. Boas-vindas ao Orari!".

### Link de acesso (`/app/acesso/<token>`)

O link que a clínica gera (lista de Clientes, ícone de QR code; `pessoas.md`). A tela confere o link **sem usá-lo**; só o envio o usa (uma vez só).

- Topo: logo (ou iniciais) e nome do estabelecimento, "Olá, <primeiro nome>".
- Três casos:
  - **Sem conta** ("Crie uma senha para entrar no app…"): Telefone (só se a clínica não tem o telefone do cliente), Senha e Confirmar; botão **Criar senha e entrar**.
  - **Já tem conta** ("Crie uma senha nova para ela"): Senha nova e Confirmar; botão **Salvar a senha nova** (é o "esqueci a senha"; os outros aparelhos saem).
  - **Já entrado no app**: botão **Adicionar à minha conta**.
- Link inválido, usado ou vencido: a mensagem da API e "Já tenho conta: entrar".

## Telas de quem entrou

Barra de navegação embaixo, do app inteiro: **Início** e **Menu** (Buscar e Agendamentos entram quando existirem).

### Início (`/app`)

- "Olá <primeiro nome>" (o nome em azul) e a data ("Quinta, 5 nov 2026").
- **Próximo agendamento**: o mais próximo de todos os estabelecimentos (serviço; "Qui, 12/11 às 08:00 · profissional", no relógio da clínica; estabelecimento). Sem nenhum: "Nenhum agendamento marcado."
- **Meus locais**: logo (ou iniciais) e nome. Sem nenhum: "Você ainda não tem estabelecimentos. Peça o link de acesso ao seu estabelecimento."

### Menu (`/app/menu`)

- Iniciais, nome e telefone da conta.
- **Sair deste aparelho**: volta a Entrar com "Você saiu do app.".

## Instalar no celular

- **Manifesto só do app** (`/app/manifest.webmanifest`, Route Handler): nome "Orari", abre em `/app`, escopo `/app`, tela cheia (`standalone`), retrato. O painel da clínica não tem manifesto e não vira app instalável.
- **Ícones** (`public/app-assets/`): fundo na cor da logo (`#00B8DB`) e o símbolo em branco gelo (`#F4F4F5`), dentro da área segura (o Android pode recortar em círculo): 192, 512 (também `maskable`) e o `apple-touch-icon` de 180 para o iPhone. Ficam fora de `/app` porque o proxy protege tudo o que começa com `/app`.
- **iPhone:** Safari → Compartilhar → "Adicionar à Tela de Início" (o iPhone não mostra aviso de instalar). Marcas próprias: `apple-mobile-web-app-capable`, título "Orari" e a barra de status por cima do app (`black-translucent`; o layout desconta a área do entalhe com `env(safe-area-inset-*)`).
- **Android:** o Chrome oferece "Instalar app" **só em HTTPS** (em produção). Pelo IP do computador (`http://…`), não aparece.
- **Splash** (`AppSplash`): ao abrir o app **instalado**, fundo `#00B8DB` com o símbolo em cima e "orari" embaixo, em branco gelo; sai em cerca de 1 segundo (sem animação para quem pede menos movimento). Não aparece no navegador (CSS `display-mode: standalone`). No Android, antes dele, o sistema mostra o próprio splash com a mesma cor (`background_color` do manifesto).
- Sem service worker por enquanto (abrir sem internet e notificações ficam para depois; a instalação não depende dele).

## Testar no celular (desenvolvimento)

- Celular e computador na mesma rede. Abra o painel da clínica pelo IP do computador (ex.: `http://172.20.10.2:3000`), não por `localhost`: o link de acesso e o QR são montados com o endereço aberto.
- O `next.config.ts` libera as faixas de rede local em `allowedDevOrigins` (só vale em desenvolvimento). Sem isso, o Next bloqueia os scripts de desenvolvimento quando a página vem pelo IP, e nada responde (menus, máscaras, botões). Mudou o `next.config.ts`: reinicie o `npm run dev`.

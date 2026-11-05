# App do cliente

App que o **cliente** usa para agendar nos seus estabelecimentos (rota `/app`). Cor de destaque: o **ciano da logo** (`#00B8DB`, com texto escuro sobre ele; a clínica continua azul). Sempre **escuro**, feito para o celular (no computador, uma coluna centralizada), na direção do AppBarber. A sessão é própria, separada da clínica (`frontend-auth.md`, "App do cliente").

> Feitas: 7b1 (entrar, criar conta, link de acesso, Início e Menu), a instalação no celular com o splash (antecipada da 7b5), 7b2 (Buscar e página do estabelecimento), 7b3 (Agendar), 7b4 (Agendamentos e Menu) e Meus dados, Pacotes e Recorrências. O app do cliente está completo para a primeira versão. Depois: **Avisos** (8b, módulo Mensagens).

## Telas abertas (sem entrar)

### Entrar (`/app/entrar`)

- **Telefone** (com máscara) e **Senha**; botão **Entrar**.
- Erro: "Telefone ou senha incorretos." (a mesma mensagem com ou sem conta).
- `?voltar=<caminho do app>` (vindo da página de um estabelecimento): depois de entrar, volta para ela; o link Criar conta leva o mesmo `voltar`. Só caminhos de `/app/` são aceitos.
- Link **Criar conta** e a dica: "Esqueceu a senha? Peça ao estabelecimento um novo link de acesso: com ele, você cria uma senha nova."
- Avisos: "Sua sessão terminou. Entre de novo." (`?expirou=1`) e "Você saiu do app." (`?saiu=1`).
- Já entrado: vai para o Início.

### Criar conta (`/app/criar-conta`)

- **Nome**, **Telefone (com DDD)**, **Senha (mínimo de 8 caracteres)** e **Confirmar a senha**; botão **Criar conta**.
- Erros no campo (nome, telefone com 10 ou 11 dígitos, senha de 8 a 72, confirmação igual). Telefone já usado: a mensagem da API ("Já existe uma conta com este telefone…").
- A conta nasce sem estabelecimentos. Depois de criar, Início com "Conta criada. Boas-vindas ao Orari!" (ou, com `?voltar=`, de volta à página do estabelecimento).

### Link de acesso (`/app/acesso/<token>`)

O link que a clínica gera (lista de Clientes, ícone de QR code; `pessoas.md`). A tela confere o link **sem usá-lo**; só o envio o usa (uma vez só).

- Topo: logo (ou iniciais) e nome do estabelecimento, "Olá, <primeiro nome>".
- Três casos:
  - **Sem conta** ("Crie uma senha para entrar no app…"): Telefone (só se a clínica não tem o telefone do cliente), Senha e Confirmar; botão **Criar senha e entrar**.
  - **Já tem conta** ("Crie uma senha nova para ela"): Senha nova e Confirmar; botão **Salvar a senha nova** (é o "esqueci a senha"; os outros aparelhos saem).
  - **Já entrado no app**: botão **Adicionar à minha conta**.
- Link inválido, usado ou vencido: a mensagem da API e "Já tenho conta: entrar".

## Telas de quem entrou

Barra de navegação embaixo, do app inteiro: **Início**, **Buscar** (marcada também na página de um estabelecimento), **Agendamentos** e **Menu** (marcada também nas telas abertas por ele). Com aviso não lido, um ponto ciano na aba Menu (some na tela Avisos).

### Início (`/app`)

- "Olá <primeiro nome>" (o nome em azul) e a data ("Quinta, 5 nov 2026").
- **Próximo agendamento**: o mais próximo de todos os estabelecimentos (serviço; "Qui, 12/11 às 08:00 · profissional", no relógio da clínica; estabelecimento). Sem nenhum: "Nenhum agendamento marcado."
- **Convite para os avisos** (com os avisos ligados no servidor), enquanto não estão ativados neste aparelho: "Receba lembretes dos seus horários", "Ative os avisos e saiba antes de cada agendamento." e **Ativar avisos** (ativado: "Avisos ativados. Você vai receber os lembretes dos seus horários."). No iPhone pelo Safari: "No iPhone, os avisos chegam pelo app instalado na tela de início." e **Ver como instalar** (leva a Avisos). O **X** fecha o convite neste aparelho; com os avisos bloqueados, não aparece.
- Depois de agendar (`?agendado=1`): "Agendamento confirmado. Ele aparece abaixo, em Próximo agendamento."
- **Meus locais**: logo (ou iniciais) e nome (tocar abre a página do estabelecimento) e o botão **Agendar**, que vai direto para a tela de agendar. Sem nenhum: "Você ainda não tem estabelecimentos. Encontre um em Buscar ou peça o link de acesso ao seu estabelecimento."

### Buscar (`/app/buscar`)

- Campo "Pesquise pelo nome" (o `ListSearch` da clínica, no tamanho grande): busca durante a digitação, a partir de 2 letras, pelo nome fantasia ou pela razão social, sem diferença de acentos.
- Cada resultado: logo (ou iniciais), nome e "segmento · cidade"; tocar abre a página do estabelecimento.
- Só aparecem os estabelecimentos com o portal ligado e "Aparecer na busca" (`portal-do-cliente.md`). Antes de digitar: "Encontre um estabelecimento pelo nome."; sem resultado: "Nenhum estabelecimento encontrado para “…”".

### Página do estabelecimento (`/app/local/<subdomínio>`)

- É o **Endereço no app** que a clínica divulga: abre **com ou sem** a conta.
- Topo: logo (ou iniciais), nome e "segmento · cidade". Embaixo, os **Serviços** que aparecem no app (com profissional ligado): nome, duração, preço e descrição.
- **Sem a conta:** "Entre ou crie sua conta para agendar aqui." e os botões **Entrar** e **Criar conta** (voltam para esta página).
- **Com a conta, sem ser cliente:** "Você ainda não é cliente daqui. Ao entrar, o estabelecimento recebe o seu nome e telefone." e **Entrar neste estabelecimento**: cria um cadastro novo na clínica, **não confirmado** (até 2 agendamentos futuros até a clínica confirmar; `pessoas.md`). Depois: "Pronto, você agora é cliente de …".
- **Já cliente:** o botão **Agendar** (se há serviços no app) e a vitrine.
- Erro ao montar uma tela (ex.: a API fora do ar): "Não foi possível abrir esta tela", escura, com **Tentar de novo**.
- Estabelecimento inexistente, com o portal desligado ou fora do plano: a página "Não encontramos esta página", escura e com o botão **Buscar estabelecimentos** (vale para qualquer endereço do app que não existe).

### Agendamentos (`/app/agendamentos`)

- De **todos** os estabelecimentos da conta. Abas **Próximos** e **Anteriores** (`?aba=`); com dois ou mais estabelecimentos, a lista "Filtrar por estabelecimento" (nativa do celular; `?local=`).
- Cartão: serviço, "Sex, 06/11 às 08:00 · profissional" (no relógio da clínica) e o estabelecimento. Pacote, turma e horário fixo têm um selo ("Pacote", "Turma", "Horário fixo"). Nos anteriores, a situação: Concluído, Cancelado ou Não compareceu.
- **Cancelar** (só avulso, dentro do prazo da clínica): confirma **no próprio cartão** ("Cancelar este agendamento?", **Manter** ou **Cancelar**), porque os diálogos da clínica ficam fora da área escura do app. Cancelado: some da lista, e o Início é atualizado.
- Sem poder cancelar: "Fora do prazo para cancelar pelo app. Fale com o estabelecimento." (avulso) ou "Para cancelar ou remarcar, fale com o estabelecimento." (pacote, turma, horário fixo).
- Vazio: "Nenhum agendamento" com "Você não tem agendamentos marcados." ou "Nenhum atendimento anterior.".

### Menu (`/app/menu`)

- Foto (ou iniciais), nome e telefone da conta.
- Linhas no estilo do AppBarber (ícone, título, explicação e seta), com espaço generoso para o dedo:
  - **Avisos** · Lembretes e mensagens dos estabelecimentos → `/app/menu/avisos`, com o número de não lidos.
  - **Meus dados** · Altere as informações do seu perfil → `/app/menu/dados`.
  - **Pacotes** · Acompanhe seus pacotes → `/app/menu/pacotes`.
  - **Recorrências** · Seus horários fixos e turmas → `/app/menu/recorrencias`.
  - **Segurança** · Altere sua senha de acesso → `/app/menu/senha` (Senha atual, Senha nova e Confirmar; senha atual errada no campo; trocada: "Senha trocada. Os outros aparelhos saíram da sua conta.").
  - **Sair** · Só deste aparelho.
- Telas abertas pelo Menu têm "‹ Menu" no topo.

### Meus dados (`/app/menu/dados`)

- **Foto**: **Adicionar foto** / **Trocar foto** abre a escolha do celular (tirar na hora ou galeria, no Android e no iPhone) e **Remover**. A foto é reduzida no próprio celular (lado maior de 960 px, JPEG) e vale na hora, sem esperar o Salvar; trocar a foto não apaga o que já foi digitado.
- **Dados pessoais**: Nome, CPF (opcional, com máscara), Data de nascimento (opcional; o seletor de data do celular) e Profissão (opcional).
- **Contato**: Telefone (com DDD) e E-mail (opcional). Mudou o telefone (o login): aparece **Senha atual (para trocar o telefone)**.
- **Endereço (opcional)**: o **CEP** preenche rua, bairro e cidade (a cidade não é digitada); Número, Complemento e Bairro. CEP não encontrado: o aviso abaixo do campo.
- Abaixo: "Ao salvar, seus dados também são atualizados nos estabelecimentos em que você é cliente." e **Salvar**. Salvo: Menu com "Dados salvos. Eles também foram atualizados nos seus estabelecimentos.".
- Erros no campo: nome, telefone, e-mail, CPF inválido, nascimento no futuro, endereço incompleto, senha atual, CPF já em outro cadastro de uma clínica (a mensagem da API).
- As observações do cadastro na clínica não aparecem no app.

### Avisos (`/app/menu/avisos`)

- **Avisos neste aparelho** (some com os avisos desligados no servidor):
  - iPhone pelo Safari: "No iPhone, os avisos chegam pelo app instalado na tela de início." e o passo a passo (Compartilhar → Adicionar à Tela de Início → abrir pelo ícone e ativar aqui).
  - Navegador sem suporte: "Este navegador não recebe avisos. No Android, use o Chrome; no iPhone, instale o app (iOS 16.4 ou mais novo)."
  - Não ativados: **Ativar avisos** (o pedido de permissão do celular abre no toque). Pedido fechado sem resposta: "Toque em Permitir quando o celular perguntar."
  - Bloqueados: "Os avisos estão bloqueados neste aparelho." e onde liberar (iPhone: Ajustes → Notificações → Orari; Android: configurações do aparelho ou o cadeado do Chrome).
  - Ativados: "Ativados neste aparelho.", **Testar** (resposta: "Aviso de teste enviado. Ele chega em alguns segundos."; nenhum aparelho: "Nenhum aparelho recebeu. Desative e ative os avisos de novo.") e **Desativar**.
  - Interruptores da conta, que valem em todos os aparelhos: **Lembretes e agendamentos** ("Antes do horário e quando a clínica marca, muda ou cancela") e **Novidades e promoções** ("Aniversário e mensagens dos estabelecimentos"). Mudam na hora; recusados, voltam com o aviso.
- **Recebidos**: logo (ou iniciais) da clínica, título, "Hoje, 14:30" / "Ontem, 09:00" / "03/11, 18:15", o texto, a clínica (quando o título não é o nome dela) e um ponto nos novos. O aviso de teste vem do "Orari", com o símbolo. Tocar num aviso com destino (ex.: um lembrete) abre a tela dele. Sem nenhum: "Nenhum aviso por enquanto." Mostra os 50 mais recentes.
- Abrir a tela marca todos como lidos (o destaque dos novos fica até sair dela).
- **A notificação no celular**: título e texto do aviso, ícone do Orari; tocar abre o app no destino do aviso (reaproveitando o app aberto). Quem mostra é o service worker (ver "Instalar no celular").

### Pacotes (`/app/menu/pacotes`)

- Só para ver ("Para contratar ou mudar, fale com o estabelecimento."). Cada pacote: nome do plano, selo da situação (**Ativo** verde, **Encerrado** cinza, **Cancelado** vermelho), "De dd/mm/aaaa a dd/mm/aaaa" e o estabelecimento. Sem valores. Ativos primeiro.

### Recorrências (`/app/menu/recorrencias`)

- Só para ver ("Para mudar, fale com o estabelecimento."). Cada uma: serviço, selo (**Turma**, **Pacote** ou **Horário fixo**), os dias e horários juntando os iguais ("Ter e Qui às 09:00"), profissional · estabelecimento e o período ("De … a …" ou "Desde …").

### Agendar (`/app/local/<subdomínio>/agendar`)

- Só para quem já é cliente do estabelecimento: sem a conta, vai a Entrar e volta; sem ser cliente, volta à página do estabelecimento.
- Topo: "‹ <estabelecimento>" (volta à página dele) e o título **Agendar**.
- Uma página só, que se completa conforme as escolhas (mudar uma apaga as que dependem dela):
  1. **Serviço**: cartões com nome, duração e preço.
  2. **Profissional**: quem atende o serviço; com um só, já vem escolhido.
  3. **Dia**: faixa que rola de lado (dia da semana, número e mês), de hoje até os **dias à frente** da clínica (no máximo 60). Começa em hoje.
  4. **Horário · <dia por extenso>**: os horários livres do dia, calculados no servidor com as regras da clínica (antecedência, janelas, compromissos e turmas), agrupados em **Manhã**, **Tarde** e **Noite** (com a quantidade), 3 por linha, com contorno azul; o escolhido fica preenchido. Sem horário: "Nenhum horário livre neste dia. Escolha outro dia."
- Escolha de serviço, profissional, dia e horário: contorno e, escolhido, preenchido em azul (`aria-pressed`).
- **Confirmar <dia>, <dd/mm> às <hh:mm>**: preso embaixo, logo acima da barra de navegação. Agendado: Início com o aviso.
- Recusas da API aparecem no topo: horário que deixou de estar livre (e os horários são buscados de novo) e o limite do cliente não confirmado ("Até o estabelecimento confirmar o seu cadastro, você pode ter no máximo 2 agendamentos futuros.").
- Só avulsos: recorrências, pacotes e turmas continuam sendo marcados pela clínica.

## Instalar no celular

- **Manifesto só do app** (`/app/manifest.webmanifest`, Route Handler): nome "Orari", abre em `/app`, escopo `/app`, tela cheia (`standalone`), retrato. O painel da clínica não tem manifesto e não vira app instalável.
- **Ícones** (`public/app-assets/`): fundo na cor da logo (`#00B8DB`) e o símbolo em branco gelo (`#F4F4F5`), dentro da área segura (o Android pode recortar em círculo): 192, 512 (também `maskable`) e o `apple-touch-icon` de 180 para o iPhone. Ficam fora de `/app` porque o proxy protege tudo o que começa com `/app`.
- **iPhone:** Safari → Compartilhar → "Adicionar à Tela de Início" (o iPhone não mostra aviso de instalar). Marcas próprias: `apple-mobile-web-app-capable`, título "Orari" e a barra de status por cima do app (`black-translucent`; o layout desconta a área do entalhe com `env(safe-area-inset-*)`).
- **Android:** o Chrome oferece "Instalar app" **só em HTTPS** (em produção). Pelo IP do computador (`http://…`), não aparece.
- **Splash** (`AppSplash`): ao abrir o app **instalado**, fundo `#00B8DB` com o símbolo em cima e "orari" embaixo, em branco gelo; sai em cerca de 1 segundo (sem animação para quem pede menos movimento). Não aparece no navegador (CSS `display-mode: standalone`). No Android, antes dele, o sistema mostra o próprio splash com a mesma cor (`background_color` do manifesto).
- **Service worker** (`public/app-assets/sw.js`), registrado ao ativar os avisos, só para `/app/` (o `next.config.ts` manda `Service-Worker-Allowed: /app/` e sem cache). Só mostra as notificações e abre o app ao tocar; não guarda nada em cache (o app continua precisando de internet). Avisos só em HTTPS (em produção) ou em `localhost`; pelo IP do computador (`http://…`), não.
- Ao abrir o app com os avisos já permitidos, a inscrição do aparelho é enviada de novo à API: quem saiu e entrou no mesmo celular volta a receber sem ativar outra vez.

## Testar no celular (desenvolvimento)

- Celular e computador na mesma rede. Abra o painel da clínica pelo IP do computador (ex.: `http://172.20.10.2:3000`), não por `localhost`: o link de acesso e o QR são montados com o endereço aberto.
- O `next.config.ts` libera as faixas de rede local em `allowedDevOrigins` (só vale em desenvolvimento). Sem isso, o Next bloqueia os scripts de desenvolvimento quando a página vem pelo IP, e nada responde (menus, máscaras, botões). Mudou o `next.config.ts`: reinicie o `npm run dev`.

## Pendências

- **Confirmar o telefone** ao trocá-lo em Meus dados: hoje pede a senha atual; o código no WhatsApp confirmaria que o número novo é do cliente.
- **Recuperar a senha pelo próprio app**: hoje é pelo link da clínica; o código no WhatsApp resolve (etapa 3).
- **Abrir sem internet**: o service worker existe, mas não guarda as telas.
- **Avisos além dos 50 mais recentes**: a tela não pagina.
- **Número no ícone do app** (Badging API) com os não lidos: não feito.

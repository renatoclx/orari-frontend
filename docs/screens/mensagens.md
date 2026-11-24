# Mensagens

Avisos que a clínica manda ao cliente pelo **app do Orari** (notificação push). Regras completas no backend: `business-rules.md`, "Mensagens automáticas" e "Avisos do app".

> Feitas: **Automáticas** (8d) e **Enviar** (8e), em 2026-11-06.

## Acesso

- Grupo **Mensagens** no menu lateral, logo depois do Portal do cliente e antes da Ajuda, com os subitens **Ao cliente** (`/mensagens/clientes`), **Ao profissional** (`/mensagens/profissionais`), **Ao administrador** (`/mensagens/administradores`) e **Enviar** (`/mensagens/enviar`).
- Só para o **ADMIN** e só com a funcionalidade **Mensagens** no plano (matriz de acessos, `empresas.md`; ela exige o Portal do cliente). Os demais veem a página "não encontrada", e a API recusa (403).
- Sem a ação **Edita**: tudo só leitura, sem os botões de variável e sem o rodapé de salvar.

## Automáticas: uma página por quem recebe

A tela única de Automáticas ficou grande e foi **dividida por quem recebe**; cada página mostra e grava **só as situações do grupo dela** (o `PUT /auto-messages` aceita só as enviadas). O endereço antigo `/mensagens/automaticas` leva a `/mensagens/clientes`.

| Página | Rota | Situações | Aviso do topo |
| --- | --- | --- | --- |
| **Ao cliente** | `/mensagens/clientes` | Lembrete, Agendamento marcado, alterado e cancelado, Aniversário, Sentimos sua falta | o do portal (abaixo) |
| **Ao profissional** | `/mensagens/profissionais` | Lembrete do profissional, Resumo da manhã do profissional | "Chegam ao profissional que usa o app (no sino e, se ele ativar, no celular). Não dependem do portal do cliente. O texto não leva o nome do cliente." |
| **Ao administrador** | `/mensagens/administradores` | Resumo de pendências do dia | "O resumo das pendências do dia chega a quem administra a clínica (…). Só entram os itens que o plano libera, e o dia sem nenhum item com número não manda nada. Não depende do portal do cliente." |

Todas: card único que ocupa a página, com o conteúdo rolando e o rodapé fixo (como `portal-do-cliente.md`).

### Resumo de pendências do dia (Ao administrador)

- **Hora do envio:** 7h, 8h, 9h ou 10h (padrão 8h). **Itens do resumo** (caixas, padrão todas): Contas a pagar hoje, Contas atrasadas, Recebimentos atrasados, Comandas do dia e Aniversariantes, com a nota "Só entram os itens que o plano da clínica libera". Ligado sem nenhum item: "Escolha ao menos um item." no campo (e a API recusa).
- **Variáveis:** `{nome}`, `{estabelecimento}`, `{data}` e `{resumo}` (a frase pronta; exemplo: "3 contas a pagar hoje, 2 recebimentos atrasados e 4 aniversariantes"). Padrão: "Bom dia, {nome}! Hoje: {resumo}."
- Sai uma vez por dia, a partir da hora escolhida (até o meio-dia), para cada administrador; **dia sem nenhum item com número não manda nada**. Ver o bloco "Pendências de hoje" em `dashboard.md`.

### Ao cliente

- **Aviso do topo:**
  - portal ligado: "Só recebem os clientes que usam o app do Orari e deixaram os avisos ligados. Cada mensagem sai uma vez só.";
  - portal desligado (em vermelho): "O portal do cliente está desligado: nenhuma mensagem sai até ele ser ligado em Portal do cliente." (com o link).
- **Uma seção por situação**, nesta ordem, cada uma com o interruptor, o título e quando sai:

  | Situação                        | Quando sai (texto da tela)                                                             | Opção                                                                               |
  | ------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
  | Lembrete                        | Antes de cada horário marcado, nos tempos escolhidos.                                  | **Enviar antes do horário:** 30 min, 1h, 2h, 24h, 48h (caixas; padrão 24h e 30 min) |
  | Agendamento marcado             | Quando a clínica marca um horário avulso para o cliente.                               | —                                                                                   |
  | Agendamento alterado            | Quando a clínica muda a data ou o horário (alterar, remanejar ou repor).               | —                                                                                   |
  | Agendamento cancelado           | Quando a clínica cancela um horário (avulso, uma sessão ou uma sessão de turma).       | —                                                                                   |
  | Aniversário                     | No dia do aniversário, às 9h (data de nascimento do cadastro).                         | —                                                                                   |
  | Sentimos sua falta              | Às 10h, para quem não volta desde o último atendimento e não tem nada marcado.         | **Dias sem vir:** 15, 30, 45, 60 ou 90 (padrão 30)                                  |
  | Lembrete do profissional        | 30 minutos antes de cada atendimento do profissional (uma vez por sessão, nas turmas). | — (o tempo é fixo)                                                                  |
  | Resumo da manhã do profissional | Às 7h30, nos dias em que o profissional tem atendimentos.                              | — (a hora é fixa)                                                                   |

- **Avisos ao profissional:** as duas últimas situações vêm sob um cabeçalho próprio ("Avisos ao profissional": "Chegam ao profissional que usa o app (no sino e, se ele ativar, no celular). Não dependem do portal do cliente. O texto não leva o nome do cliente."). Valem para todos os profissionais com usuário no app e só dependem de **Mensagens no plano**. O aviso do topo sobre o portal desligado vale só para as mensagens ao cliente ("nenhuma mensagem ao cliente sai…").
- **Variáveis do profissional:** o lembrete usa as do agendamento (`{nome}` e `{profissional}` são o nome do profissional) **sem nome de cliente**; o resumo usa `{nome}`, `{estabelecimento}`, `{data}`, `{hora}` e `{quantidade}` (exemplo: "5 atendimentos"). Padrões: ligados, com texto pronto.

- Em cada seção:
  - **Mensagem** (caixa de texto) com o contador "87/500" (vermelho acima de 500);
  - **Inserir:** botões das variáveis da situação, que entram no lugar do cursor: `{nome}`, `{estabelecimento}` e, nas de agendamento, `{data}`, `{hora}`, `{servico}`, `{profissional}`;
  - **Exemplo:** o texto como chega, com dados fictícios (Ana, Pilates, Camila, 12/11, 09:00) e o nome da clínica.
- **Padrão de quem nunca salvou:** lembrete, as três de agendamento, as duas do profissional e o resumo do administrador ligadas; aniversário e "sentimos sua falta" desligadas, com o texto pronto.
- **Erros** (só depois de tentar salvar, no campo): "Escreva a mensagem.", "Use até 500 caracteres.", "{data} não existe nesta mensagem." e, no lembrete ligado sem tempo, "Escolha ao menos um tempo antes do horário." O toast diz "Corrija os campos destacados.".
- **Rodapé:** **Descartar alterações** e **Salvar alterações** (habilitados só com mudança). Salvo: toast "Mensagens automáticas salvas." Recusado pela API: "Não foi possível salvar as mensagens." com a mensagem dela.

## Enviar (`/mensagens/enviar`)

Mensagem escrita pela clínica (promoção, feriado, horário especial) para **todos os clientes com o app**. Card único: o formulário em cima, o histórico embaixo, o rodapé fixo.

- **Nova mensagem:** "Vai para os N clientes que usam o app do Orari (X desligaram as novidades e não recebem). Você pode enviar uma mensagem por dia."
  - **Título** (até 100; é o título da notificação) e **Mensagem** (até 500, com o contador);
  - **Inserir:** `{nome}` e `{estabelecimento}` (só essas: não há agendamento); cada cliente recebe com o próprio nome;
  - **Exemplo:** título e texto como chegam, com "Ana" e o nome da clínica.
- **Bloqueios** (em vermelho, com o formulário desligado):
  - portal desligado: "O portal do cliente está desligado: ligue-o em Portal do cliente para enviar.";
  - já enviada hoje (no dia do fuso da clínica): "Hoje já foi enviada uma mensagem. A próxima pode ser enviada amanhã.";
  - ninguém com o app: "Nenhum cliente usa o app ainda: não há para quem enviar."
- **Erros** (no campo): "Escreva o título.", "Escreva a mensagem.", "Use até 100/500 caracteres.", "{data} não existe nesta mensagem."
- **Rodapé:** **Limpar** e **Enviar**. Enviar abre a confirmação "Enviar mensagem": "A mensagem vai agora para N clientes e não pode ser desfeita. Você pode enviar uma mensagem por dia." (**Enviar** / Cancelar). Enviada: toast "Mensagem enviada para N clientes." e o formulário limpa. Recusada: "Não foi possível enviar a mensagem." com o motivo da API.
- **Enviadas:** as 20 mais recentes: título, data e hora (fuso da clínica) · quem enviou, o texto (com as variáveis, como foi escrito) e "Recebida por N clientes".
- Sem a ação **Edita**: o formulário fica desligado e sem rodapé; o histórico aparece.

## Pendências

- Ver, por situação automática, quantos clientes receberam.
- Escolher para quem enviar (filtros de clientes) e agendar o envio.
- Histórico além das 20 mais recentes.

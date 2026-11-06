# Mensagens

Avisos que a clínica manda ao cliente pelo **app do Orari** (notificação push). Regras completas no backend: `business-rules.md`, "Mensagens automáticas" e "Avisos do app".

> Feitas: **Automáticas** (8d) e **Enviar** (8e), em 2026-11-06.

## Acesso

- Grupo **Mensagens** no menu lateral, logo depois do Portal do cliente e antes da Ajuda, com os subitens **Automáticas** (`/mensagens/automaticas`) e **Enviar** (`/mensagens/enviar`).
- Só para o **ADMIN** e só com a funcionalidade **Mensagens** no plano (matriz de acessos, `empresas.md`; ela exige o Portal do cliente). Os demais veem a página "não encontrada", e a API recusa (403).
- Sem a ação **Edita**: tudo só leitura, sem os botões de variável e sem o rodapé de salvar.

## Automáticas (`/mensagens/automaticas`)

Card único que ocupa a página, com o conteúdo rolando e o rodapé fixo (como `portal-do-cliente.md`).

- **Aviso do topo:**
  - portal ligado: "Só recebem os clientes que usam o app do Orari e deixaram os avisos ligados. Cada mensagem sai uma vez só.";
  - portal desligado (em vermelho): "O portal do cliente está desligado: nenhuma mensagem sai até ele ser ligado em Portal do cliente." (com o link).
- **Uma seção por situação**, nesta ordem, cada uma com o interruptor, o título e quando sai:

  | Situação | Quando sai (texto da tela) | Opção |
  | --- | --- | --- |
  | Lembrete | Antes de cada horário marcado, nos tempos escolhidos. | **Enviar antes do horário:** 30 min, 1h, 2h, 24h, 48h (caixas; padrão 24h e 30 min) |
  | Agendamento marcado | Quando a clínica marca um horário avulso para o cliente. | — |
  | Agendamento alterado | Quando a clínica muda a data ou o horário (alterar, remanejar ou repor). | — |
  | Agendamento cancelado | Quando a clínica cancela um horário (avulso, uma sessão ou uma sessão de turma). | — |
  | Aniversário | No dia do aniversário, às 9h (data de nascimento do cadastro). | — |
  | Sentimos sua falta | Às 10h, para quem não volta desde o último atendimento e não tem nada marcado. | **Dias sem vir:** 15, 30, 45, 60 ou 90 (padrão 30) |

- Em cada seção:
  - **Mensagem** (caixa de texto) com o contador "87/500" (vermelho acima de 500);
  - **Inserir:** botões das variáveis da situação, que entram no lugar do cursor: `{nome}`, `{estabelecimento}` e, nas de agendamento, `{data}`, `{hora}`, `{servico}`, `{profissional}`;
  - **Exemplo:** o texto como chega, com dados fictícios (Ana, Pilates, Camila, 12/11, 09:00) e o nome da clínica.
- **Padrão de quem nunca salvou:** lembrete e as três de agendamento ligadas; aniversário e "sentimos sua falta" desligadas, com o texto pronto.
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

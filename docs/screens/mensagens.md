# Mensagens

Avisos que a clínica manda ao cliente pelo **app do Orari** (notificação push). Regras completas no backend: `business-rules.md`, "Mensagens automáticas" e "Avisos do app".

> Feita: **Automáticas** (8d, 2026-11-06). Depois: **Enviar** (mensagens escritas pela clínica, 8e).

## Acesso

- Grupo **Mensagens** no menu lateral, logo depois do Portal do cliente e antes da Ajuda, com o subitem **Automáticas** (`/mensagens/automaticas`).
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

## Pendências

- **Enviar** (campanha) e o histórico do que saiu (8e).
- Ver, por situação, quantos clientes receberam.

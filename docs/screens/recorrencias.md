# Recorrências

> Uma recorrência reserva dias e horários fixos da semana para um cliente, com um
> profissional e um serviço, durante um período, e gera os agendamentos de uma vez.
> Não é fidelização nem pacote (ver "Pacotes").

## Menu e atalho

- Item próprio na sidebar: **Recorrências**.
- Atalho de nova recorrência na barra de ações lateral (abre a página de cadastro).
- Os pacotes (planos e contratações) ficam em um menu separado ("Pacotes").

## Listagem

### Colunas

- Cliente
- Profissional
- Serviço
- Dias (ex.: "Seg 09:00–10:00, Qua 14:00–15:00")
- Período (data inicial a data final)
- Status (Ativa ou Cancelada, conforme `isActive`)
- Ações
  - Visualizar
  - Cancelar recorrência (só nas ativas que não são de pacote)

### Regras específicas

- Filtros: profissional e status, na URL. Filtro por cliente: futuro.
- Paginação como nas demais listagens. A ordem é a da API (data inicial, da mais antiga para a mais nova).
- Botão "Nova recorrência".
- As recorrências geradas por pacote aparecem na lista (a API não filtra por pacote), mas não podem ser canceladas por aqui: são encerradas pelo cancelamento da contratação.

---

## Cadastro

Página própria (`/recorrencias/nova`), não dialog.

### Campos

- Cliente (seleção com busca no servidor).
- Serviço (seleção com busca; apenas serviços ativos e com preço).
- Profissional.
- Data inicial e data final (começam vazias).
- Dias da semana: os sete dias em lista. Ao marcar um dia, a mesma linha exibe a caixa de seleção de período e os horários disponíveis, como no novo agendamento. O horário final é calculado pela duração do serviço.
- Observações.

### Regras específicas

- O cliente deve ser do tipo Cliente e o profissional do tipo Profissional; o serviço deve estar ativo e ter preço (o valor de cada sessão é o preço vigente do serviço).
- É necessário ao menos um dia, com horário.
- A data final não pode ser anterior à inicial, e a data inicial não pode ser no passado.
- **Período:** o tempo da recorrência é definido na tela, com no máximo 12 meses após a data inicial (constante `MAX_RECURRENCE_MONTHS`, que pode ser ajustada).
- **Horários de cada dia:** os horários livres são os da primeira ocorrência daquele dia da semana a partir da data inicial (janela de atendimento e agendamentos do profissional). As demais ocorrências são conferidas pelo servidor ao salvar. Sem profissional, serviço e data inicial, a linha pede que sejam escolhidos. Trocar um deles limpa os horários escolhidos (os dias marcados continuam).
- O rodapé do formulário mostra o resumo: quantas sessões serão geradas e o período (ex.: "26 sessões, de 20/10/2026 a 20/04/2027"). Sessões no passado não são geradas.
- Cada sessão segue as regras de agendamento comum: precisa caber inteira em uma janela de atendimento e não pode conflitar com agendamento do profissional nem do cliente. Não há encaixe em recorrência.
- A criação é tudo ou nada: se qualquer sessão conflitar, nenhuma é criada e a tela exibe o motivo (o servidor informa a data e o horário que conflitaram).
- Cada sessão gerada nasce com um pagamento pendente, vencendo na data da sessão (o Financeiro trata a cobrança).
- Não há dialog de confirmação ao salvar. Após salvar, um aviso informa a quantidade de sessões e o usuário vai para a listagem.

---

## Detalhes da recorrência

- Exibe cliente, profissional, serviço, dias, período, observações e status; nas de pacote, a origem ("Pacote").
- Lista as sessões (data, horário, status), com o ícone de status da agenda.
- Ações:
  - **Editar observações** (dialog). Limpar o campo remove a observação.
  - **Cancelar recorrência:** pede confirmação; cancela as sessões futuras ainda não iniciadas, sem gerar novas, e os pagamentos pendentes delas. Não há reembolso e a recorrência cancelada não é reativada. Não aparece nas de pacote.
  - **Cancelar sessão:** pede confirmação; só antes de iniciar; o horário fica livre e o pagamento pendente da sessão é cancelado.
  - **Remanejar sessão:** nova data e horário (mesmo seletor de horários do novo agendamento), apenas dentro do período da recorrência e antes de iniciar; mantém o pagamento (o vencimento acompanha a nova data) e a quantidade de sessões.
- Os dados da recorrência (cliente, profissional, serviço, dias e período) não são alterados: para mudá-los, cancela-se a recorrência e cria-se outra.
- O pagamento integral (baixa em lote dos pagamentos pendentes) será feito no Financeiro.

---

## Impacto na tela de Agendamentos

- Sessões de recorrência aparecem na agenda como os demais agendamentos, com um ícone de recorrência no bloco, no cartão e nos detalhes ("Recorrente", ou "Sessão de pacote" quando a recorrência é de um pacote). A legenda da agenda inclui o item "Recorrente".
- No dialog de detalhes:
  - **Cancelar:** cancela a sessão pela rota da recorrência, com as mesmas condições (antes de iniciar).
  - **Remanejar:** abre o remanejamento da sessão (dentro do período da recorrência).
  - **Ver recorrência:** abre os detalhes da recorrência. Substitui o "Alterar", que não vale para sessões de recorrência.

---

## Pendências

- Filtro por cliente na listagem.
- Pagamento integral da recorrência (Financeiro).
- Recorrência gerada por pacote: tratada na especificação de Pacotes.

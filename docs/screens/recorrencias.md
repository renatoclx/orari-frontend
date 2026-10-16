# Recorrências

> **Rascunho para revisão.** Itens marcados com ❓ dependem de decisão.
> Uma recorrência reserva dias e horários fixos da semana para um cliente, com um
> profissional e um serviço, durante um período, e gera os agendamentos de uma vez.
> Não é fidelização nem pacote (ver "Pacotes").

## Menu

- Item próprio na sidebar: **Recorrências**.
- Os pacotes (planos e contratações) ficam em um menu separado ("Pacotes").

## Listagem

### Colunas

- Cliente
- Profissional
- Serviço
- Dias (ex.: "Seg 09:00–10:00, Qua 14:00–15:00")
- Período (data inicial a data final)
- Status (Ativa ou Encerrada, conforme `isActive`)
- Ações
  - Visualizar
  - Cancelar recorrência

### Regras específicas

- Filtros: profissional, cliente e status. ❓ Busca por nome do cliente depende do backend (hoje só filtra por código).
- Paginação como nas demais listagens.
- Botão "Nova recorrência".
- ❓ As recorrências geradas por um pacote aparecem aqui? Proposta: não; a lista mostra só recorrências avulsas, e as de pacote ficam na contratação.

---

## Cadastro

### Campos

- Cliente (seleção com busca).
- Serviço (seleção com busca; apenas serviços ativos e com preço).
- Profissional.
- Data inicial.
- Data final (ver "Período").
- Dias da semana: uma lista com um ou mais dias, cada um com dia da semana e horário inicial. O horário final é calculado pela duração do serviço.
- Observações.

### Regras específicas

- O cliente deve ser do tipo Cliente e o profissional do tipo Profissional; o serviço deve estar ativo e ter preço (o valor de cada sessão é o preço vigente do serviço).
- É necessário ao menos um dia. Dois dias no mesmo dia da semana não podem se sobrepor.
- A data final não pode ser anterior à inicial, e a data inicial não pode ser no passado.
- **Período:** o tempo da recorrência é definido na tela. ❓ Proposta: a tela limita a data final a no máximo 12 meses após a data inicial (limite prévio, definido em uma constante, que pode ser ajustado).
- Antes de salvar, um resumo informa quantas sessões serão geradas e o período (ex.: "26 sessões, de 20/10/2026 a 20/04/2027"). Sessões no passado não são geradas.
- Cada sessão segue as regras de agendamento comum: precisa caber inteira em uma janela de atendimento e não pode conflitar com agendamento do profissional nem do cliente. Não há encaixe em recorrência.
- A criação é tudo ou nada: se qualquer sessão conflitar, nenhuma é criada e a tela exibe o motivo. ❓ O ideal é o servidor informar qual data e horário conflitaram (pedido ao backend).
- Cada sessão gerada nasce com um pagamento pendente, vencendo na data da sessão (o Financeiro trata a cobrança).
- Não há dialog de confirmação ao salvar. Após salvar, um aviso informa o período e a quantidade de sessões, e o usuário vai para a listagem.

---

## Detalhes da recorrência

- Exibe cliente, profissional, serviço, período, dias, observações e status.
- Lista as sessões (data, horário, status), com o ícone de status da agenda.
- Ações:
  - **Editar observação.**
  - **Cancelar recorrência:** pede confirmação; cancela as sessões futuras ainda não iniciadas, sem gerar novas, e os pagamentos pendentes delas. Não há reembolso e a recorrência cancelada não é reativada.
  - **Cancelar sessão:** pede confirmação; só antes de iniciar; o horário fica livre e o pagamento pendente da sessão é cancelado.
  - **Remanejar sessão:** escolhe nova data e horário (mesmo seletor de horários do novo agendamento), apenas dentro do período da recorrência e antes de iniciar; mantém o pagamento (o vencimento acompanha a nova data) e a quantidade de sessões.
- Os dados da recorrência (cliente, profissional, serviço, dias e período) não são alterados: para mudá-los, cancela-se a recorrência e cria-se outra.
- ❓ Pagamento integral: baixa em lote dos pagamentos pendentes (método de pagamento e data). Pertence a esta tela ou ao Financeiro?

---

## Impacto na tela de Agendamentos

- Sessões de recorrência aparecem na agenda como os demais agendamentos, com um ícone de recorrência no bloco, no cartão e nos detalhes ("Recorrente").
- No dialog de detalhes, as ações usam as regras da recorrência:
  - **Cancelar agendamento:** cancela a sessão (pela recorrência), com as mesmas condições (antes de iniciar).
  - **Alterar:** vira "Remanejar": só data e horário, dentro do período. Cliente, serviço e profissional não mudam.
  - Há um atalho "Ver recorrência" que abre os detalhes da recorrência.
- ❓ A observação da sessão pode ser editada pela agenda?

---

## Pendências

- Backend: nomes de cliente, profissional e serviço nas respostas da recorrência; informar na sessão (agendamento) que ela é de recorrência e, quando for, de qual pacote; listar as sessões de uma recorrência; informar a data e o horário que conflitaram na criação.
- Recorrência gerada por pacote: tratada na especificação de Pacotes.

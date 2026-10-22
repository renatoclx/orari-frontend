# Financeiro

O Financeiro tem duas telas, que compartilham a mesma baixa de pagamentos:

1. **Comandas** (`/financeiro/comandas`): fechamento do atendimento, no balcão.
2. **Pagamentos** (`/financeiro`): todas as cobranças, com filtros e baixa.

Menu Financeiro, em ordem: Comandas, Pagamentos e Métodos de pagamento
(`metodos-pagamento.md`).

---

## Pagamentos

### Objetivo

Ver e controlar tudo o que a empresa tem a receber e o que já recebeu: sessões
avulsas e de recorrência, parcelas e pagamento integral de pacotes, atrasados e
a vencer. É também onde se dá a baixa.

### Resumo no topo

- Três cartões acima da listagem, cada um com ícone, valor total e quantidade de
  pagamentos:
  - **Atrasado**: pendentes com vencimento anterior a hoje (vermelho);
  - **A vencer**: pendentes com vencimento de hoje em diante ou sem vencimento
    (neutro);
  - **Recebido**: pagos (verde).
- Cada cartão tem uma faixa colorida na borda esquerda; o cartão do filtro
  ativo ganha o fundo tingido.
- Os cartões respeitam o filtro de **vencimento** e o de **cliente**. Ignoram o
  de situação (e o de método), senão, com "Pagos" escolhido, os outros dois
  mostrariam zero.
- Clicar em um cartão aplica a situação correspondente na listagem (Atrasado →
  Atrasados; A vencer → A vencer; Recebido → Pagos); clicar no cartão ativo volta
  ao padrão (Pendentes).
- "Recebido" com filtro de vencimento soma os pagos cujo **vencimento** está no
  período (não a data do pagamento), para os três cartões falarem do mesmo
  conjunto. Pagamento sem vencimento só entra quando não há filtro de
  vencimento.
- Os totais vêm da API (a listagem é paginada).

### Listagem

- Rota: `/financeiro`. Ordem: vencimento mais próximo primeiro; sem vencimento
  no fim. Paginação.
- Colunas:
  - caixa de seleção (só nos pendentes);
  - Vencimento ("--" quando não há);
  - Cliente (link para o histórico dele);
  - Descrição, pela origem: atendimento ("Serviço · dia às hora", com o ícone de
    recorrência quando vier de uma) ou pacote ("Pacote X · parcela" ou
    "pagamento integral", com o ícone de pacote);
  - Valor;
  - Status: Pendente, Atrasado, Pago ou Cancelado;
  - Pago em: data e método ("--" enquanto não pago);
  - Ações: **Dar baixa** (pendentes e atrasados) e o ícone de olho, que abre o
    atendimento (detalhes só para consulta) ou, no pagamento de pacote, a
    contratação (dialog).
- No celular, lista empilhada com as mesmas informações.

### Filtros (na URL)

- Situação: Pendentes (padrão, atrasados + a vencer), Atrasados, A vencer, Pagos,
  Cancelados e Todos.
- Vencimento: de / até.
- Cliente: busca pelo nome (mesmo seletor da listagem de contratações).
- Método de pagamento.
- "Limpar filtros" volta ao padrão. Datas inválidas na URL são ignoradas.
- No celular a barra de filtros não aparece: só os cartões filtram.

### Dar baixa

- Dialog com a descrição do pagamento e o valor (só leitura), o método de
  pagamento (obrigatório; só os ativos) e a data do pagamento (padrão hoje; aceita
  uma data anterior, para lançar uma baixa esquecida; futura é recusada).
- Confirmar grava o pagamento como pago com o método e a data escolhidos, e a
  listagem recarrega. Pagamento pago ou cancelado não tem baixa.

### Baixa em lote

- Marcar vários pendentes **do mesmo cliente** e dar baixa de uma vez, com o
  mesmo método. Ao marcar um, os de outros clientes ficam desabilitados.
- Uma barra acima da lista mostra a quantidade, o total e as ações "Dar baixa em
  lote" e "Limpar seleção". Tudo ou nada: ou todos ficam pagos, ou nenhum.

---

## Comandas

### Objetivo

Fechamento do atendimento, como no appBarber: o cliente está no balcão, a
comanda reúne o que ele deve na visita e o atendente finaliza o pagamento. A
comanda **não é uma entidade**: é a visão do dia de um cliente, montada a partir
dos atendimentos e dos pagamentos que já existem.

### Quem tem comanda no dia

- Todo cliente com **atendimento hoje** (no fuso da empresa) em Agendado,
  Confirmado, Em andamento ou Concluído, mesmo que o pagamento ainda não exista.
  Cancelado e Não compareceu não entram.
- Todo cliente que **pagou algo hoje** (a comanda paga continua na lista).
- Cliente com pendência mas sem atendimento hoje **não** tem comanda: ele é
  cobrado pela tela de Pagamentos.

### Itens da comanda

Três grupos, nesta ordem:

1. **Atendimentos de hoje**: um item por atendimento, com serviço, horário,
   profissional, valor e o ícone de recorrência ou de pacote.
   - Com pagamento pendente: pode ser recebido.
   - Já pago: mostra "Pago" e o método.
   - Avulso ainda não concluído: "Aguardando conclusão", sem valor a receber (o
     pagamento nasce quando o atendimento é concluído). Receber antes de
     concluir (sinal) fica para depois.
   - Sessão de pacote: "Incluído no pacote", sem valor.
2. **Pendências anteriores** do cliente, que não são da visita de hoje:
   pagamentos atrasados, parcela de pacote que vence hoje ou já venceu e pacote
   integral pendente (com ou sem vencimento). Cada uma mostra o vencimento e a
   etiqueta Atrasado. Pagamentos a vencer (futuros) não entram.
3. **Pagos hoje**: o que já foi recebido hoje fora dos atendimentos de hoje, só
   leitura, com o método.

### Listagem

- Rota: `/financeiro/comandas` (acesso rápido na barra da direita, ícone de
  recibo). Cabeçalho com o dia; busca pelo nome do cliente; paginação por
  cliente, em ordem alfabética.
- Colunas: Cliente (link para o histórico), Atendimentos (quantidade hoje), A
  receber hoje (pendente dos atendimentos de hoje), Pendências (soma das
  anteriores), Status e Ações.
- Status: **Aberta** (há algo pendente, de hoje ou anterior) ou **Paga**. Ações:
  **Receber** (aberta) ou o ícone de olho (paga).
- No celular, lista empilhada.

### Dialog da comanda

- Título "Comanda de [cliente]", a data e um link para o histórico do cliente.
- Seções "Atendimentos de hoje", "Pendências anteriores" e "Pagos hoje".
- Itens pendentes têm caixa de seleção: os da visita começam **marcados** e as
  pendências anteriores, **desmarcadas**, para o atendente decidir.
- Total a receber (dos itens marcados), método de pagamento (obrigatório; só os
  ativos) e data do pagamento (padrão hoje), os mesmos campos da baixa em
  Pagamentos.
- Botões: Cancelar e **Finalizar comanda** (desabilitado sem item marcado). A
  baixa é de todos os marcados, tudo ou nada; os desmarcados continuam
  pendentes.
- Na comanda paga, o dialog é só leitura (sem seleção, método ou botão de baixa).

---

## Implementação futura

- Receber antes de o atendimento ser concluído (sinal).
- Vários métodos na mesma comanda (ex.: dinheiro + cartão), desconto, gorjeta,
  produtos, troco e caixa: exigem a entidade Comanda no backend.
- Recibo ou impressão da comanda.
- **Parcelamento no cartão**, taxas por método e valor líquido, junto com a
  conciliação (o método de pagamento precisaria de um marcador "aceita
  parcelas"). Decidido em 2026-10-22: fora do MVP.
- Estorno e cancelamento de pagamento pela tela; exportar a listagem.
- Contas a receber completo: aging dos atrasados, visão por período.

---

## Backend

- `GET /payments`: devolve em cada pagamento `client`, `paymentMethod` (quando
  pago), `recurringAppointmentId` no atendimento e `billingType` no pacote.
- `GET /payments/summary`: totais de atrasado, a vencer e recebido (filtros
  `clientId`, `dueFrom` e `dueTo`).
- `PATCH /payments/settle`: baixa de um ou vários pagamentos do mesmo cliente,
  numa transação, com método ativo e `paidAt` opcional (não pode ser futuro).
- `GET /payments/checkouts`: comandas do dia por cliente (atendimentos de hoje,
  pendências anteriores e totais), paginadas por cliente, com busca pelo nome.

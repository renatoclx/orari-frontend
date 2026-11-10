# Comissões

## Objetivo

Mostrar ao dono a comissão de cada profissional pelos atendimentos concluídos
no período, quanto os clientes já pagaram, o que já foi adiantado e o que
falta pagar. O fechamento entra na próxima etapa.

## Acesso

- Rota: `/financeiro/comissoes`.
- Menu: grupo **Financeiro**, item "Comissões" (o último do grupo), só para o
  **ADMIN** (é remuneração); a API também recusa os demais.
- Funcionalidade em Acessos e limites: `commissions` ("Comissões"):
  Visualiza, Cria (lançar adiantamento) e Exclui (excluir adiantamento); sem a
  ação, o botão e a lixeira somem. Marcada no modelo padrão e nos modelos
  com financeiro (fora do Agenda); exige ver Profissionais e Pagamentos.

## Regras

- A comissão é gerada sozinha na conclusão do atendimento, pela regra do
  serviço (ver `servicos.md` e "Comissão" em `business-rules.md` do backend).
  Cancelado não gera; nada é retroativo.
- Período pela **data do atendimento**, no fuso da empresa.
- **Cliente pagou**: avulso com o pagamento pago = **Pago** (senão **A
  receber**); sessão de pacote = a parte da base na proporção do que a
  contratação já recebeu (**Parcial**, com o valor, quando não chega à base).
- **Em aberto** = ainda não fechado. Adiantado e A pagar contam tudo o que
  está em aberto, **sem depender do período**; o período vale para a comissão
  gerada, o pago pelos clientes e os atendimentos.
- **Adiantamento**: data até hoje (pode ser passada, nunca futura) e valor até
  o **disponível para adiantar** (comissão em aberto − já adiantado). Pode ser
  excluído enquanto não houver fechamento.

## Layout

- Cabeçalho com título, descrição e **Lançar adiantamento** (`Plus`, ação
  principal; sem impressão nesta etapa).
- Filtros (na URL): **Profissional** ("Todos os profissionais" por padrão; só
  os ativos) e **Período** (padrão: mês atual; no celular fica só o
  profissional).
- Quatro cartões (`SummaryCard`): **Comissão gerada** (verde, com os
  atendimentos do período), **Já pago pelos clientes** (% da base),
  **Adiantado** e **A pagar** (em aberto).
- **Sem profissional**: lista **Por profissional** (atendimentos, comissão,
  pago pelos clientes, adiantado, a pagar), do maior valor para o menor; quem
  só tem saldo em aberto também aparece. O olho (`Eye`) filtra o profissional
  mantendo o período.
- **Com profissional**: o quadro tem abas por link (`?aba=`):
  - **Atendimentos (N)**: data, cliente, serviço — com "(pacote)" na sessão de
    pacote —, base, regra "40%" ou "R$ 15,00 fixo", comissão e cliente pagou,
    do mais recente, 10 por página;
  - **Adiantamentos (N)**: data, valor, observação, lançado por e a lixeira.
  No celular, cartões.
- **Lançar adiantamento** (dialog, `sm:max-w-lg`): Profissional (já vem o do
  filtro) e Data (hoje; nada futuro) lado a lado, Valor (R$) com "Disponível
  para adiantar: R$ X" embaixo (atualiza ao trocar o profissional) e
  Observação; erro no próprio campo (ex.: "O valor passa do disponível para
  adiantar."). Botões Cancelar e **Lançar** ("Lançando…").
- **Excluir adiantamento**: `ConfirmDialog` vermelho com "O adiantamento de
  R$ X para <profissional>, lançado em <data>, deixa de ser abatido no
  fechamento.", botões Voltar e Excluir ("Excluindo…"); aviso ao terminar.

## Fora desta etapa

- Fechamento (etapa 5).
- Impressão e exportação.
- Percentual diferente por profissional (hoje só "recebe ou não recebe", no
  cadastro do profissional).

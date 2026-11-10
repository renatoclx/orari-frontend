# Comissões

## Objetivo

Mostrar ao dono a comissão de cada profissional pelos atendimentos concluídos
no período e quanto os clientes já pagaram desses atendimentos. Adiantamentos
e fechamento entram nas próximas etapas.

## Acesso

- Rota: `/financeiro/comissoes`.
- Menu: grupo **Financeiro**, item "Comissões" (o último do grupo), só para o
  **ADMIN** (é remuneração); a API também recusa os demais.
- Funcionalidade em Acessos e limites: `commissions` ("Comissões"), por ora só
  Visualiza. Marcada no modelo padrão e nos modelos com financeiro (fora do
  Agenda); exige ver Profissionais e Pagamentos.

## Regras

- A comissão é gerada sozinha na conclusão do atendimento, pela regra do
  serviço (ver `servicos.md` e "Comissão" em `business-rules.md` do backend).
  Cancelado não gera; nada é retroativo.
- Período pela **data do atendimento**, no fuso da empresa.
- **Cliente pagou**: avulso com o pagamento pago = **Pago** (senão **A
  receber**); sessão de pacote = a parte da base na proporção do que a
  contratação já recebeu (**Parcial**, com o valor, quando não chega à base).

## Layout

- Cabeçalho com título e descrição (sem impressão nesta etapa).
- Filtros (na URL): **Profissional** ("Todos os profissionais" por padrão; só
  os ativos) e **Período** (padrão: mês atual; no celular fica só o
  profissional).
- Três cartões (`SummaryCard`): **Comissão gerada** (verde, com a base),
  **Já pago pelos clientes** (% da base) e **Atendimentos**.
- **Sem profissional**: lista **Por profissional** (atendimentos, base,
  comissão, pago pelos clientes), do maior valor para o menor; o olho (`Eye`)
  filtra o profissional mantendo o período.
- **Com profissional**: lista **Atendimentos** (data, cliente, serviço — com
  "(pacote)" na sessão de pacote —, base, regra "40%" ou "R$ 15,00 fixo",
  comissão e cliente pagou), do mais recente, 10 por página. No celular,
  cartões.

## Fora desta etapa

- Adiantamentos (etapa 4) e fechamento (etapa 5).
- Impressão e exportação.
- Exceção de comissão por profissional.

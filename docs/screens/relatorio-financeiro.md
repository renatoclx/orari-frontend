# Relatório financeiro

## Objetivo

Mostrar ao dono o que **entrou no caixa** no período: quanto, de onde
(atendimentos ou pacotes) e por qual método de pagamento. Complementa
a Análise de recebíveis (o que falta receber) e os Rankings (o faturado).

## Acesso

- Rota: `/relatorios/financeiro`.
- Menu: grupo **Relatórios** (um nível só), item "Financeiro". Só o
  **ADMIN**; a API também recusa os demais.
- Funcionalidade em Acessos e limites, só com a ação Visualiza:
  `financial-report` ("Financeiro"). Marcada no modelo padrão e nos modelos de
  plano; exige ver Pagamentos.

## Regras

- Só pagamentos **pagos** e não excluídos, pela **data do pagamento**, no fuso
  da empresa.
- **Origem**: pagamento de atendimento ou de contratação de pacote.
- Pagamento sem método aparece como "Sem método".

## Layout

- Cabeçalho com título, descrição e **Imprimir** (só no computador).
- Filtros (na URL): **Método de pagamento** ("Todos os métodos" por padrão;
  ativos e inativos, porque um inativo pode ter recebido no período) e
  **Período** (padrão: mês atual). No celular fica só o método.
- Quatro cartões (`SummaryCard`): **Recebido** (verde, com a quantidade de
  pagamentos), **Ticket médio** (por pagamento), **Atendimentos** e
  **Pacotes** (valor e quantidade de cada origem).
- Lado a lado em telas largas (`xl`), empilhados abaixo disso:
  - **Recebido no período**: por dia (até 62 dias) ou semana, barras
    empilhadas de Atendimentos (índigo) e Pacotes (verde), com o total na dica.
  - **Por método de pagamento**: a tabela dos Rankings (posição e barra
    proporcional ao valor), com pagamentos, recebido e % do recebido.
- **Extrato**: data, cliente, origem ("Atendimento · serviço" ou
  "Pacote · nome"), método e valor, do mais recente para o mais antigo,
  paginado (10 por página). No celular, cartões.
- **Imprimir**: mesma versão de impressão dos demais relatórios, com o extrato
  inteiro a partir da segunda folha.

## Fora desta etapa

- Saídas e despesas (Caixa e Fluxo de caixa ficam para depois).
- Recebido por serviço e por profissional (estão nos Rankings, pelo faturado).
- Exportar em planilha.

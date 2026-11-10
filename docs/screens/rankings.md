# Rankings

## Objetivo

Mostrar quais serviços, profissionais e clientes mais movimentaram o período,
por faturamento ou por quantidade.

## Acesso

- Rota: `/relatorios/rankings`.
- Menu: grupo **Relatórios** (um nível só), item "Rankings". Só o **ADMIN**; a
  API também recusa os demais.
- Funcionalidade em Acessos e limites, só com a ação Visualiza: `rankings`
  ("Rankings"). Marcada no modelo padrão e nos modelos de plano; exige ver
  Agendamentos e Pagamentos.

## Regras

- Base: atendimentos **concluídos** no período. **Faturado** = pagamentos
  (recebidos e pendentes) desses atendimentos, a mesma conta da Carteira de
  clientes.
- **Sessão de pacote** conta na quantidade, sem valor (o pagamento é da
  contratação; o rateio por sessão fica para a comissão).
- **Clientes** somam ao faturado os **pacotes contratados no período** (coluna
  "Em pacotes"); o ticket médio continua só dos atendimentos.
- **Ticket médio** = faturado ÷ atendimentos concluídos com pagamento.

## Layout

- Cabeçalho com título, descrição e **Imprimir** (só no computador).
- Filtros (na URL): **Período** (padrão: mês atual) e **Ordem** (faturamento,
  padrão, ou quantidade). No celular fica só a ordem.
- Quatro cartões (`SummaryCard`): **Faturado**, **Concluídos**, **Ticket
  médio** e **Pacotes contratados**.
- Três tabelas, uma embaixo da outra, com os **10 primeiros** na tela:
  - **Serviços**: concluídos, faturado, ticket médio e % do faturado;
  - **Profissionais**: concluídos, faturado, ticket médio e clientes atendidos;
  - **Clientes**: visitas, faturado, em pacotes e última visita.
- Cada linha tem a posição (1º, 2º…) e, embaixo do nome, uma barra fina
  proporcional ao critério da ordem (índigo dos gráficos).
- **Imprimir**: mesma versão de impressão dos demais relatórios, com as
  **listas inteiras**.

## Fora desta etapa

- Ranking por comissão (bloco 3).
- Comparar com o período anterior.
- Exportar em planilha.

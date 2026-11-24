# Relatório de pacotes

## Objetivo

Mostrar ao dono a vida das contratações de pacote: quantas entraram e saíram
no período, quais pacotes vendem mais e quem está para terminar (a chance de
renovar). Os valores recebidos e em atraso ficam no Financeiro e no Contas a
receber.

## Acesso

- Rota: `/relatorios/pacotes`.
- Menu: grupo **Relatórios** (um nível só), item "Pacotes". Só o **ADMIN**; a
  API também recusa os demais.
- Funcionalidade em Acessos e limites, só com a ação Visualiza:
  `packages-report` ("Pacotes"). Marcada no modelo padrão e nos modelos de
  plano; exige ver Contratações.

## Regras

- **Novas**: pela data da contratação, com o valor contratado. **Canceladas**:
  pela data do cancelamento. As duas no período.
- **Ativas hoje**: não canceladas e com data final de hoje em diante (as que
  ainda vão começar entram). Vale o período contratado, mesmo sem sessões
  restantes.
- **Terminando em 30 dias**: ativas com fim até hoje + 30 dias, quando o
  cliente não tem outra ativa terminando depois (ainda não renovou).
- **Sessões**: concluídas de quantas a contratação tem, sem as canceladas.

## Layout

- Cabeçalho com título, descrição e **Imprimir** (só no computador).
- Filtro (na URL): **Período** (padrão: mês atual). No celular a barra some.
- Quatro cartões (`SummaryCard`): **Contratações novas** (verde, com o valor
  contratado), **Ativas hoje**, **Canceladas** (vermelho quando há) e
  **Terminando em 30 dias**.
- **Por pacote**: a tabela dos Rankings (posição e barra proporcional ao valor
  contratado), com novas, valor contratado, ativas hoje e canceladas.
- **Terminando em 30 dias**: cliente, pacote, data final, sessões concluídas
  ("18 de 24") e o atalho do WhatsApp (só com celular), do fim mais próximo;
  paginada (10 por página). No celular, cartões.
- **Imprimir**: mesma versão de impressão dos demais relatórios, com a lista
  inteira e o celular do cliente.

## Fora desta etapa

- Gráfico mês a mês das contratações.
- Atalho para contratar de novo a partir da lista.
- Exportar em planilha.

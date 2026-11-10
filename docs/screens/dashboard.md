# Dashboard

## Objetivo

Juntar numa tela só, de forma visual, os principais números da empresa:
métricas e gráficos dos relatórios, sem listas nem extratos. Cada grupo leva
ao relatório completo.

## Acesso

- Rota: `/dashboard`.
- Menu: item próprio **Dashboard** (ícone `LayoutDashboard`), no **topo** da
  sidebar. Só o **ADMIN**. A página inicial continua sendo a agenda.
- Funcionalidade em Acessos e limites, só com a ação Visualiza: `dashboard`
  ("Dashboard"). Marcada no modelo padrão e nos modelos de plano.
- Cada bloco só aparece quando a empresa tem a funcionalidade do relatório de
  origem; sem nenhum relatório liberado, a tela mostra um aviso.

## Regras

- Sem rota própria na API: os dados vêm das rotas dos relatórios, então os
  números são sempre os mesmos dos relatórios.
- **Comparação**: um mês inteiro com o mês anterior inteiro; outro período com
  os dias logo antes, do mesmo tamanho. Variação em % ("+12% vs. mês
  anterior"); a taxa de falta em pontos percentuais. Sem nada no anterior:
  "Nada no … para comparar"; valor igual: "Igual ao …".

## Layout

- Título, descrição (com "mês anterior" ou "período anterior") e o filtro de
  **Período** na URL (padrão: mês atual; some no celular). Sem impressão.
- Métricas (`SummaryCard`, três por linha no computador, duas no celular):
  **Recebido**, **Atendimentos concluídos**, **Taxa de falta**, **Clientes
  novos** (com a comparação), **Clientes ativos hoje** e **Em atraso hoje**
  (a situação de hoje, sem comparação).
- Grupos, cada um com o nome do relatório em caixa alta e **Ver relatório**
  (`Eye`), dois blocos por linha em telas largas, reaproveitando os
  componentes dos relatórios:
  - **Financeiro**: recebido no período e **por método de pagamento em
    rosca** (`PaymentMethodDonut`): o total no centro e a legenda com valor e
    %. Cores categóricas (`chart-cat-1..5`, validadas nos dois temas), pela
    ordem do cadastro de métodos (alfabética), para a cor seguir o método e
    não a posição no período; o 6º método em diante e os pagamentos sem
    método somam em "Outros", em cinza;
  - **Agendamentos**: agendamentos no período e horários de pico;
  - **Rankings**: top 5 serviços e top 5 profissionais (concluídos e
    faturado);
  - **Perfil do cliente**: tipo de atendimento e por onde agendam;
  - **Contas a receber** (atraso por tempo) e **Pacotes** (por pacote): lado a
    lado só em telas bem largas (`2xl`).

## Fora desta etapa

- Impressão e atualização automática.
- Escolher quais blocos aparecem.
